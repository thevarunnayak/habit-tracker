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

    // ✅ get latest active OTP
    const record = await prisma.emailOTP.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Invalid OTP or expired OTP" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(code, record.codeHash);
    if (!ok) {
      return NextResponse.json(
        { message: "Invalid OTP or expired OTP" },
        { status: 400 }
      );
    }

    // ✅ delete OTP after successful verification
    await prisma.emailOTP.delete({
      where: { id: record.id },
    });

    return NextResponse.json({ message: "OTP verified" }, { status: 200 });
  } catch {
    // generic response
    return NextResponse.json(
      { message: "Invalid OTP or expired OTP" },
      { status: 400 }
    );
  }
}
