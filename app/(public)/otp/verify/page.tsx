"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/authCard";
import FieldError from "@/components/auth/fieldError";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function OTPVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const defaultEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

async function handleVerify(e: React.FormEvent) {
  e.preventDefault();
  setServerError("");

  if (!email || !otp) {
    setServerError("Email and OTP are required");
    return;
  }

  setLoading(true);

  const loginRes = await signIn("credentials", {
    email,
    otp,
    redirect: false,
  });

  setLoading(false);

  if (loginRes?.error) {
    setServerError("Invalid OTP or OTP expired. Please try again.");
    return;
  }

  router.push("/dashboard");
}


  return (
    <AuthCard title="Enter OTP" subtitle="Check your email for the 6-digit code.">
      <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

        <FieldError message={serverError} />

<Button className="w-full" disabled={loading || otp.length !== 6}>
  {loading ? "Verifying..." : "Verify OTP"}
</Button>

        <p className="text-sm text-center text-muted-foreground">
          Didn&apos;t get OTP?{" "}
          <a href="/otp/request" className="underline text-foreground">
            Resend
          </a>
        </p>
      </form>
    </AuthCard>
  );
}
