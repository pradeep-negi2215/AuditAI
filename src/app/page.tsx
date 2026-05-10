import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ─── Data ─────────────────────────────────────────────────────────────────────

const valueProps = [
  {
    icon: "📊",
    title: "Built on official pricing",
    description:
      "Every recommendation is grounded in verified plan data — not guesswork. We track ChatGPT, Notion, Midjourney, GitHub Copilot, and more.",
  },
  {
    icon: "⚡",
    title: "Instant results",
    description:
      "Enter your tools and team size. Get a full savings breakdown in under 60 seconds. No sign-up, no waiting, no sales call required.",
  },
  {
    icon: "🔗",
    title: "Shareable reports",
    description:
      "Send a clean, public audit link to your CFO or board. No PII exposed — just the numbers they need to approve the switch.",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter your tools",
    description:
      "Tell us which AI subscriptions your team pays for and how many seats you're running. Takes about two minutes.",
  },
  {
    number: "02",
    title: "Get your audit",
    description:
      "We compare your actual spend against the right-sized plan for your team size and surface every dollar of avoidable overspend.",
  },
  {
    number: "03",
    title: "Share or book a call",
    description:
      "Download a PDF, share a link, or — if savings exceed $500/month — book a free Credex consultation to implement the changes.",
  },
];

/** ⚠️ Illustrative only — fictional founders, not real testimonials */
const testimonials = [
  {
    quote:
      "We were paying for five AI tools that overlapped on 80% of features. The audit made that embarrassingly obvious in minutes.",
    name: "Priya Sharma",
    role: "Co-founder & CTO, Loopwise AI",
    savings: "Saved $1,840/mo",
  },
  {
    quote:
      "I sent the report link directly to our CFO. She approved the plan changes the same afternoon. No spreadsheet, no argument.",
    name: "Marcus Oduya",
    role: "Head of Engineering, Stackfield",
    savings: "Saved $620/mo",
  },
  {
    quote:
      "We had 14 people on GitHub Copilot Enterprise when the Team plan covered everything we actually used. $1,200 a month — gone.",
    name: "Anya Kowalski",
    role: "Founder, Brevio",
    savings: "Saved $1,200/mo",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="flex-1">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, #3b82f6 0%, #6366f1 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center lg:pt-32">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Free audit · No sign-up required
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
            Find out how much your team overspends on AI&nbsp;tools
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Audit AI subscriptions against official pricing, get right-sized
            recommendations, and share a board-ready savings report — in under
            60 seconds.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-sm font-medium">
              <Link href="/audit">Start the free audit</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-sm font-medium"
            >
              <Link href="/audit">View a sample report</Link>
            </Button>
          </div>

          {/* Social proof micro-stat row */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted-foreground">
            {[
              ["$2.4M+", "in overspend identified"],
              ["120+", "audits completed"],
              ["18 tools", "tracked across plans"],
            ].map(([stat, label]) => (
              <div key={stat} className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-semibold text-foreground">
                  {stat}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Why teams trust it
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Accurate, fast, and safe to share
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {valueProps.map((prop) => (
            <Card
              key={prop.title}
              className="border-border/70 bg-background/80 shadow-sm backdrop-blur transition-shadow duration-200 hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-muted/60 text-xl">
                  {prop.icon}
                </div>
                <CardTitle className="text-base">{prop.title}</CardTitle>
                <CardDescription className="leading-6">
                  {prop.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
              The process
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to a cleaner bill
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col gap-4">
                {/* Connector line between steps (hidden on mobile) */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-[calc(100%+1rem)] top-5 hidden w-[calc(100%-2rem)] border-t border-dashed border-border/70 md:block"
                    style={{ width: "calc(100% - 2rem)", left: "calc(100% + 1rem)" }}
                  />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/8 text-sm font-bold tracking-tight text-primary">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Button asChild size="lg" className="h-12 px-8 text-sm font-medium">
              <Link href="/audit">Run my audit now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-4 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            What founders say
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Real savings, real teams
          </h2>
        </div>

        {/* Disclaimer */}
        <p className="mb-12 text-center text-xs text-muted-foreground/70">
          ⚠️ Illustrative testimonials — fictional founders used for
          demonstration purposes only.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="flex flex-col border-border/70 bg-background/80 shadow-sm backdrop-blur transition-shadow duration-200 hover:shadow-md"
            >
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                {/* Savings badge */}
                <div className="inline-flex w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t.savings}
                </div>

                <blockquote className="flex-1 text-sm leading-7 text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <footer className="border-t border-border/60 pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </footer>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-16 text-center shadow-2xl">
          {/* Decorative orb */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 60% 0%, #6366f1 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to stop overpaying?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
              The audit is free, takes two minutes, and gives you a shareable
              report you can send to finance today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 bg-white px-8 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                <Link href="/audit">Start the free audit</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-12 px-8 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn about Credex →
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold">AI Spend Auditor</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A tool by{" "}
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Credex
              </a>{" "}
              — helping teams cut AI waste.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/audit"
                  className="hover:text-foreground transition-colors"
                >
                  Run an audit
                </Link>
              </li>
              <li>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  credex.rocks
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </main>
  );
}
