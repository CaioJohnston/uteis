import { NextRequest, NextResponse } from "next/server";

const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action === "logout") {
    const res = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/tools/minehost/usar`
    );
    res.cookies.delete("gh_token");
    return res;
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth/github/callback`,
    scope: "codespace",
    state,
  });

  const res = NextResponse.redirect(`${GITHUB_OAUTH_URL}?${params}`);
  res.cookies.set("gh_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return res;
}
