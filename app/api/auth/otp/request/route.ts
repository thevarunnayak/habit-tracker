import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mailer";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const otp = generateOTP();
    const codeHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.emailOTP.create({
      data: {
        email,
        codeHash,
        expiresAt,
      },
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
