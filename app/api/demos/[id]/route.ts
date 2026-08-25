import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Demo } from "@/lib/demos";
import { readDemos, writeDemos } from "@/lib/store";

// PATCH /api/demos/[id]  — owner-only update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const login = (session.user as { login?: string }).login ?? "";
  const { id } = await params;

  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const existing = demos[idx];

  if (existing.owner && existing.owner !== login) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const patch = await request.json();
  // Never allow id or owner to be overwritten via patch body
  const updated: Demo = { ...existing, ...patch, id, owner: existing.owner };

  demos[idx] = updated;
  await writeDemos(demos);

  return NextResponse.json(updated);
}

// DELETE /api/demos/[id]  — owner-only delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const login = (session.user as { login?: string }).login ?? "";
  const { id } = await params;

  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const existing = demos[idx];

  if (existing.owner && existing.owner !== login) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  demos.splice(idx, 1);
  await writeDemos(demos);

  return NextResponse.json({ ok: true });
}
