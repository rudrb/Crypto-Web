import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? null,
          image: user.image ?? null,
        },
        create: {
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        },
      });

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        });

        if (dbUser) {
          token.email = dbUser.email ?? token.email;
          token.name = dbUser.name ?? token.name;
          token.picture = dbUser.image ?? token.picture;
          (token as Record<string, unknown>).userId = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = String(token.email);
      }

      if (session.user && token.name) {
        session.user.name = String(token.name);
      }

      if (session.user && token.picture) {
        session.user.image = String(token.picture);
      }

      return session;
    },
  },
});