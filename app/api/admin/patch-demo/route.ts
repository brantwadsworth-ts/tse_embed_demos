import { NextRequest, NextResponse } from "next/server";
import { readDemos, writeDemos } from "@/lib/store";

// Temporary one-shot admin migration endpoint.
// Protected by AUTH_SECRET so it can only be called by someone who knows the secret.
// Usage: POST /api/admin/patch-demo
//   Header: x-admin-secret: <AUTH_SECRET value>
//   Body: { "id": "montana", "worksheetId": "..." }
// Remove this file after use.

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  const expected = process.env.GITHUB_ADMIN_TOKEN ?? process.env.AUTH_SECRET;
  if (!secret || !expected || secret !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, ...patch } = (await request.json()) as Record<string, string>;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const demos = await readDemos();
  const idx = demos.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: "Demo not found" }, { status: 404 });

  Object.assign(demos[idx], patch);
  await writeDemos(demos);

  return NextResponse.json({ ok: true, updated: demos[idx] });
}
