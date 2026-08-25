import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getRole } from "@/lib/roles";

const ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";

export async function GET() {
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

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const [membersRes, invitesRes] = await Promise.all([
    fetch(`https://api.github.com/orgs/${ORG}/members?per_page=100`, {
      headers,
    }),
    fetch(`https://api.github.com/orgs/${ORG}/invitations?per_page=100`, {
      headers,
    }),
  ]);

  if (!membersRes.ok) {
    const text = await membersRes.text();
    return NextResponse.json(
      { error: `GitHub members API error: ${membersRes.status} ${text}` },
      { status: 502 },
    );
  }

  const membersData = await membersRes.json();

  interface GitHubMember {
    login: string;
    avatar_url: string;
    role?: string;
  }

  const githubMembers = membersData as GitHubMember[];
  const memberRoles = await Promise.all(githubMembers.map((m) => getRole(m.login)));
  const members = githubMembers.map((m, i) => ({
    login: m.login,
    avatarUrl: m.avatar_url,
    role: memberRoles[i],
  }));

  let pending: { login: string; avatarUrl: string }[] = [];
  if (invitesRes.ok) {
    const invitesData = await invitesRes.json();
    interface GitHubInvite {
      login: string | null;
      avatar_url?: string;
    }
    pending = (invitesData as GitHubInvite[])
      .filter((i) => i.login)
      .map((i) => ({
        login: i.login as string,
        avatarUrl: i.avatar_url ?? "",
      }));
  }

  return NextResponse.json({ members, pending });
}
