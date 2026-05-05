import { NextRequest, NextResponse } from "next/server";

function getToken(req: NextRequest): string | null {
  return req.cookies.get("gh_token")?.value ?? null;
}

// segments = [codespace-name, ...path]  e.g. ["my-codespace", "status"]
function upstreamUrl(segments: string[]): string {
  const [codespace, ...rest] = segments;
  return `https://${codespace}-8081.app.github.dev/${rest.join("/")}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { segments } = await params;
  const url = upstreamUrl(segments);
  const isSSE = segments.at(-1) === "sse";

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      ...(isSSE ? {} : { signal: AbortSignal.timeout(6000) }),
    });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse(null, { status: upstream.status || 503 });
    }

    const contentType = upstream.headers.get("Content-Type") ?? "application/json";
    // If GitHub returned an HTML auth page instead of JSON/SSE, bail out
    if (contentType.includes("text/html")) {
      return new NextResponse(null, { status: 503 });
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        ...(isSSE ? { "X-Accel-Buffering": "no" } : {}),
      },
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ segments: string[] }> }
) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { segments } = await params;
  const url = upstreamUrl(segments);
  const body = await req.text();
  const secret = req.headers.get("X-Minehost-Secret");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (secret) headers["X-Minehost-Secret"] = secret;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Upstream unreachable" }, { status: 503 });
  }
}
