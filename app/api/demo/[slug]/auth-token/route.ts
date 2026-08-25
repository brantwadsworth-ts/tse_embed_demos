import { NextRequest, NextResponse } from "next/server";
import { getDemoById } from "@/lib/demos";
import { getTsSecret } from "@/lib/tsSecrets";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const demo = await getDemoById(slug);
  if (!demo) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const secret = getTsSecret(demo.tsInstance);
  if (!secret) {
    return NextResponse.json(
      { error: "Trusted auth not configured for this demo." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({})) as { username?: string };
  const username =
    body.username ||
    demo.demoUsers?.[0]?.tsUsername ||
    "demo";

  const tokenUrl = `${demo.tsInstance}/callosum/v1/session/auth/token`;
  const formBody = new URLSearchParams({
    secret_key: secret,
    username,
    access_level: "FULL",
  });

  let tsRes: Response;
  try {
    tsRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });
  } catch (err) {
    console.error("ThoughtSpot token fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach ThoughtSpot." },
      { status: 502 },
    );
  }

  if (!tsRes.ok) {
    const text = await tsRes.text().catch(() => tsRes.statusText);
    console.error("ThoughtSpot token error:", tsRes.status, text);
    return NextResponse.json(
      { error: `ThoughtSpot returned ${tsRes.status}.` },
      { status: 502 },
    );
  }

  const token = await tsRes.text();
  return NextResponse.json({ token: token.trim() });
}
