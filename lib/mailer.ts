import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password (16 chars)
  },
});

export async function sendOTPEmail(to: string, otp: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Your OTP Code - Habit Tracker",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5">
        <h2>Your OTP Code</h2>
        <p>Use this OTP to continue:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
}
