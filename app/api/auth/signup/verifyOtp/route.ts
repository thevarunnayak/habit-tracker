import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = (await req.json()) as {
      email: string;
      otp: string;
    };

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP expired or invalid" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(otp, otpRecord.codeHash);
    if (!ok) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const intent = await prisma.signupIntent.findUnique({ where: { email } });
    if (!intent || intent.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Signup request expired. Please signup again." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email,
          name: intent.name,
          password: intent.passwordHash,
          emailVerified: new Date(),
        },
      });

      await tx.emailOTP.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      });

      await tx.signupIntent.delete({ where: { email } });
    });

    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
