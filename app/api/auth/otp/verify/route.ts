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
        { message: "Email + OTP required" },
        { status: 400 }
      );
    }

    // get latest OTP for email
    const record = await prisma.emailOTP.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { message: "OTP expired or invalid" },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(otp, record.codeHash);
    if (!ok) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    await prisma.emailOTP.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ message: "OTP verified" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
