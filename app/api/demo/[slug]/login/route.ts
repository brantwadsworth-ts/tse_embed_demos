import { NextRequest, NextResponse } from "next/server";
import { getDemoById } from "@/lib/demos";

/**
 * Server-side proxy for ThoughtSpot Basic auth login.
 * The browser calls this endpoint; we make the actual fetch to ThoughtSpot
 * server-side so CORS never applies.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const demo = await getDemoById(slug);
  if (!demo) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({})) as {
    username?: string;
    password?: string;
  };

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "username and password are required." }, { status: 400 });
  }

  const loginUrl = `${demo.tsInstance}/callosum/v1/session/login`;

  let tsRes: Response;
  try {
    tsRes = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not reach ThoughtSpot instance: ${String(err)}` },
      { status: 502 },
    );
  }

  if (!tsRes.ok) {
    const text = await tsRes.text().catch(() => tsRes.statusText);
    let message = `ThoughtSpot login failed (${tsRes.status})`;
    try {
      const json = JSON.parse(text) as { debug?: string[] };
      const detail = json.debug?.[0];
      if (detail) message = detail;
    } catch { /* use raw text */ }
    return NextResponse.json({ error: message }, { status: tsRes.status === 401 ? 401 : 502 });
  }

  // Forward Set-Cookie headers from ThoughtSpot so the SDK can use them
  const setCookies = tsRes.headers.getSetCookie?.() ?? [];
  const response = NextResponse.json({ ok: true });
  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}
