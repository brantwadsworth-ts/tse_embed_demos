import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Comma-separated GitHub usernames allowed to access the builder.
// Set ALLOWED_GITHUB_LOGINS in Vercel env vars, e.g. "brantwadsworth-ts,janesmith"
const allowedLogins = (process.env.ALLOWED_GITHUB_LOGINS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      if (!profile?.login) return "/login?error=AccessDenied";
      return allowedLogins.includes((profile.login as string).toLowerCase())
        ? true
        : "/login?error=AccessDenied";
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
