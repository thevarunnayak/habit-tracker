import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mailer";
import { signupSchema } from "@/lib/validations/auth";

function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = signupSchema.safeParse(json);

    if (!parsed.success) {
      // generic to avoid user enumeration
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 }
      );
    }

    const name = parsed.data.name;
    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // ✅ avoid signup with already registered email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // keep it generic (no enumeration of whether user exists)
      return NextResponse.json(
        { message: "Email already registered. Please login." },
        { status: 409 }
      );
    }

    // ✅ cleanup expired OTPs for this email
    await prisma.emailOTP.deleteMany({
      where: {
        email,
        expiresAt: { lt: new Date() },
      },
    });

    // ✅ rate limit: max 3 OTP requests / 10 minutes for signup
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentOtpCount = await prisma.emailOTP.count({
      where: {
        email,
        createdAt: { gt: tenMinAgo },
      },
    });

    if (recentOtpCount >= 3) {
      return NextResponse.json(
        { message: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    // ✅ create/refresh SignupIntent
    const passwordHash = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.signupIntent.upsert({
      where: { email },
      update: { name, passwordHash, expiresAt },
      create: { email, name, passwordHash, expiresAt },
    });

    // ✅ create OTP
    const otp = generateOTP();
    const codeHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otpRow = await prisma.emailOTP.create({
      data: {
        email,
        codeHash,
        expiresAt: otpExpiresAt,
      },
    });

    // ✅ send email; if fails cleanup OTP row
    try {
      await sendOTPEmail(email, otp);
    } catch {
      await prisma.emailOTP.delete({ where: { id: otpRow.id } });

      // don’t reveal internal error details
      return NextResponse.json(
        { message: "Unable to send OTP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
