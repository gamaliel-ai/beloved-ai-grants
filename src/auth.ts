import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAdminEmail } from "@/lib/auth/admin-emails";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
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
