import { NextRequest, NextResponse } from "next/server";
import { deleteDemoUser, getDemoUser } from "@/lib/demoUsers";
import { getSessionUser } from "@/lib/session";
import { deleteThoughtSpotUser } from "@/lib/thoughtspot";

export async function POST(request: NextRequest) {
  const adminUser = await getSessionUser();

  if (!adminUser || adminUser.role !== "Internal Admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { username } = await request.json();
  const target = await getDemoUser(username);

  if (!target) {
    return NextResponse.json({ error: "Unknown user." }, { status: 404 });
  }

  if (target.seed) {
    return NextResponse.json(
      { error: "This is a seed demo user and can't be deleted." },
      { status: 400 },
    );
  }

  try {
    await deleteThoughtSpotUser(adminUser.username, username);
    await deleteDemoUser(username);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user." },
      { status: 502 },
    );
  }
}
