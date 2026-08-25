import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getRole, readRoles } from "@/lib/roles";

const ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_ADMIN_TOKEN;

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      }
    : undefined;

  // Primary source of truth: Blob role store
  const roles = await readRoles();

  // Look up GitHub avatars for each user (best-effort, parallel)
  const members = await Promise.all(
    roles.map(async ({ login, role }) => {
      let avatarUrl = `https://avatars.githubusercontent.com/${login}`;
      // GitHub CDN URL — always works without an API token
      return { login, avatarUrl, role };
    }),
  );

  // Pending GitHub org invitations (best-effort)
  let pending: { login: string; avatarUrl: string }[] = [];
  if (token) {
    try {
      const invitesRes = await fetch(
        `https://api.github.com/orgs/${ORG}/invitations?per_page=100`,
        { headers },
      );
      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        interface GitHubInvite {
          login: string | null;
          avatar_url?: string;
        }
        // Only show pending invites for users NOT already in the role store
        const roleLogins = new Set(roles.map((r) => r.login));
        pending = (invitesData as GitHubInvite[])
          .filter((i) => i.login && !roleLogins.has(i.login))
          .map((i) => ({
            login: i.login as string,
            avatarUrl: i.avatar_url ?? `https://avatars.githubusercontent.com/${i.login}`,
          }));
      }
    } catch {
      // pending invites are optional
    }
  }

  return NextResponse.json({ members, pending });
}
