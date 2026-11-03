"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(form.firstName, form.lastName, form.email, form.password);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    } catch {
      setError("Cannot connect to the server. Start Apache and MySQL in XAMPP.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center px-6 py-12 lg:px-16">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link href="/" className="mb-10 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-white">
                F
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">
                  Fit<span className="text-emerald-500">Planner</span>
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Train Smarter
                </p>
              </div>
            </Link>

            {/* Heading */}
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Create your account
            </h2>
            <p className="mt-3 text-slate-500">
              Start your fitness journey with Fit Planner.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-bold text-slate-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-slate-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="font-bold text-emerald-500 hover:text-emerald-600">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-bold text-emerald-500 hover:text-emerald-600">
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold uppercase text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Social Login */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            {/* Sign In Link */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-bold text-emerald-500 hover:text-emerald-600"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden bg-slate-950 lg:flex lg:items-center lg:justify-center">
          <div className="relative mx-auto max-w-md px-8">
            {/* Decorative elements */}
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Get Started
              </div>

              <h3 className="text-4xl font-black leading-tight text-white">
                Start building
                <br />
                <span className="text-emerald-400">better habits</span>
                <br />
                today.
              </h3>

              <p className="mt-6 max-w-sm text-lg leading-relaxed text-slate-400">
                Join Fit Planner and take control of your fitness journey. Create
                plans, track progress, and stay motivated.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-xl">
                    📋
                  </div>
                  <div>
                    <p className="font-bold text-white">Custom Plans</p>
                    <p className="text-sm text-slate-400">
                      Build your own workout routines
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-xl">
                    📈
                  </div>
                  <div>
                    <p className="font-bold text-white">Track Progress</p>
                    <p className="text-sm text-slate-400">
                      Monitor your fitness improvements
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-xl">
                    🔥
                  </div>
                  <div>
                    <p className="font-bold text-white">Stay Consistent</p>
                    <p className="text-sm text-slate-400">
                      Build lasting fitness habits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
