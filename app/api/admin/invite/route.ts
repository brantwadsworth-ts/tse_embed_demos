import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { setRole, getRole, Role } from "@/lib/roles";

const ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";
const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function POST(req: NextRequest) {
  const session = await auth();
  const callerLogin = (session?.user as { login?: string })?.login ?? "";
  const callerRole = await getRole(callerLogin);
  if (!session || callerRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_ADMIN_TOKEN is not configured" },
      { status: 500 },
    );
  }

  let username: string;
  let role: Role = "create";
  try {
    const body = await req.json();
    username = (body?.username ?? "").trim();
    const bodyRole = body?.role;
    if (bodyRole && ["admin", "create", "view"].includes(bodyRole)) {
      role = bodyRole as Role;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username format" },
      { status: 400 },
    );
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Verify the GitHub user exists
  const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (userRes.status === 404) {
    return NextResponse.json({ error: `GitHub user "${username}" not found` }, { status: 422 });
  }
  if (!userRes.ok) {
    return NextResponse.json({ error: `Could not verify GitHub user: ${userRes.status}` }, { status: 502 });
  }

  // Set role in our store — this is the primary access grant
  try {
    await setRole(username, role);
  } catch (err) {
    console.error("setRole failed:", err);
    return NextResponse.json({ error: "Role assignment failed — check Blob storage configuration." }, { status: 500 });
  }

  // Also send GitHub org invite if token has org admin scope (best-effort, not required)
  if (token) {
    await fetch(`https://api.github.com/orgs/${ORG}/memberships/${username}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ role: "member" }),
    }).catch(() => { /* org invite is optional */ });
  }

  return NextResponse.json({ ok: true, loginUrl: "https://tse-embed-demos.vercel.app/login" });
}
