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
import AuthSidePanel from "@/components/auth/authSidePanel";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    router.push(`/signup/verify?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left section + mobile header */}
        <AuthSidePanel
          title={"Start tracking.\nBuild streaks."}
          subtitle="Create your Habithop account and start improving one habit at a time."
          mobileTagline="Create your Habithop account."
          points={[
            "Simple habit sets with streak tracking.",
            "Minimal UI designed for everyday usage.",
            "Progress insights that keep you accountable.",
          ]}
          quotes={[{
            text: "The app feels simple and fast. I actually enjoy tracking habits daily.",
            author: "Habithop user",
          }]}
        />

        {/* Right section (form) */}
        <div className="flex flex-col justify-center px-4 py-10 sm:px-6 lg:px-10">
          <AuthCard
            title="Create account"
            subtitle="Start tracking your habits today."
          >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-zinc-800"
                >
                  Name
                </Label>

                <Input
                  id="name"
                  placeholder="Your name"
                  autoComplete="name"
                  {...form.register("name")}
                  className="h-11 rounded-xl"
                />

                <FieldError message={form.formState.errors.name?.message} />
              </div>

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
                    autoComplete="new-password"
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
                {form.formState.isSubmitting ? "Creating..." : "Sign up"}
              </Button>

              {/* Footer */}
              <p className="text-sm text-center text-zinc-500 pt-1">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-zinc-900 hover:text-zinc-700 transition"
                >
                  Login
                </a>
              </p>
            </form>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
