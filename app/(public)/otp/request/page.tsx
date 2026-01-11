"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "@/components/auth/authCard";
import FieldError from "@/components/auth/fieldError";

export default function OTPRequestPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!email) {
      setServerError("Email is required");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setServerError(data?.message || "Failed to send OTP");
      return;
    }

    router.push(`/otp/verify?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthCard title="Login with OTP" subtitle="We will email you a 6-digit code.">
      <form onSubmit={handleRequest} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <FieldError message={serverError} />

        <Button className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Prefer password?{" "}
          <a href="/login" className="underline text-foreground">
            Login
          </a>
        </p>
      </form>
    </AuthCard>
  );
}
