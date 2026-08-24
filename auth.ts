import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const GITHUB_ORG = process.env.GITHUB_ORG ?? "TSE-Embed-Demos";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account?.access_token || !profile?.login) return "/login?error=AccessDenied";
      // Checks public org membership — no read:org scope required.
      // Members must make their org membership public on GitHub.
      const res = await fetch(
        `https://api.github.com/orgs/${GITHUB_ORG}/members/${profile.login}`,
        {
          headers: {
            Authorization: `Bearer ${account.access_token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      return res.status === 204 ? true : "/login?error=AccessDenied";
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
