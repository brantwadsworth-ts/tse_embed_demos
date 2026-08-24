import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const GITHUB_ORG = process.env.GITHUB_ORG ?? "brantwadsworth-ts";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user read:org" } },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (!account?.access_token) return false;
      // Allow access only to members of the GitHub org
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
