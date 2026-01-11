"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuthCard from "@/components/auth/authCard";
import FieldError from "@/components/auth/fieldError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function SignupVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!email || !otp) {
      setServerError("Email and OTP are required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup/verifyOtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setServerError(data?.message || "OTP verification failed");
      return;
    }

    setSuccessMsg("Account created successfully!");
    router.push("/login");
  }

  async function resendOtp() {
    setServerError("");
    setSuccessMsg("");

    if (!email) {
      setServerError("Email is required to resend OTP");
      return;
    }

    setLoading(true);

    // resend OTP needs signup details again normally.
    // since we stored SignupIntent, we can implement resend by calling a resend endpoint.
    // For now we just tell user to signup again.
    setLoading(false);
    setServerError("Please go back to Signup page to resend OTP.");
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the OTP sent to your email to complete signup."
    >
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
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        <Button className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP & Create Account"}
        </Button>

        <div className="flex justify-between text-sm text-muted-foreground">
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/signup")}
            disabled={loading}
          >
            Change email
          </button>

          <button
            type="button"
            className="underline"
            onClick={resendOtp}
            disabled={loading}
          >
            Resend OTP
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
