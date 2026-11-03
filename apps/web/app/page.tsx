import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
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
            <a
              href="#home"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-500"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-500"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-500"
            >
              How It Works
            </a>

            <a
              href="#about"
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-500"
            >
              About
            </a>
          </nav>

          {/* Login Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative overflow-hidden bg-white"
      >
        {/* Decorative backgrounds */}
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Your fitness journey starts here
            </div>

            <h2 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Plan Smarter.
              <br />
              <span className="text-emerald-500">Train Better.</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Create workout plans, organize your fitness schedule, monitor your
              progress, and stay consistent with Fit Planner.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-7 py-4 text-base font-black text-white shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                Start Your Journey
                <span>→</span>
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Learn More
              </a>
            </div>

            {/* Statistics */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-black text-slate-950">100%</p>
                <p className="text-sm font-medium text-slate-500">
                  Personalized
                </p>
              </div>

              <div className="border-l border-slate-200 pl-8">
                <p className="text-2xl font-black text-slate-950">Easy</p>
                <p className="text-sm font-medium text-slate-500">
                  Progress Tracking
                </p>
              </div>

              <div className="border-l border-slate-200 pl-8">
                <p className="text-2xl font-black text-slate-950">24/7</p>
                <p className="text-sm font-medium text-slate-500">
                  Access Anywhere
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Background */}
              <div className="absolute inset-0 rotate-3 rounded-[40px] bg-emerald-500" />

              {/* Main Dashboard Card */}
              <div className="relative rounded-[40px] border border-slate-200 bg-slate-950 p-6 shadow-2xl sm:p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400">
                      TODAY&apos;S WORKOUT
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-white">
                      Upper Body
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-xl">
                    💪
                  </div>
                </div>

                {/* Progress */}
                <div className="rounded-3xl bg-white/5 p-5">
                  <div className="mb-3 flex justify-between">
                    <span className="text-sm font-semibold text-slate-300">
                      Workout Progress
                    </span>

                    <span className="text-sm font-black text-emerald-400">
                      75%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Exercises */}
                <div className="mt-5 grid gap-3">
                  <WorkoutItem
                    icon="🏋️"
                    title="Bench Press"
                    details="3 sets • 10 reps"
                    completed
                  />

                  <WorkoutItem
                    icon="💪"
                    title="Bicep Curls"
                    details="3 sets • 12 reps"
                    completed
                  />

                  <WorkoutItem
                    icon="🔥"
                    title="Push Ups"
                    details="3 sets • 15 reps"
                  />
                </div>

                <button className="mt-6 w-full rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white transition hover:bg-emerald-600">
                  Continue Workout
                </button>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-8 -left-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:-left-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
                    🔥
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      CURRENT STREAK
                    </p>
                    <p className="text-lg font-black text-slate-900">7 Days</p>
                  </div>
                </div>
              </div>

              {/* Floating progress */}
              <div className="absolute -right-3 -top-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:-right-10">
                <p className="text-xs font-bold text-slate-400">
                  WEEKLY GOAL
                </p>
                <p className="mt-1 text-xl font-black text-emerald-500">4 / 5</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">
              Features
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Everything you need to stay on track
            </h2>

            <p className="mt-5 text-lg text-slate-600">
              Fit Planner gives you simple tools to organize workouts and
              monitor your fitness journey.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon="📋"
              title="Workout Plans"
              description="Create and follow organized workout plans that match your fitness goals."
            />

            <FeatureCard
              icon="📅"
              title="Smart Scheduling"
              description="Schedule your workouts and easily keep track of your upcoming sessions."
            />

            <FeatureCard
              icon="📈"
              title="Track Progress"
              description="Monitor completed workouts and see how your fitness journey improves over time."
            />

            <FeatureCard
              icon="🏃"
              title="Exercise Library"
              description="Browse different exercises and learn what to include in your workout routine."
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
              How It Works
            </p>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Start in three simple steps
            </h2>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <StepCard
              number="01"
              title="Create Your Account"
              description="Sign up and create your Fit Planner profile."
            />

            <StepCard
              number="02"
              title="Build Your Plan"
              description="Select exercises and organize your workout schedule."
            />

            <StepCard
              number="03"
              title="Train & Track"
              description="Complete your workouts and monitor your progress."
            />
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[36px] bg-emerald-500 p-8 sm:p-12">
            <div className="grid grid-cols-2 gap-4">
              <StatBox value="5+" label="Workout Categories" />
              <StatBox value="50+" label="Exercises" />
              <StatBox value="Easy" label="Workout Planning" />
              <StatBox value="100%" label="Progress Focused" />
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">
              About Fit Planner
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Build better fitness habits.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Fit Planner is designed to make workout planning easier. Instead
              of trying to remember exercises, schedules, and progress, you can
              organize everything in one place.
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Whether you are starting your fitness journey or building a
              consistent routine, Fit Planner helps you stay organized and
              focused on your goals.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-black text-white">
                F
              </div>

              <span className="text-lg font-black">
                Fit<span className="text-emerald-500">Planner</span>
              </span>
            </Link>

            <div className="flex gap-6 text-sm font-semibold text-slate-500">
              <a href="#features" className="hover:text-emerald-500">
                Features
              </a>

              <a href="#about" className="hover:text-emerald-500">
                About
              </a>

              <Link href="/signin" className="hover:text-emerald-500">
                Sign In
              </Link>
            </div>

            <p className="text-sm text-slate-400">
              © 2026 Fit Planner. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ======================================================
   COMPONENTS
====================================================== */

type WorkoutItemProps = {
  icon: string;
  title: string;
  details: string;
  completed?: boolean;
};

function WorkoutItem({
  icon,
  title,
  details,
  completed = false,
}: WorkoutItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-xl">
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-bold text-white">{title}</p>
        <p className="text-sm text-slate-400">{details}</p>
      </div>

      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          completed
            ? "bg-emerald-500 text-white"
            : "border border-slate-600 text-slate-500"
        }`}
      >
        {completed ? "✓" : ""}
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition group-hover:bg-emerald-500">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-black text-slate-900">{title}</h3>

      <p className="mt-3 leading-7 text-slate-500">{description}</p>
    </div>
  );
}

type StepCardProps = {
  number: string;
  title: string;
  description: string;
};

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="relative text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-2xl font-black text-white">
        {number}
      </div>

      <h3 className="mt-6 text-2xl font-black">{title}</h3>

      <p className="mx-auto mt-3 max-w-xs leading-7 text-slate-400">
        {description}
      </p>
    </div>
  );
}

type StatBoxProps = {
  value: string;
  label: string;
};

function StatBox({ value, label }: StatBoxProps) {
  return (
    <div className="rounded-3xl bg-white/15 p-6 text-white backdrop-blur-sm">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-semibold text-emerald-50">{label}</p>
    </div>
  );
}