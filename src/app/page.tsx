"use client";

import { useRouter } from "next/navigation";

const features = [
  {
    icon: "🔍",
    title: "AI-Powered Analysis",
    desc: "Detect UI elements, extract colors, fonts, spacing, and measurements from any mobile screenshot.",
  },
  {
    icon: "🎨",
    title: "Design Builder",
    desc: "Drag-and-drop canvas with free-form and grid modes. Edit detected elements or build from scratch.",
  },
  {
    icon: "📱",
    title: "Prototype Mode",
    desc: "Add click interactions, screen transitions, and preview your app in a phone frame.",
  },
  {
    icon: "🔎",
    title: "Inspect Mode",
    desc: "Get CSS, React, Vue, Jetpack Compose, and Kotlin/XML code for any element instantly.",
  },
  {
    icon: "📤",
    title: "Code Export",
    desc: "Export your design as React + Tailwind, Vue, HTML/CSS, Jetpack Compose, or Kotlin/XML.",
  },
  {
    icon: "💰",
    title: "100% Free",
    desc: "Built entirely on free-tier services. No credit card required. $0/month.",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Free & Open Source
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            Analyze. Build.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Export.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            Upload a mobile app screenshot and instantly get measurements, color
            palettes, font specs, and detected components. Then build, prototype,
            and export production code — all for free.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push("/analyze")}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40"
            >
              Upload Screenshot →
            </button>
            <button
              onClick={() => router.push("/builder")}
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Open Builder
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-slate-900/50 px-6 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: "$0", label: "Monthly Cost" },
            { value: "1,500+", label: "Free Analyses / Day" },
            { value: "6", label: "Export Formats" },
            { value: "100%", label: "Free Tier Stack" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-white">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-extrabold text-white">
              Everything you need
            </h2>
            <p className="text-lg text-slate-400">
              From screenshot to production code in minutes
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/5 bg-slate-900/50 p-6 transition hover:border-indigo-500/30 hover:bg-slate-900"
              >
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-white/5 bg-slate-900/30 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-3 text-3xl font-extrabold text-white">
            Built with modern tech
          </h2>
          <p className="mb-10 text-lg text-slate-400">
            All free and open-source
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js 15",
              "TypeScript",
              "Tailwind CSS",
              "Craft.js",
              "FastAPI",
              "Gemini 2.0",
              "OpenCV",
              "Tesseract OCR",
              "Supabase",
              "Vercel",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="text-sm text-slate-500">
            ScreenAnalyzer — Open Source Mobile Screenshot Analyzer
          </div>
          <div className="text-sm text-slate-500">
            $0/month • 100% free tier
          </div>
        </div>
      </footer>
    </div>
  );
}
