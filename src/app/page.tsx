import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:py-20">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Credex AI Audit Suite
          </div>
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
              AI Spend Auditor
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Turn AI subscription sprawl into a board-ready savings plan.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Audit AI tooling, apply country-aware pricing, and surface a clean
              recommendation path with shareable results your team can act on.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-12 px-6 text-sm font-medium">
              <Link href="/audit">Start the Free Audit</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-6 text-sm font-medium">
              <Link href="/audit">View Sample Report</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Country-aware", "Pricing adapts by region when available."],
              ["Fast setup", "Multi-step flow keeps input simple."],
              ["Shareable", "Public reports are clean and easy to send."],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 bg-background/85 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-4 border-b bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-primary-foreground">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-primary-foreground">Audit snapshot</CardTitle>
                <CardDescription className="text-slate-200/80">
                  A concise preview of the executive report.
                </CardDescription>
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-100">
                Live demo
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {[
              ["$12.4k", "Estimated monthly savings"],
              ["8 tools", "Reviewed in one workflow"],
              ["3 regions", "Supported by pricing overrides"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-4"
              >
                <div>
                  <p className="text-2xl font-semibold tracking-tight">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/70 bg-background/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Pricing-backed engine</CardTitle>
              <CardDescription>Plan rules tied to official pricing.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              The audit logic compares team size, plan fit, and cheaper options to
              surface clear, defensible savings.
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-background/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Local draft persistence</CardTitle>
              <CardDescription>No lost work on refresh.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              Multi-step spend inputs stay saved while you iterate with your team.
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-background/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Share-ready results</CardTitle>
              <CardDescription>Clean URLs without PII.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              A public audit summary shows savings and tool recommendations with
              optional Credex call-to-action.
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
