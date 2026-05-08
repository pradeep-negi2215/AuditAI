import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { AuditReport, CountryCode } from "@/lib/audit";
import { formatCurrency } from "@/lib/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AuditRecord = {
  report: AuditReport;
  country: CountryCode | null;
};

type LoadResult = {
  record?: AuditRecord;
  error?: "not-configured" | "not-found";
};

const loadAudit = async (publicId: string): Promise<LoadResult> => {
  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return { error: "not-configured" };
  }

  const { data, error } = await supabase
    .from("audits")
    .select("report, country")
    .eq("public_id", publicId)
    .single();

  if (error || !data) {
    return { error: "not-found" };
  }

  return {
    record: {
      report: data.report as AuditReport,
      country: (data.country as CountryCode) ?? null,
    },
  };
};

export async function generateMetadata({
  params,
}: {
  params: { publicId: string };
}): Promise<Metadata> {
  const result = await loadAudit(params.publicId);

  const title = "AI Spend Auditor Results | Credex";
  if (!result.record) {
    return {
      title,
      description: "Public audit results",
      openGraph: { title, description: "Public audit results" },
      twitter: { title, description: "Public audit results", card: "summary" },
    };
  }

  const totals = result.record.report.totalsByCurrency[0];
  const description = totals
    ? `Estimated savings: ${formatCurrency(
        totals.savingsMonthly,
        totals.currency,
        result.record.country ?? undefined,
      )} per month.`
    : "Public audit results";

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: "summary" },
  };
}

export default async function SharedAuditPage({
  params,
}: {
  params: { publicId: string };
}) {
  const result = await loadAudit(params.publicId);

  if (result.error === "not-configured") {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Audit link unavailable</CardTitle>
            <CardDescription>
              The server is not configured to load shared audits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/audit">Return to audit</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!result.record) {
    notFound();
  }

  const { report, country } = result.record;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
      <div className="rounded-[2rem] border border-border/70 bg-background/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Shared report
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Credex Audit
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                AI Spend Auditor Results
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A clean summary of the saved audit, optimized for quick executive review.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="h-11 px-5">
            <Link href="/audit">Run your own audit</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
        {report.totalsByCurrency.map((totals) => (
          <Card key={totals.currency} className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle>{totals.currency} Savings</CardTitle>
              <CardDescription>Estimated monthly impact</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatCurrency(totals.savingsMonthly, totals.currency, country ?? undefined)}
              </p>
              <p className="text-sm text-muted-foreground">
                Annual: {formatCurrency(totals.savingsAnnual, totals.currency, country ?? undefined)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

        <div className="mt-8 space-y-4">
          {report.results.map((result) => (
            <Card key={result.toolId} className="border-border/70 bg-background/90 shadow-sm">
              <CardHeader>
                <CardTitle>{result.toolName}</CardTitle>
                <CardDescription>
                  {result.currentPlanName} → {result.recommended.planName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">
                  {formatCurrency(result.savingsMonthly, result.currency, country ?? undefined)} monthly savings
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
