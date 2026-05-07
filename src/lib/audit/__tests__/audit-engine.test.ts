import { describe, expect, it } from "vitest";
import { auditTool, runAudit } from "../engine";

const baseInput = {
  seats: 1,
  teamSize: 1,
  billingCycle: "monthly" as const,
  useCase: "coding" as const,
};

describe("auditTool", () => {
  it("recommends a cheaper same-vendor plan", () => {
    const result = auditTool({
      ...baseInput,
      toolId: "cursor",
      planId: "cursor_pro_plus",
      monthlySpend: 60,
    });

    expect(result.recommended.planId).toBe("cursor_pro");
    expect(result.savingsMonthly).toBe(40);
  });

  it("recommends a cheaper alternative tool", () => {
    const result = auditTool({
      toolId: "cursor",
      planId: "cursor_teams",
      monthlySpend: 200,
      seats: 5,
      teamSize: 5,
      billingCycle: "monthly",
      useCase: "coding",
    });

    expect(result.recommended.toolId).toBe("copilot");
    expect(result.recommended.planId).toBe("copilot_pro");
    expect(result.savingsMonthly).toBe(150);
  });

  it("downgrades an overpriced tier", () => {
    const result = auditTool({
      toolId: "windsurf",
      planId: "windsurf_max",
      monthlySpend: 200,
      seats: 1,
      teamSize: 1,
      billingCycle: "monthly",
      useCase: "coding",
    });

    expect(result.recommended.planId).toBe("windsurf_pro");
    expect(result.savingsMonthly).toBe(180);
  });

  it("applies batch discount for API spend", () => {
    const result = auditTool({
      toolId: "openai_api",
      planId: "openai_api_payg",
      monthlySpend: 1000,
      seats: 1,
      teamSize: 1,
      billingCycle: "monthly",
      useCase: "data",
    });

    expect(result.recommended.type).toBe("credits");
    expect(result.savingsMonthly).toBe(500);
  });

  it("uses country-based pricing for Gemini in India", () => {
    const result = auditTool({
      toolId: "gemini",
      planId: "gemini_ai_pro",
      monthlySpend: 0,
      seats: 1,
      teamSize: 1,
      billingCycle: "monthly",
      useCase: "mixed",
      country: "IN",
    });

    expect(result.currentMonthlyCost).toBe(1950);
    expect(result.currency).toBe("INR");
  });
});

describe("runAudit", () => {
  it("reports mixed currency totals", () => {
    const report = runAudit([
      {
        toolId: "chatgpt",
        planId: "chatgpt_go",
        monthlySpend: 399,
        seats: 1,
        teamSize: 1,
        billingCycle: "monthly",
        useCase: "writing",
      },
      {
        toolId: "cursor",
        planId: "cursor_pro",
        monthlySpend: 20,
        seats: 1,
        teamSize: 1,
        billingCycle: "monthly",
        useCase: "coding",
      },
    ]);

    expect(report.hasMixedCurrency).toBe(true);
    expect(report.totalsByCurrency.length).toBe(2);
  });
});
