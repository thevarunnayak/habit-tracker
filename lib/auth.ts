import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

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
    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) return null;

    const ok = await bcrypt.compare(otp, otpRecord.codeHash);
    if (!ok) return null;

    // mark OTP as used
    await prisma.emailOTP.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    if (!user) return null;

    return { id: user.id, email: user.email, name: user.name };
  }

  return null;
}

    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // user is only available on first login
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
