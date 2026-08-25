import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { readRoles } from "@/lib/roles";

const GITHUB_ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";

// Comma-separated GitHub usernames that always get access, regardless of org membership.
// Set ALLOWED_GITHUB_LOGINS in Vercel env vars. Example: "brantwadsworth-ts,another-user"
const ALLOWED_LOGINS = new Set(
  (process.env.ALLOWED_GITHUB_LOGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user read:org" } },
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) token.login = (profile as { login: string }).login;
      return token;
    },
    async session({ session, token }) {
      if (token.login) (session.user as { login?: string }).login = token.login as string;
      return session;
    },
    async signIn({ account, profile }) {
      if (!account?.access_token) return "/login?error=AccessDenied";

      const login = (profile as { login?: string })?.login?.toLowerCase() ?? "";

      // 1. Hardcoded allowlist (env var) — always passes
      if (login && ALLOWED_LOGINS.has(login)) return true;

      // 2. Role store — if admin added them via Team page, let them in
      if (login) {
        try {
          const roles = await readRoles();
          if (roles.some((r) => r.login === login)) return true;
        } catch {
          // Blob unavailable — fall through to org check
        }
      }

      // 3. GitHub org membership check
      const res = await fetch(
        `https://api.github.com/user/memberships/orgs/${GITHUB_ORG}`,
        {
          headers: {
            Authorization: `Bearer ${account.access_token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (!res.ok) return "/login?error=AccessDenied";
      const data = await res.json();
      return data.state === "active" ? true : "/login?error=AccessDenied";
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
