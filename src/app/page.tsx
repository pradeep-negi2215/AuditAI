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
    <main className="flex-1 bg-background">
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Credex
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          AI Spend Auditor
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Audit AI subscriptions, right-size plans, and quantify savings with a
          pricing-grounded audit engine.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/audit">Start the Free Audit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/audit">View Sample Report</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 pb-20 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pricing-backed engine</CardTitle>
            <CardDescription>Plan rules tied to official pricing.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The audit logic compares team size, plan fit, and cheaper options to
            surface clear, defensible savings.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Local draft persistence</CardTitle>
            <CardDescription>No lost work on refresh.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Multi-step spend inputs stay saved while you iterate with your team.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Share-ready results</CardTitle>
            <CardDescription>Clean URLs without PII.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A public audit summary shows savings and tool recommendations with
            optional Credex call-to-action.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
