import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getGroups } from "@/lib/thoughtspot";

export async function GET() {
  const user = await getSessionUser();

  if (!user || user.role !== "Internal Admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const groups = await getGroups(user.username);
    return NextResponse.json({ groups });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch groups." },
      { status: 502 },
    );
  }
}
