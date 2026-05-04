import { NextRequest, NextResponse } from "next/server";
import _sodium from "libsodium-wrappers";

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

async function encryptSecret(b64Key: string, value: string): Promise<string> {
  await _sodium.ready;
  const keyBytes = Buffer.from(b64Key, "base64");
  const valueBytes = Buffer.from(value, "utf8");
  const encrypted = _sodium.crypto_box_seal(valueBytes, keyBytes);
  return Buffer.from(encrypted).toString("base64");
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

// POST — create a new codespace (with gist + codespace secrets for communication)
export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    machine = "basicLinux32gb",
    serverType = "vanilla",
    version = "latest",
    jvmArgs = "-Xmx4g -Xms2g",
    cfUrl = "",
    playitToken = "",
  } = body;

  // 1. Create gist (communication channel between Codespace and hub)
  const gistRes = await fetch(`${GITHUB_API}/gists`, {
    method: "POST",
    headers: ghHeaders(token),
    body: JSON.stringify({
      description: "minehost-state",
      public: false,
      files: {
        "state.json": {
          content: JSON.stringify({ running: false, log: [], cursor: 0, pending_cmd: null, updated: 0 }),
        },
      },
    }),
  });

  if (!gistRes.ok) {
    const err = await gistRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "Failed to create gist (ensure gist scope is authorized)" },
      { status: gistRes.status }
    );
  }

  const gistData = await gistRes.json();
  const gist_id: string = gistData.id;

  // 2. Fetch template repo ID + Codespace secrets public key (in parallel)
  const [repoRes, pkRes] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${TEMPLATE_REPO}`, { headers: ghHeaders(token) }),
    fetch(`${GITHUB_API}/user/codespaces/secrets/public-key`, { headers: ghHeaders(token) }),
  ]);

  if (!pkRes.ok) {
    fetch(`${GITHUB_API}/gists/${gist_id}`, { method: "DELETE", headers: ghHeaders(token) }).catch(() => {});
    return NextResponse.json({ error: "Failed to fetch Codespace secrets public key" }, { status: 500 });
  }

  const repoData = repoRes.ok ? await repoRes.json() : null;
  const repoId: number | null = repoData?.id ?? null;
  const { key_id, key: publicKey } = await pkRes.json() as { key_id: string; key: string };

  // 3. Encrypt and set all Codespace secrets (these ARE available as env vars, unlike environment_variables)
  const secrets: Record<string, string> = {
    MINEHOST_GIST_ID: gist_id,
    MINEHOST_TOKEN: token,
    MINEHOST_TYPE: serverType,
    MINEHOST_VERSION: version,
    MINEHOST_JVM: jvmArgs,
    ...(cfUrl ? { MINEHOST_CF_URL: cfUrl } : {}),
    ...(playitToken ? { MINEHOST_PLAYIT_TOKEN: playitToken } : {}),
  };

  // If no playit token provided, delete any stale MINEHOST_PLAYIT_TOKEN from previous runs.
  // Stale secrets persist across Codespace creations and would incorrectly trigger Fluxo A.
  if (!playitToken) {
    fetch(`${GITHUB_API}/user/codespaces/secrets/MINEHOST_PLAYIT_TOKEN`, {
      method: "DELETE",
      headers: ghHeaders(token),
    }).catch(() => {});
  }

  const secretResults = await Promise.all(
    Object.entries(secrets).map(async ([name, value]) => {
      const encrypted_value = await encryptSecret(publicKey, value);
      const secretBody: Record<string, unknown> = { encrypted_value, key_id };
      if (repoId) {
        secretBody.visibility = "selected";
        secretBody.selected_repository_ids = [repoId];
      }
      const r = await fetch(`${GITHUB_API}/user/codespaces/secrets/${name}`, {
        method: "PUT",
        headers: ghHeaders(token),
        body: JSON.stringify(secretBody),
      });
      return { name, ok: r.ok || r.status === 204, status: r.status };
    })
  );

  const failed = secretResults.filter((r) => !r.ok);
  if (failed.length > 0) {
    fetch(`${GITHUB_API}/gists/${gist_id}`, { method: "DELETE", headers: ghHeaders(token) }).catch(() => {});
    return NextResponse.json(
      { error: `Failed to set Codespace secrets: ${failed.map((r) => r.name).join(", ")}` },
      { status: 500 }
    );
  }

  // 4. Create Codespace — secrets already set, will be injected as env vars on start
  const res = await fetch(`${GITHUB_API}/repos/${TEMPLATE_REPO}/codespaces`, {
    method: "POST",
    headers: ghHeaders(token),
    body: JSON.stringify({ machine }),
  });

  const data = await res.json();
  if (!res.ok) {
    fetch(`${GITHUB_API}/gists/${gist_id}`, { method: "DELETE", headers: ghHeaders(token) }).catch(() => {});
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? "Failed to create codespace" },
      { status: res.status }
    );
  }

  return NextResponse.json({ codespace: data, gist_id });
}

// DELETE — delete codespace by name and its associated gist
export async function DELETE(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const gist_id = req.nextUrl.searchParams.get("gist_id");

  const res = await fetch(`${GITHUB_API}/user/codespaces/${name}`, {
    method: "DELETE",
    headers: ghHeaders(token),
  });

  if (res.status !== 204 && !res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (data as { message?: string }).message ?? "Failed to delete" },
      { status: res.status }
    );
  }

  // Best-effort gist cleanup — don't fail the response if this errors
  if (gist_id) {
    fetch(`${GITHUB_API}/gists/${gist_id}`, {
      method: "DELETE",
      headers: ghHeaders(token),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
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
