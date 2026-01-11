import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email: rawEmail, otp } = (await req.json()) as {
      email?: string;
      otp?: string;
    };

    const email = (rawEmail || "").trim().toLowerCase();
    const code = (otp || "").trim();

    if (!email || !code || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid OTP or expired OTP" },
        { status: 400 }
      );
    }

    // ✅ cleanup expired OTPs for this email
    await prisma.emailOTP.deleteMany({
      where: {
        email,
        expiresAt: { lt: new Date() },
      },
    });

    // ✅ get latest valid OTP
    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Invalid OTP or expired OTP" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(code, otpRecord.codeHash);
    if (!ok) {
      return NextResponse.json(
        { message: "Invalid OTP or expired OTP" },
        { status: 400 }
      );
    }

    // ✅ find signup intent
    const intent = await prisma.signupIntent.findUnique({ where: { email } });

    if (!intent || intent.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Signup request expired. Please signup again." },
        { status: 400 }
      );
    }

    // ✅ transaction ensures consistent state even under retries
    await prisma.$transaction(async (tx) => {
      // prevent duplicates if user created in parallel request
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        // cleanup intent and OTP if any
        await tx.signupIntent.delete({ where: { email } }).catch(() => null);
        await tx.emailOTP.delete({ where: { id: otpRecord.id } }).catch(() => null);
        return;
      }

      await tx.user.create({
        data: {
          email,
          name: intent.name,
          password: intent.passwordHash,
          emailVerified: new Date(),
        },
      });

      // ✅ delete OTP after success
      await tx.emailOTP.delete({
        where: { id: otpRecord.id },
      });

      // ✅ cleanup intent after success
      await tx.signupIntent.delete({ where: { email } });
    });

    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Invalid OTP or expired OTP" },
      { status: 400 }
    );
  }
}
