import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Demo } from "@/lib/demos";
import { promises as fsPromises } from "fs";
import { writeFileSync } from "fs";
import path from "path";

const DEMOS_FILE = path.join(process.cwd(), "data", "demos.json");
const SUBMISSIONS_FILE = process.env.VERCEL
  ? "/tmp/demo-submissions.json"
  : path.join(process.cwd(), "data", "submissions.json");

async function readFile(filepath: string): Promise<Demo[]> {
  try {
    const raw = await fsPromises.readFile(filepath, "utf8");
    return JSON.parse(raw) as Demo[];
  } catch {
    return [];
  }
}

function writeFile(filepath: string, data: Demo[]): void {
  writeFileSync(filepath, JSON.stringify(data, null, 2));
}

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

  // Search demos.json first, then submissions fallback
  const [seeds, submissions] = await Promise.all([
    readFile(DEMOS_FILE),
    readFile(SUBMISSIONS_FILE),
  ]);

  const seedIdx = seeds.findIndex((d) => d.id === id);
  const subIdx = submissions.findIndex((d) => d.id === id);

  if (seedIdx === -1 && subIdx === -1) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const existing = seedIdx !== -1 ? seeds[seedIdx] : submissions[subIdx];

  if (existing.owner && existing.owner !== login) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const patch = await request.json();
  // Never allow id or owner to be overwritten via patch body
  const updated: Demo = { ...existing, ...patch, id, owner: existing.owner };

  if (seedIdx !== -1) {
    seeds[seedIdx] = updated;
    writeFile(DEMOS_FILE, seeds);
  } else {
    submissions[subIdx] = updated;
    writeFile(SUBMISSIONS_FILE, submissions);
  }

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

  const [seeds, submissions] = await Promise.all([
    readFile(DEMOS_FILE),
    readFile(SUBMISSIONS_FILE),
  ]);

  const seedIdx = seeds.findIndex((d) => d.id === id);
  const subIdx = submissions.findIndex((d) => d.id === id);

  if (seedIdx === -1 && subIdx === -1) {
    return NextResponse.json({ error: "Demo not found." }, { status: 404 });
  }

  const existing = seedIdx !== -1 ? seeds[seedIdx] : submissions[subIdx];

  if (existing.owner && existing.owner !== login) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (seedIdx !== -1) {
    seeds.splice(seedIdx, 1);
    writeFile(DEMOS_FILE, seeds);
  } else {
    submissions.splice(subIdx, 1);
    writeFile(SUBMISSIONS_FILE, submissions);
  }

  return NextResponse.json({ ok: true });
}
