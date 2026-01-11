import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mailer";
import { signupSchema } from "@/lib/validations/auth";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const json = await req.json();

    const parsed = signupSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered. Please login." },
        { status: 409 }
      );
    }

    // create/replace signup intent
    const passwordHash = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.signupIntent.upsert({
      where: { email },
      update: { name, passwordHash, expiresAt },
      create: { email, name, passwordHash, expiresAt },
    });

    // create OTP record
    const otp = generateOTP();
    const codeHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailOTP.create({
      data: {
        email,
        codeHash,
        expiresAt: otpExpiresAt,
      },
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  }  catch (error) {
  console.error("SIGNUP REQUEST OTP ERROR:", error);
  return NextResponse.json(
    { message: "Something went wrong" },
    { status: 500 }
  );
}

}
