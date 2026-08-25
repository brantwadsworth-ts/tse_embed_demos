import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveApiKey, hasApiKey, deleteApiKey } from "@/lib/apikeys";

// GET — returns { hasKey: boolean } (never returns the actual key)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const login = (session.user as { login?: string }).login ?? "";
  const has = await hasApiKey(login);
  return NextResponse.json({ hasKey: has });
}

// POST — body: { key: string } — saves the key
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const login = (session.user as { login?: string }).login ?? "";
  const { key } = (await request.json()) as { key?: string };
  if (!key || typeof key !== "string" || !key.trim()) {
    return NextResponse.json({ error: "A non-empty key is required." }, { status: 400 });
  }
  await saveApiKey(login, key.trim());
  return NextResponse.json({ ok: true });
}

// DELETE — removes the key blob
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const login = (session.user as { login?: string }).login ?? "";
  await deleteApiKey(login);
  return NextResponse.json({ ok: true });
}
