import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

// dummy bcrypt hash to reduce timing side-channels
// (any valid bcrypt hash works here)
const DUMMY_BCRYPT_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8n2x3u7E2x9sHq4P0dK2W4e3qH5H6S";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },

      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const otp = credentials?.otp as string | undefined;

        if (!email) return null;

        // ✅ check user first
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // ✅ Password Login
        if (password) {
          if (!user?.password) return null;

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return null;

          return { id: user.id, email: user.email, name: user.name };
        }

        // ✅ OTP Login
        if (otp) {
          // If user doesn't exist, do dummy compare to prevent timing differences
          if (!user) {
            await bcrypt.compare(otp, DUMMY_BCRYPT_HASH);
            return null;
          }

          // only fetch OTP record if user exists
          const otpRecord = await prisma.emailOTP.findFirst({
            where: {
              email,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!otpRecord) {
            await bcrypt.compare(otp, DUMMY_BCRYPT_HASH);
            return null;
          }

          const ok = await bcrypt.compare(otp, otpRecord.codeHash);
          if (!ok) return null;

          // ✅ consume OTP only after user exists + OTP matches
          await prisma.emailOTP.delete({
            where: { id: otpRecord.id },
          });

          return { id: user.id, email: user.email, name: user.name };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
  },
};
