import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { getAccessTokenForUser } from "@/lib/thoughtspot";

// Cookieless trusted-auth token endpoint for the ThoughtSpot Visual Embed
// SDK. Called from the browser via `getAuthToken` in LiveboardEmbedView.
// The secret key never leaves the server.
export async function POST() {
  const cookieStore = await cookies();
  const username = cookieStore.get(SESSION_COOKIE)?.value;

  if (!username) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  try {
    const token = await getAccessTokenForUser(username);
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate token." },
      { status: 502 },
    );
  }
}
