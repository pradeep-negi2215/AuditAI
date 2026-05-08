"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  countryOptions,
  formatCurrency,
  pricingData,
  runAudit,
} from "@/lib/audit";
import type {
  AuditReport,
  BillingCycle,
  CountryCode,
  SpendInput,
  ToolId,
  UseCase,
} from "@/lib/audit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "auditai.form.v1";

type ToolEntry = {
  id: string;
  toolId: ToolId;
  planId: string;
  monthlySpend: string;
  seats: number;
  teamSize: number;
  useCase: UseCase;
  billingCycle: BillingCycle;
};

type LeadFormState = {
  email: string;
  company: string;
  role: string;
  website: string;
};

const useCaseOptions: Array<{ value: UseCase; label: string }> = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

const billingOptions: Array<{ value: BillingCycle; label: string }> = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual (effective monthly)" },
];

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `entry_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const getDefaultPlanId = (toolId: ToolId) => {
  const plans = pricingData.tools[toolId]?.plans ?? [];
  const paidPlan = plans.find(
    (plan) => plan.planType === "subscription" && !plan.isFreeTier,
  );
  return paidPlan?.id ?? plans[0]?.id ?? "";
};

const createEntry = (toolId: ToolId): ToolEntry => ({
  id: createId(),
  toolId,
  planId: getDefaultPlanId(toolId),
  monthlySpend: "",
  seats: 1,
  teamSize: 1,
  useCase: "coding",
  billingCycle: "monthly",
});

const parseNumber = (value: string) => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function AuditPage() {
  const [country, setCountry] = useState<CountryCode>("US");
  const [entries, setEntries] = useState<ToolEntry[]>([createEntry("cursor")]);
  const [step, setStep] = useState<"location" | "tools" | "review" | "results">("location");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [summaryStatus, setSummaryStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");
  const [leadState, setLeadState] = useState<LeadFormState>({
    email: "",
    company: "",
    role: "",
    website: "",
  });
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [leadMessage, setLeadMessage] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        country?: CountryCode;
        entries?: ToolEntry[];
      };

      if (parsed.country) {
        setCountry(parsed.country);
      }

      if (parsed.entries && parsed.entries.length > 0) {
        setEntries(
          parsed.entries.map((entry) => ({
            ...entry,
            id: entry.id ?? createId(),
            seats:
              entry.seats === 1 && entry.teamSize > 1
                ? entry.teamSize
                : entry.seats,
            planId:
              pricingData.tools[entry.toolId]?.plans.some(
                (plan) => plan.id === entry.planId,
              )
                ? entry.planId
                : getDefaultPlanId(entry.toolId),
          })),
        );
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ country, entries }),
    );
  }, [country, entries]);

  const spendInputs = useMemo<SpendInput[]>(
    () =>
      entries.map((entry) => ({
        toolId: entry.toolId,
        planId: entry.planId,
        monthlySpend: parseNumber(entry.monthlySpend),
        seats: entry.seats,
        teamSize: entry.teamSize,
        useCase: entry.useCase,
        billingCycle: entry.billingCycle,
        country,
      })),
    [entries, country],
  );

  const totalTeamSize = useMemo(
    () => Math.max(...entries.map((entry) => entry.teamSize), 0),
    [entries],
  );

  const selectedCountry = useMemo(
    () => countryOptions.find((option) => option.code === country),
    [country],
  );

  const handleEntryChange = (id: string, patch: Partial<ToolEntry>) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  };

  const handleToolChange = (id: string, toolId: ToolId) => {
    const planId = getDefaultPlanId(toolId);
    handleEntryChange(id, { toolId, planId });
  };

  const handleAddTool = () => {
    setEntries((current) => [...current, createEntry("cursor")]);
  };

  const handleRemoveTool = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const handleAdvanceFromTools = () => {
    setStep("review");
  };

  const handleBackFromReview = () => {
    setStep("tools");
  };

  const handleRunAudit = async () => {
    const nextReport = runAudit(spendInputs);
    setReport(nextReport);
    setStep("results");
    setShareId(null);
    setShareError(null);
    setLeadStatus("idle");
    setLeadMessage("");

    const totals = nextReport.totalsByCurrency[0];
    const highlights = nextReport.results
      .filter((result) => result.savingsMonthly > 0)
      .sort((a, b) => b.savingsMonthly - a.savingsMonthly)
      .slice(0, 3)
      .map(
        (result) =>
          `${result.toolName}: save ${formatCurrency(
            result.savingsMonthly,
            result.currency,
            country,
          )}`,
      );

    setSummaryStatus("loading");

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          teamSize: totalTeamSize || undefined,
          currency: totals?.currency,
          totalMonthlySavings: totals?.savingsMonthly ?? 0,
          highlights,
        }),
      });

      if (!response.ok) {
        setSummaryStatus("error");
        setSummary("Summary unavailable. Review the breakdown below.");
        return;
      }

      const data = (await response.json()) as { summary?: string };
      setSummary(data.summary ?? "Summary unavailable.");
      setSummaryStatus("ready");
    } catch {
      setSummaryStatus("error");
      setSummary("Summary unavailable. Review the breakdown below.");
    }
  };

  const handleCreateShare = async () => {
    if (!report) {
      return;
    }

    setShareError(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ report, country }),
      });

      if (!response.ok) {
        setShareError("Unable to save the audit right now.");
        return;
      }

      const data = (await response.json()) as { publicId?: string };
      if (!data.publicId) {
        setShareError("Unable to generate a share link.");
        return;
      }

      setShareId(data.publicId);
    } catch {
      setShareError("Unable to generate a share link.");
    }
  };

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!leadState.email) {
      setLeadStatus("error");
      setLeadMessage("Email is required.");
      return;
    }

    setLeadStatus("sending");
    setLeadMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: leadState.email,
          company: leadState.company,
          role: leadState.role,
          website: leadState.website,
          auditPublicId: shareId,
        }),
      });

      if (!response.ok) {
        setLeadStatus("error");
        setLeadMessage("Unable to submit right now.");
        return;
      }

      setLeadStatus("sent");
      setLeadMessage("Thanks. We sent a confirmation email.");
    } catch {
      setLeadStatus("error");
      setLeadMessage("Unable to submit right now.");
    }
  };

  const shareUrl = shareId && origin ? `${origin}/audit/${shareId}` : "";

  const progressValue =
    step === "location"
      ? 25
      : step === "tools"
        ? 50
        : step === "review"
          ? 75
          : 100;

  return (
    <main className="min-h-screen bg-background/40">
      <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
        <div className="rounded-[2rem] border border-border/70 bg-background/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur xl:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Credex audit workspace
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  AI Spend Auditor
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  Build a concise, executive-ready view of AI spend.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Capture location, tools, and usage once, then review the output
                  in a polished report with country-aware pricing.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="h-11 px-5">
              <Link href="/">Back to overview</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Location aware", selectedCountry?.label ?? country],
              ["Tools selected", `${entries.length}`],
              ["Team size", `${totalTeamSize || 1}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-950 via-slate-700 to-slate-500 transition-all duration-300"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
            <Card className="h-fit border-border/70 bg-background/90 shadow-sm">
              <CardHeader>
                <CardTitle>Steps</CardTitle>
                <CardDescription>Complete each step to run the audit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ["location", "1. Location"],
                  ["tools", "2. Tools & spend"],
                  ["review", "3. Review"],
                  ["results", "4. Results"],
                ].map(([key, label]) => {
                  const active = step === key;

                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between rounded-xl border px-3 py-3 transition-colors ${active ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/20"}`}
                    >
                      <span className="font-medium">{label}</span>
                      <span className={active ? "font-semibold text-primary" : "text-muted-foreground"}>
                        {active ? "Active" : ""}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {step === "location" && (
                <Card className="border-border/70 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle>Choose your location</CardTitle>
                    <CardDescription>
                      We use location-based pricing when available.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        id="country"
                        value={country}
                        onChange={(event) =>
                          setCountry(event.target.value as CountryCode)
                        }
                      >
                        {countryOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.label} ({option.currency})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button onClick={() => setStep("tools")}>Continue</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "tools" && (
                <Card className="border-border/70 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle>Tool subscriptions</CardTitle>
                    <CardDescription>
                      Add each tool your team pays for today.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {entries.map((entry, index) => {
                      const tool = pricingData.tools[entry.toolId];
                      const plans = tool?.plans ?? [];
                      const selectedPlan = plans.find((plan) => plan.id === entry.planId);

                      return (
                        <div key={entry.id} className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Tool #{index + 1}</p>
                            {entries.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveTool(entry.id)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Tool</Label>
                              <Select
                                value={entry.toolId}
                                onChange={(event) =>
                                  handleToolChange(
                                    entry.id,
                                    event.target.value as ToolId,
                                  )
                                }
                              >
                                {Object.values(pricingData.tools).map((option) => (
                                  <option key={option.toolId} value={option.toolId}>
                                    {option.displayName}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Plan</Label>
                              <Select
                                value={entry.planId}
                                onChange={(event) =>
                                  handleEntryChange(entry.id, {
                                    planId: event.target.value,
                                  })
                                }
                              >
                                {plans.map((plan) => (
                                  <option key={plan.id} value={plan.id}>
                                    {plan.name}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Seats</Label>
                              <Input
                                type="number"
                                min={1}
                                value={entry.seats}
                                onChange={(event) =>
                                  handleEntryChange(entry.id, {
                                    seats: Number(event.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Team size</Label>
                              <Input
                                type="number"
                                min={1}
                                value={entry.teamSize}
                                onChange={(event) =>
                                  handleEntryChange(entry.id, {
                                    teamSize: Number(event.target.value),
                                    seats: Number(event.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Billing cycle</Label>
                              <Select
                                value={entry.billingCycle}
                                onChange={(event) =>
                                  handleEntryChange(entry.id, {
                                    billingCycle: event.target.value as BillingCycle,
                                  })
                                }
                              >
                                {billingOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Monthly spend (optional)</Label>
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={entry.monthlySpend}
                                onChange={(event) =>
                                  handleEntryChange(entry.id, {
                                    monthlySpend: event.target.value,
                                  })
                                }
                                placeholder="Leave blank to use plan pricing"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Use case</Label>
                              <Select
                                value={entry.useCase}
                                onChange={(event) =>
                                  handleEntryChange(entry.id, {
                                    useCase: event.target.value as UseCase,
                                  })
                                }
                              >
                                {useCaseOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </div>

                          {selectedPlan && (
                            <div className="rounded-xl bg-background/80 p-3 text-xs text-muted-foreground">
                              Selected plan: {selectedPlan.name}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button type="button" variant="outline" onClick={handleAddTool}>
                        Add another tool
                      </Button>
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setStep("location") }>
                          Back
                        </Button>
                        <Button type="button" onClick={handleAdvanceFromTools}>
                          Review audit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "review" && (
                <Card className="border-border/70 bg-background/90 shadow-sm">
                  <CardHeader>
                    <CardTitle>Review your inputs</CardTitle>
                    <CardDescription>
                      Confirm the country and subscriptions before running the audit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Country
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {selectedCountry?.label ?? country}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pricing shown in {selectedCountry?.currency ?? "USD"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Tools
                        </p>
                        <p className="mt-2 text-lg font-semibold">{entries.length}</p>
                        <p className="text-sm text-muted-foreground">
                          {totalTeamSize} total team size across the audit
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {entries.map((entry, index) => {
                        const tool = pricingData.tools[entry.toolId];
                        const plan = tool?.plans.find((item) => item.id === entry.planId);

                        return (
                          <div key={entry.id} className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm shadow-sm">
                            <p className="font-semibold">
                              {index + 1}. {tool?.displayName ?? entry.toolId}
                            </p>
                            <p className="text-muted-foreground">
                              {plan?.name ?? entry.planId} · {entry.seats} seat(s) · {entry.billingCycle}
                            </p>
                            <p className="text-muted-foreground">
                              Use case: {entry.useCase} · Team size: {entry.teamSize}
                            </p>
                            {entry.monthlySpend && (
                              <p className="text-muted-foreground">
                                Monthly spend override: {entry.monthlySpend}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button type="button" variant="ghost" onClick={handleBackFromReview}>
                        Back
                      </Button>
                      <Button type="button" onClick={handleRunAudit}>
                        Run audit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "results" && report && (
                <div className="space-y-6">
                  <Card className="border-border/70 bg-background/90 shadow-sm">
                    <CardHeader>
                      <CardTitle>Audit summary</CardTitle>
                      <CardDescription>
                        Location-based pricing applied where available.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        {report.totalsByCurrency.map((totals) => (
                          <div key={totals.currency} className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              {totals.currency}
                            </p>
                            <p className="mt-2 text-2xl font-semibold">
                              {formatCurrency(
                                totals.savingsMonthly,
                                totals.currency,
                                country,
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Estimated monthly savings
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Annual: {formatCurrency(
                                totals.savingsAnnual,
                                totals.currency,
                                country,
                              )}
                            </p>
                          </div>
                        ))}
                      </div>

                      {report.hasMixedCurrency && (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                          Multiple currencies detected. Totals are shown per currency and are not combined.
                        </div>
                      )}

                      {summaryStatus === "loading" && (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                          Generating personalized summary...
                        </div>
                      )}

                      {summaryStatus !== "loading" && summary && (
                        <Textarea readOnly value={summary} />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 bg-background/90 shadow-sm">
                    <CardHeader>
                      <CardTitle>Per-tool breakdown</CardTitle>
                      <CardDescription>
                        Current plan vs. recommended plan with reasons.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report.results.map((result) => (
                        <div key={result.toolId} className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">{result.toolName}</p>
                              <p className="text-xs text-muted-foreground">
                                {result.currentPlanName} → {result.recommended.planName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {formatCurrency(
                                  result.savingsMonthly,
                                  result.currency,
                                  country,
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">Monthly savings</p>
                            </div>
                          </div>
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {result.reasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                          {result.flags.includes("pricing-location-fallback") && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              Pricing is shown in {result.currency} due to missing local rates.
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 bg-background/90 shadow-sm">
                    <CardHeader>
                      <CardTitle>Share this audit</CardTitle>
                      <CardDescription>
                        Public links strip PII and show only tool savings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button type="button" onClick={handleCreateShare}>
                          Generate share link
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setStep("tools")}>
                          Back to edit
                        </Button>
                      </div>
                      {shareError && (
                        <p className="text-sm text-red-500">{shareError}</p>
                      )}
                      {shareUrl && (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                          Share URL: {shareUrl}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 bg-background/90 shadow-sm">
                    <CardHeader>
                      <CardTitle>Get the full audit email</CardTitle>
                      <CardDescription>
                        Optional. You will only see this after results.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={handleLeadSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              required
                              value={leadState.email}
                              onChange={(event) =>
                                setLeadState((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Company (optional)</Label>
                            <Input
                              value={leadState.company}
                              onChange={(event) =>
                                setLeadState((current) => ({
                                  ...current,
                                  company: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Role (optional)</Label>
                            <Input
                              value={leadState.role}
                              onChange={(event) =>
                                setLeadState((current) => ({
                                  ...current,
                                  role: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="hidden">
                            <Label>Website</Label>
                            <Input
                              tabIndex={-1}
                              autoComplete="off"
                              value={leadState.website}
                              onChange={(event) =>
                                setLeadState((current) => ({
                                  ...current,
                                  website: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button type="submit" disabled={leadStatus === "sending"}>
                            {leadStatus === "sending" ? "Sending..." : "Send confirmation"}
                          </Button>
                          {leadMessage && (
                            <span
                              className={
                                leadStatus === "error"
                                  ? "text-sm text-red-500"
                                  : "text-sm text-muted-foreground"
                              }
                            >
                              {leadMessage}
                            </span>
                          )}
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {report.totalsByCurrency[0] &&
                    report.totalsByCurrency[0].savingsMonthly >= 500 && (
                      <Card className="border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-primary-foreground shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-primary-foreground">Credex can help</CardTitle>
                          <CardDescription className="text-slate-200/80">
                            Savings above 500 per month often unlock bigger workflow gains.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button asChild>
                            <Link href="mailto:hello@credex.rocks">Talk to Credex</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                  {report.totalsByCurrency[0] &&
                    report.totalsByCurrency[0].savingsMonthly < 100 && (
                      <Card className="border-border/70 bg-background/90 shadow-sm">
                        <CardHeader>
                          <CardTitle>You are spending well</CardTitle>
                          <CardDescription>
                            Current plans appear efficient for your team size and use cases.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
