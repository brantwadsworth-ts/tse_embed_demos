import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demoUsers";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  if (!(await getDemoUser(username))) {
    return NextResponse.json(
      { error: "Unrecognized demo user." },
      { status: 401 },
    );
  }

  // Demo login only checks that a password was entered — any value is
  // accepted. Real deployments should replace this with actual auth.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, username, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
