import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAdminEmail } from "@/lib/auth/admin-emails";

/** Public GitHub OAuth App client ID (not a secret). */
const GITHUB_OAUTH_CLIENT_ID = "Ov23liiYDrN1J0l0ZGNr";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    signIn({ user }) {
      return isAdminEmail(user.email);
    },
    authorized({ auth: session }) {
      return isAdminEmail(session?.user?.email);
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
