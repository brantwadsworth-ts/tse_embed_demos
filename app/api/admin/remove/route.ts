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

  const removeRes = await fetch(
    `https://api.github.com/orgs/${ORG}/members/${username}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  // 204 = success, 404 = not a member (treat as ok)
  if (removeRes.status === 204 || removeRes.status === 404) {
    return NextResponse.json({ ok: true });
  }

  const text = await removeRes.text();
  return NextResponse.json(
    { error: `GitHub API error: ${removeRes.status} ${text}` },
    { status: 502 },
  );
}
