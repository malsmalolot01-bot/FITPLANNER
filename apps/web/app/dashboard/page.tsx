"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/signin");
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
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

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-emerald-500"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/workouts"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-500"
            >
              Workouts
            </Link>
            <Link
              href="/dashboard/progress"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-500"
            >
              Progress
            </Link>
            <Link
              href="/dashboard/schedule"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-500"
            >
              Schedule
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Log Out
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ================= DASHBOARD CONTENT ================= */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Welcome back, {user.firstName}! 💪
          </h2>
          <p className="mt-2 text-slate-600">
            Here&apos;s your fitness overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="🔥"
            label="Current Streak"
            value="7 Days"
            color="orange"
          />
          <StatCard
            icon="📅"
            label="Weekly Goal"
            value="4 / 5"
            color="emerald"
          />
          <StatCard
            icon="🏋️"
            label="Workouts This Week"
            value="12"
            color="blue"
          />
          <StatCard
            icon="⏱️"
            label="Total Time"
            value="8.5 hrs"
            color="purple"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Today's Workout */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400">
                    TODAY&apos;S WORKOUT
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    Upper Body
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
                  💪
                </div>
              </div>

              {/* Progress */}
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="mb-3 flex justify-between">
                  <span className="text-sm font-semibold text-slate-600">
                    Workout Progress
                  </span>
                  <span className="text-sm font-black text-emerald-500">
                    75%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Exercises */}
              <div className="mt-6 grid gap-3">
                <ExerciseItem
                  icon="🏋️"
                  title="Bench Press"
                  details="3 sets • 10 reps"
                  completed
                />
                <ExerciseItem
                  icon="💪"
                  title="Bicep Curls"
                  details="3 sets • 12 reps"
                  completed
                />
                <ExerciseItem
                  icon="🔥"
                  title="Push Ups"
                  details="3 sets • 15 reps"
                />
              </div>

              <button className="mt-6 w-full rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600">
                Continue Workout
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-black text-slate-950">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/workouts/new"
                  className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 transition hover:bg-emerald-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    +
                  </div>
                  <span className="font-bold text-slate-700">
                    Create New Workout
                  </span>
                </Link>
                <Link
                  href="/dashboard/schedule"
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                    📅
                  </div>
                  <span className="font-bold text-slate-700">
                    View Schedule
                  </span>
                </Link>
                <Link
                  href="/dashboard/progress"
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                    📈
                  </div>
                  <span className="font-bold text-slate-700">
                    View Progress
                  </span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-black text-slate-950">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <ActivityItem
                  icon="✅"
                  title="Completed Upper Body"
                  time="Today, 8:30 AM"
                />
                <ActivityItem
                  icon="✅"
                  title="Completed Leg Day"
                  time="Yesterday, 6:00 PM"
                />
                <ActivityItem
                  icon="🎯"
                  title="Weekly Goal 80%"
                  time="2 days ago"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

type StatCardProps = {
  icon: string;
  label: string;
  value: string;
  color: "orange" | "emerald" | "blue" | "purple";
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    orange: "bg-orange-100 text-orange-600",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${colorClasses[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="text-xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

type ExerciseItemProps = {
  icon: string;
  title: string;
  details: string;
  completed?: boolean;
};

function ExerciseItem({
  icon,
  title,
  details,
  completed = false,
}: ExerciseItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{details}</p>
      </div>
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          completed
            ? "bg-emerald-500 text-white"
            : "border-2 border-slate-200 text-slate-400"
        }`}
      >
        {completed ? "✓" : ""}
      </div>
    </div>
  );
}

type ActivityItemProps = {
  icon: string;
  title: string;
  time: string;
};

function ActivityItem({ icon, title, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}
