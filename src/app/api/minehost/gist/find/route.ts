import { NextRequest, NextResponse } from "next/server";

// GET /api/minehost/gist/find?name={codespace_name}
// Searches user's gists for one tagged "minehost-state" created recently.
// Used as fallback when localStorage has no gist_id for a known codespace.
export async function GET(req: NextRequest) {
  const token = req.cookies.get("gh_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const res = await fetch("https://api.github.com/gists?per_page=100", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return NextResponse.json({ gist_id: null });

  const gists = await res.json() as Array<{ id: string; description: string; created_at: string }>;
  const matches = gists
    .filter((g) => g.description === "minehost-state")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return NextResponse.json({ gist_id: matches[0]?.id ?? null });
}
