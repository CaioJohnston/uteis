import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

function getToken(req: NextRequest) {
  return req.cookies.get("gh_token")?.value;
}

function ghJson(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function readGist(token: string, gist_id: string) {
  const res = await fetch(`${GITHUB_API}/gists/${gist_id}`, {
    headers: ghJson(token),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = data.files?.["state.json"]?.content;
  if (!content) return null;
  return JSON.parse(content) as Record<string, unknown>;
}

async function writeGist(token: string, gist_id: string, state: Record<string, unknown>) {
  await fetch(`${GITHUB_API}/gists/${gist_id}`, {
    method: "PATCH",
    headers: ghJson(token),
    body: JSON.stringify({ files: { "state.json": { content: JSON.stringify(state) } } }),
    signal: AbortSignal.timeout(8000),
  });
}

// GET — status + log + server info from gist
export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gist_id = req.nextUrl.searchParams.get("gist_id");
  if (!gist_id) return NextResponse.json({ running: false, reachable: false }, { status: 400 });

  try {
    const state = await readGist(token, gist_id);
    if (!state) return NextResponse.json({ running: false, reachable: false }, { status: 503 });
    return NextResponse.json({
      running: state.running ?? false,
      reachable: true,
      stage: (state.stage as string | null) ?? null,
      log: state.log ?? [],
      cursor: state.cursor ?? 0,
      updated: state.updated ?? 0,
      server_ip: state.server_ip ?? null,
      config: state.config ?? null,
      ram: state.ram ?? null,
    });
  } catch {
    return NextResponse.json({ running: false, reachable: false }, { status: 503 });
  }
}

// POST — write pending command to gist
export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gist_id = req.nextUrl.searchParams.get("gist_id");
  if (!gist_id) return NextResponse.json({ error: "Missing gist_id" }, { status: 400 });

  const { command } = await req.json();
  if (!command) return NextResponse.json({ error: "Missing command" }, { status: 400 });

  try {
    const state = (await readGist(token, gist_id)) ?? {};
    state.pending_cmd = command;
    await writeGist(token, gist_id, state);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gist write failed" }, { status: 503 });
  }
}
