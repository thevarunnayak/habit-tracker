"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import FieldError from "@/components/auth/fieldError";
import AuthCard from "@/components/auth/authCard";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError("");

    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <AuthCard title="Welcome back" subtitle="Login to continue.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {form.formState.isSubmitting ? "Logging in..." : "Login"}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <a href="/otp/request" className="underline text-muted-foreground">
            Login with OTP
          </a>
          <a href="/signup" className="underline text-muted-foreground">
            Create account
          </a>
        </div>
      </form>
    </AuthCard>
  );
}
