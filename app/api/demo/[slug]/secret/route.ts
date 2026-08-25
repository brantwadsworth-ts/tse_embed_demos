import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDemoById } from "@/lib/demos";
import { saveTsSecret, hasTsSecret } from "@/lib/tsSecrets";

// GET /api/demo/[slug]/secret — returns { configured: boolean }, never the secret
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await params;
  const demo = await getDemoById(slug);
  if (!demo) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const configured = await hasTsSecret(demo.tsInstance);
  return NextResponse.json({ configured });
}

// POST /api/demo/[slug]/secret — saves the trusted auth secret
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await params;
  const demo = await getDemoById(slug);
  if (!demo) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({})) as { secret?: string };
  if (!body.secret || typeof body.secret !== "string") {
    return NextResponse.json({ error: "secret is required." }, { status: 400 });
  }

  await saveTsSecret(demo.tsInstance, body.secret);
  return NextResponse.json({ ok: true });
}
