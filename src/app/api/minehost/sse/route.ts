import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GITHUB_API = "https://api.github.com";

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

export async function GET(req: NextRequest) {
  const token = req.cookies.get("gh_token")?.value;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const name = req.nextUrl.searchParams.get("name");
  if (!name) return new Response("Missing name", { status: 400 });

  try {
    const upstream = await fetch(`${controlUrl(name)}/sse`, {
      signal: req.signal,
    });

    if (!upstream.ok || !upstream.body) {
      setPortPublic(name, token);
      return new Response("Control server not reachable", { status: 503 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    setPortPublic(name, token);
    return new Response("Control server not reachable", { status: 503 });
  }
}
