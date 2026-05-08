import { describe, expect, it } from "vitest";
import { runAudit } from "../engine";
import type { SpendInput } from "../pricing-data";

const baseInput: Omit<SpendInput, "toolId" | "currentPlanId"> = {
  seats: 1,
  teamSize: 1,
  useCase: "coding",
  country: "US",
  billingCycle: "monthly",
};

describe("runAudit", () => {
  it("Test 1: Team plan overkill - recommends cheaper individual plan", () => {
    const inputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "github-copilot",
        currentPlanId: "business",
        seats: 2,
        teamSize: 2,
        useCase: "coding",
        monthlySpend: 38, // Business for 2 seats: $19 * 2 = $38
      },
    ];

    const result = runAudit(inputs);

    expect(result.results).toHaveLength(1);
    const audit = result.results[0]!;

    expect(audit.toolId).toBe("github-copilot");
    expect(audit.currentPlanName).toBe("Business");
    expect(audit.recommended).not.toBeNull();
    expect(audit.recommended?.planName).toBe("Pro");
    // Pro for 2 seats: $10 * 2 = $20
    // Savings: $38 - $20 = $18/month
    expect(audit.savingsMonthly).toBe(18);
    expect(audit.flags).toContain("team-plan-overkill");
  });

  it("Test 2: Already optimal - no optimization available", () => {
    const inputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "claude",
        currentPlanId: "max-5x",
        seats: 1,
        teamSize: 1,
        useCase: "writing",
        monthlySpend: 100, // On max plan
      },
    ];

    // Check what options exist for Claude max-5x
    // The engine should find alternatives like Claude Max-20x (more expensive)
    // or cheaper options like Claude Pro or free
    // So this ISN'T actually optimal - there's a free tier
    // Let's instead use a test where truly optimal (no free tier in alternatives)
    
    // Better test: Use API tool where there's truly no cheaper option
    const apiInputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "anthropic-api",
        currentPlanId: "haiku-4-5",
        seats: 1,
        teamSize: 1,
        useCase: "api-integration",
        monthlySpend: 6,
      },
    ];

    const result = runAudit(apiInputs);

    expect(result.results).toHaveLength(1);
    const audit = result.results[0]!;

    // Haiku is the cheapest anthropic model, API plans can't use free tier logic
    expect(audit.recommended).toBeNull();
    expect(audit.savingsMonthly).toBe(0);
    expect(audit.flags).toContain("already-optimal");
  });

  it("Test 3: Free plan eligible - no spend provided, so free tier recommended", () => {
    const inputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "windsurf",
        currentPlanId: "pro",
        seats: 1,
        teamSize: 1,
        useCase: "coding",
        // No monthlySpend provided - engine will calculate $15 from plan, then recommend free
      },
    ];

    const result = runAudit(inputs);

    expect(result.results).toHaveLength(1);
    const audit = result.results[0]!;

    expect(audit.recommended?.planName).toBe("Free (25 credits)");
    expect(audit.savingsMonthly).toBe(15);
    expect(audit.flags).toContain("free-plan-eligible");
  });

  it("Test 4: Cheaper plan for explicit spend - recommend lower-cost paid alternative", () => {
    const inputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "cursor",
        currentPlanId: "pro-plus",
        seats: 1,
        teamSize: 1,
        useCase: "coding",
        monthlySpend: 60, // Pro+ is $60
      },
    ];

    const result = runAudit(inputs);

    expect(result.results).toHaveLength(1);
    const audit = result.results[0]!;

    // Should recommend Pro at $20, saving $40/month
    expect(audit.recommended?.planName).toBe("Pro");
    expect(audit.savingsMonthly).toBe(40);
  });

  it("Test 5: Alternative tool - writing user gets cheaper writing alternative", () => {
    const inputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "claude",
        currentPlanId: "max-5x",
        seats: 1,
        teamSize: 1,
        useCase: "writing",
        monthlySpend: 100,
      },
    ];

    const result = runAudit(inputs);

    expect(result.results).toHaveLength(1);
    const audit = result.results[0]!;

    // Claude Max-5x is $100, should find cheaper writing alternative
    expect(audit.recommended).not.toBeNull();
    expect(audit.savingsMonthly).toBeGreaterThan(0);
  });

  it("Test 6: Total savings calculation - multiple tools with correct currency totals", () => {
    const inputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "cursor",
        currentPlanId: "pro-plus",
        seats: 1,
        teamSize: 1,
        monthlySpend: 60,
      },
      {
        ...baseInput,
        toolId: "claude",
        currentPlanId: "pro",
        seats: 1,
        teamSize: 1,
        useCase: "writing",
        monthlySpend: 20,
      },
      {
        ...baseInput,
        toolId: "chatgpt",
        currentPlanId: "plus",
        seats: 1,
        teamSize: 1,
        useCase: "writing",
        monthlySpend: 20,
      },
    ];

    const result = runAudit(inputs);

    expect(result.results).toHaveLength(3);

    // Check totalsByCurrency
    expect(result.totalsByCurrency.length).toBeGreaterThan(0);
    const usdTotal = result.totalsByCurrency.find((t) => t.currency === "USD");
    expect(usdTotal).toBeDefined();
    if (usdTotal) {
      expect(usdTotal.savingsAnnual).toBe(usdTotal.savingsMonthly * 12);
    }
  });

  it("Test 7: Mixed currency detection - USD and INR tools show hasMixedCurrency", () => {
    const inputs: SpendInput[] = [
      {
        ...baseInput,
        toolId: "cursor",
        currentPlanId: "pro",
        seats: 1,
        teamSize: 1,
        country: "US",
        monthlySpend: 20,
      },
      {
        ...baseInput,
        toolId: "gemini",
        currentPlanId: "plus",
        seats: 1,
        teamSize: 1,
        country: "IN",
        useCase: "writing",
        monthlySpend: 799,
      },
    ];

    const result = runAudit(inputs);

    expect(result.results).toHaveLength(2);
    expect(result.hasMixedCurrency).toBe(true);
    const currencies = result.totalsByCurrency.map((t) => t.currency);
    expect(currencies).toContain("USD");
    expect(currencies).toContain("INR");
  });
});
