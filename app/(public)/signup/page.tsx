"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import AuthCard from "@/components/auth/authCard";
import FieldError from "@/components/auth/fieldError";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

async function onSubmit(values: SignupInput) {
  setServerError("");

  const res = await fetch("/api/auth/signup/requestOtp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const data = await res.json();

  if (!res.ok) {
    setServerError(data?.message || "Failed to send OTP");
    return;
  }

  // ✅ go to otp verification screen
  router.push(`/signup/verify?email=${encodeURIComponent(values.email)}`);
}


  return (
    <AuthCard title="Create account" subtitle="Start tracking your habits today.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your name" {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            type="email"
            {...form.register("email")}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            {...form.register("password")}
          />
          <FieldError message={form.formState.errors.password?.message} />
        </div>

        <FieldError message={serverError} />

        <Button className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Sign up"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="underline text-foreground">
            Login
          </a>
        </p>
      </form>
    </AuthCard>
  );
}
