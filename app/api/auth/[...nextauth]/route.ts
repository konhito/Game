import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ??
        (() => {
          throw new Error("GOOGLE_CLIENT_ID is not set");
        })(),
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ??
        (() => {
          throw new Error("GOOGLE_CLIENT_SECRET is not set");
        })(),
    }),
    // CredentialsProvider temporarily disabled for OAuth testing
    // We'll re-enable it after Google OAuth is working
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).provider = token.provider as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For now, just allow all OAuth sign-ins
      // We'll implement database operations later
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
