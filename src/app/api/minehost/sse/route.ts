// SSE replaced by polling — ConsolePanel now polls /api/minehost/server directly.
// This file kept as a stub to avoid 404s during the transition.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Use polling via /api/minehost/server" }, { status: 410 });
}
