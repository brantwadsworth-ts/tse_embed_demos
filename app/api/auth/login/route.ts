import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, checkPassword, checkEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!checkEmail(email)) {
    return NextResponse.json({ error: "A @thoughtspot.com email is required." }, { status: 401 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
