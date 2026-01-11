import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mailer";

function generateOTP(): string {
  // crypto-secure 6 digit OTP
  return crypto.randomInt(100000, 1000000).toString();
}

function isValidEmail(email: string): boolean {
  // simple & safe regex (good enough for OTP validation)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body.email || "").trim().toLowerCase();

    // ✅ Always return generic message to avoid email enumeration
    const genericOk = NextResponse.json(
      { message: "If the email exists, an OTP will be sent." },
      { status: 200 }
    );

    // ✅ email validation
    if (!email || !isValidEmail(email)) {
      // use generic response shape
      return genericOk;
    }

    // ✅ cleanup expired OTPs for this email
    await prisma.emailOTP.deleteMany({
      where: {
        email,
        expiresAt: { lt: new Date() },
      },
    });

    // ✅ per-email rate limit: max 3 in last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentCount = await prisma.emailOTP.count({
      where: {
        email,
        createdAt: { gt: tenMinAgo },
      },
    });

    if (recentCount >= 3) {
      // same generic response (don’t reveal rate limiting details)
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // ✅ generate + hash OTP
    const otp = generateOTP();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ✅ insert otp record
    const otpRow = await prisma.emailOTP.create({
      data: {
        email,
        codeHash,
        expiresAt,
      },
    });

    // ✅ send email; if send fails => cleanup record
    try {
      await sendOTPEmail(email, otp);
    } catch (err) {
      await prisma.emailOTP.delete({ where: { id: otpRow.id } });
      return genericOk;
    }

    return genericOk;
  } catch {
    // generic response for all errors
    return NextResponse.json(
      { message: "If the email exists, an OTP will be sent." },
      { status: 200 }
    );
  }
}
