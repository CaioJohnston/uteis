import { NextRequest, NextResponse } from "next/server";

const TEMPLATE_REPO = "CaioJohnston/minecraft-server-template";
const GITHUB_API = "https://api.github.com";

function getToken(req: NextRequest) {
  return req.cookies.get("gh_token")?.value;
}

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

// GET — fetch specific codespace by name OR list all MineHost codespaces
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = req.nextUrl.searchParams.get("name");

  // Specific codespace — bypasses filter (used when polling after creation)
  if (name) {
    const res = await fetch(`${GITHUB_API}/user/codespaces/${name}`, {
      headers: ghHeaders(token),
    });
    if (res.status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json({ codespace: data });
  }

  // List all — filter by template repo to find existing MineHost codespace on page load
  const res = await fetch(`${GITHUB_API}/user/codespaces?per_page=100`, {
    headers: ghHeaders(token),
  });

  if (res.status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!res.ok) return NextResponse.json({ error: "GitHub API error" }, { status: res.status });

  const data = await res.json();
  const codespaces = (data.codespaces ?? []).filter(
    (c: { repository: { full_name: string } }) =>
      c.repository?.full_name === TEMPLATE_REPO
  );

  return NextResponse.json({ codespaces });
}

// POST — create a new codespace
export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    machine = "basicLinux32gb",
    serverType = "vanilla",
    version = "latest",
    jvmArgs = "-Xmx2048m -Xms1024m",
  } = body;

  const res = await fetch(`${GITHUB_API}/repos/${TEMPLATE_REPO}/codespaces`, {
    method: "POST",
    headers: ghHeaders(token),
    body: JSON.stringify({
      machine,
      environment_variables: {
        MINEHOST_TYPE: serverType,
        MINEHOST_VERSION: version,
        MINEHOST_JVM: jvmArgs,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message ?? "Failed to create codespace" },
      { status: res.status }
    );
  }

  return NextResponse.json({ codespace: data });
}

// DELETE — delete codespace by name
export async function DELETE(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const res = await fetch(`${GITHUB_API}/user/codespaces/${name}`, {
    method: "DELETE",
    headers: ghHeaders(token),
  });

  if (res.status === 204 || res.ok) return NextResponse.json({ ok: true });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(
    { error: (data as { message?: string }).message ?? "Failed to delete" },
    { status: res.status }
  );
}

// PATCH — start or stop a codespace
export async function PATCH(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, action } = await req.json();
  if (!name || !["start", "stop"].includes(action)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const res = await fetch(`${GITHUB_API}/user/codespaces/${name}/${action}`, {
    method: "POST",
    headers: ghHeaders(token),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? "Action failed" },
      { status: res.status }
    );
  }

  return NextResponse.json({ codespace: data });
}
