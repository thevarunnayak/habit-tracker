"use client";

import Image from "next/image";
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
import AuthSidePanel from "@/components/auth/authSidePanel";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* LEFT CONTENT */}
        <AuthSidePanel />

          <AuthCard title="Welcome back" subtitle="Login to continue.">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-zinc-800"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  {...form.register("email")}
                  className="h-11 rounded-xl"
                />
                <FieldError message={form.formState.errors.email?.message} />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-800"
                >
                  Password
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...form.register("password")}
                    className="h-11 rounded-xl pr-16"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <FieldError message={form.formState.errors.password?.message} />
              </div>

              {/* Server error */}
              <FieldError message={serverError} />

              {/* Button */}
              <Button
                className="w-full h-11 rounded-xl font-semibold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>

              {/* Links */}
              <div className="flex items-center justify-between text-sm">
                <a
                  href="/otp/request"
                  className="text-zinc-500 hover:text-zinc-900 transition"
                >
                  Login with OTP
                </a>
                <a
                  href="/signup"
                  className="text-zinc-500 hover:text-zinc-900 transition"
                >
                  Create account
                </a>
              </div>
            </form>
          </AuthCard>
        </div>
      </div>
  );
}
