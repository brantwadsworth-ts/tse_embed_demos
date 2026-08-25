import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";
const USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
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
  try {
    const body = await req.json();
    username = (body?.username ?? "").trim();
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

  // First verify the user exists on GitHub
  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
  });
  if (userRes.status === 404) {
    return NextResponse.json(
      { error: `GitHub user "${username}" not found` },
      { status: 422 },
    );
  }
  if (!userRes.ok) {
    return NextResponse.json(
      { error: `Could not verify GitHub user: ${userRes.status}` },
      { status: 502 },
    );
  }

  // Send the org membership invite (PUT sets role to "member")
  const inviteRes = await fetch(
    `https://api.github.com/orgs/${ORG}/memberships/${username}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ role: "member" }),
    },
  );

  if (inviteRes.status === 422) {
    return NextResponse.json(
      { error: "Already a member of the org" },
      { status: 422 },
    );
  }

  if (!inviteRes.ok) {
    const text = await inviteRes.text();
    return NextResponse.json(
      { error: `GitHub API error: ${inviteRes.status} ${text}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
