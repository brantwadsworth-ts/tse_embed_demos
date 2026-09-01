import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRevisions, addRevision } from "@/lib/revisions";
import { readDemos, writeDemos } from "@/lib/store";

// POST /api/demos/[id]/revisions/[revId]/rollback
// Restores a previous revision snapshot as the current demo state,
// then records a new "Rolled back to rev_…" revision in history.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; revId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const login = (session.user as { login?: string }).login ?? "";
  const { id, revId } = await params;

  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const existing = demos[idx];
  if (existing.owner && existing.owner !== login) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const revisions = await getRevisions(id);
  const target = revisions.find((r) => r.id === revId);
  if (!target) {
    return NextResponse.json({ error: "Revision not found." }, { status: 404 });
  }

  // Restore the snapshot but preserve current id and owner
  const restored = { ...target.snapshot, id, owner: existing.owner };
  demos[idx] = restored;
  await writeDemos(demos);

  // Record the rollback itself as a new revision
  addRevision(existing, restored, login).catch(() => {});

  return NextResponse.json({ ok: true, demo: restored });
}
