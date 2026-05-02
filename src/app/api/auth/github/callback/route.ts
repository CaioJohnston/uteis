import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get("gh_state")?.value;

  const base = process.env.NEXT_PUBLIC_URL!;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${base}/tools/minehost/usar?error=auth_failed`);
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await tokenRes.json();

  if (!data.access_token) {
    return NextResponse.redirect(`${base}/tools/minehost/usar?error=auth_failed`);
  }

  const res = NextResponse.redirect(`${base}/tools/minehost/usar`);
  res.cookies.set("gh_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  res.cookies.delete("gh_state");
  return res;
}
