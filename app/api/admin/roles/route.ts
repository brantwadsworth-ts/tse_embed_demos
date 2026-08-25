import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getRole, setRole, removeRole, readRoles, Role } from "@/lib/roles";

async function requireAdmin(): Promise<{ login: string } | NextResponse> {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const login = (session.user as { login?: string })?.login ?? "";
  const role = await getRole(login);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return { login };
}

export async function GET() {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;
  const roles = await readRoles();
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const body = await req.json().catch(() => ({}));
  const { login, role } = body as { login?: string; role?: string };

  if (!login || !role) {
    return NextResponse.json({ error: "login and role are required" }, { status: 400 });
  }
  if (!["admin", "create", "view"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await setRole(login, role as Role);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const check = await requireAdmin();
  if (check instanceof NextResponse) return check;

  const body = await req.json().catch(() => ({}));
  const { login } = body as { login?: string };

  if (!login) {
    return NextResponse.json({ error: "login is required" }, { status: 400 });
  }

  // Can't remove your own role
  if (login === (check as { login: string }).login) {
    return NextResponse.json({ error: "Cannot remove your own role" }, { status: 400 });
  }

  await removeRole(login);
  return NextResponse.json({ ok: true });
}
