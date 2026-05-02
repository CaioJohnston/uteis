import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

function getToken(req: NextRequest) {
  return req.cookies.get("gh_token")?.value;
}

function controlUrl(name: string) {
  return `https://${name}-8081.preview.app.github.dev`;
}

function setPortPublic(name: string, token: string) {
  fetch(`${GITHUB_API}/user/codespaces/${name}/ports/8081`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visibility: "public" }),
  }).catch(() => {});
}

// GET — server status from control server
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  try {
    const res = await fetch(`${controlUrl(name)}/status`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    setPortPublic(name, token);
    return NextResponse.json({ running: false, reachable: false }, { status: 503 });
  }
}

// POST — send command to Minecraft via control server
export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const { command } = await req.json();
  if (!command) return NextResponse.json({ error: "Missing command" }, { status: 400 });

  try {
    const res = await fetch(`${controlUrl(name)}/cmd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Control server not reachable" }, { status: 503 });
  }
}
