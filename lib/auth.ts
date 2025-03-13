import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            linkedinDetails: true,
          },
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          needsLinkedinConn: !user.linkedinDetails,
          linkedinDetails: {
            email: user.linkedinDetails?.email,
            avatar: user.linkedinDetails?.avatar!,
            name: user.linkedinDetails?.name!,
            headline: user.linkedinDetails?.headline!,
            username: user.linkedinDetails?.username!,
            accountId: user.linkedinDetails?.accountId!,
            isPremium: user.linkedinDetails?.isPremium!,
          },
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.needsLinkedinConn = user.needsLinkedinConn;
        token.linkedinDetails = user?.linkedinDetails;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.needsLinkedinConn = token.needsLinkedinConn as boolean;
        session.user.linkedinDetails = token.linkedinDetails;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
};
