import { NextResponse } from "next/server";
import { getDemoUsers } from "@/lib/demoUsers";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();

  if (!user || user.role !== "Internal Admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({ users: await getDemoUsers() });
}
