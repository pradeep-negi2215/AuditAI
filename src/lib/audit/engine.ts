import {
  type AuditReport,
  type AuditResult,
  type SpendInput,
  type Plan,
  countryCurrencies,
  getToolById,
  getPlanById,
} from "./pricing-data";

const MIN_SAVINGS_THRESHOLD = 1;

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function calculatePlanCost(plan: Plan, seats: number): number {
  return roundMoney(plan.pricePerSeatMonthly * seats);
}

function auditToolHelper(input: SpendInput): AuditResult {
  const tool = getToolById(input.toolId);
  const currentPlan = getPlanById(input.toolId, input.currentPlanId);
  const currency = countryCurrencies[input.country];
  const reasons: string[] = [];
  const flags: string[] = [];

  // Determine current spend - only calculate from plan if monthlySpend not explicitly provided
  let currentSpendMonthly = 0;
  const explicitSpendProvided = input.monthlySpend !== undefined && input.monthlySpend !== 0;

  if (explicitSpendProvided) {
    currentSpendMonthly = input.monthlySpend ?? 0;
  } else if (currentPlan.planType === "subscription") {
    // Only calculate from plan if subscription and no explicit spend
    currentSpendMonthly = calculatePlanCost(currentPlan, input.seats);
  }

  currentSpendMonthly = roundMoney(currentSpendMonthly);

  // Rule 1: Check if user should use free tier (only if they didn't explicitly state a spend)
  if (!explicitSpendProvided && currentSpendMonthly > 0 && !currentPlan.isFreeTier) {
    const freePlans = tool.plans.filter((p) => p.isFreeTier);
    if (freePlans.length > 0) {
      const freePlan = freePlans[0]!;
      if (
        freePlan.minSeats <= input.seats &&
        (freePlan.maxSeats === 999999 || freePlan.maxSeats >= input.seats)
      ) {
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlanName: currentPlan.name,
          currentSpendMonthly,
          recommended: {
            planName: freePlan.name,
            spendMonthly: 0,
            reason: `Your usage is eligible for the free ${freePlan.name} plan.`,
          },
          savingsMonthly: roundMoney(currentSpendMonthly),
          savingsAnnual: roundMoney(currentSpendMonthly * 12),
          currency,
          reasons: [
            `The ${freePlan.name} plan is free and covers your team size of ${input.seats}.`,
            `You can save $${currentSpendMonthly.toFixed(2)}/month by switching.`,
          ],
          flags: ["free-plan-eligible"],
        };
      }
    }
  }

  // Rule 2: Check if team plan is overkill (< 3 seats on team plan)
  if (
    currentPlan.minSeats >= 3 &&
    input.seats < 3 &&
    input.seats === input.teamSize &&
    currentSpendMonthly > 0
  ) {
    const individualPlans = tool.plans.filter(
      (p) => p.minSeats === 1 && !p.isFreeTier && p.planType === "subscription",
    );
    if (individualPlans.length > 0) {
      const cheapestIndividual = individualPlans.reduce((prev, curr) =>
        calculatePlanCost(curr, 1) < calculatePlanCost(prev, 1)
          ? curr
          : prev,
      );
      const savingsMonthly = roundMoney(
        currentSpendMonthly - calculatePlanCost(cheapestIndividual, input.seats),
      );
      if (savingsMonthly >= MIN_SAVINGS_THRESHOLD) {
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlanName: currentPlan.name,
          currentSpendMonthly,
          recommended: {
            planName: cheapestIndividual.name,
            spendMonthly: calculatePlanCost(cheapestIndividual, input.seats),
            reason: `Team plan unnecessary for ${input.seats} seat(s). Individual plan is cheaper.`,
          },
          savingsMonthly,
          savingsAnnual: roundMoney(savingsMonthly * 12),
          currency,
          reasons: [
            `Current plan requires minimum ${currentPlan.minSeats} seats. You only have ${input.seats}.`,
            `Switching to ${cheapestIndividual.name} plan would save $${savingsMonthly.toFixed(2)}/month.`,
          ],
          flags: ["team-plan-overkill"],
        };
      }
    }
  }

  // Rule 3: Check for cheaper same-vendor plan (subscription only)
  // When explicit spend is provided, exclude free tier
  if (currentPlan.planType === "subscription") {
    const eligiblePlans = tool.plans.filter(
      (p) =>
        p.planType === "subscription" &&
        p.minSeats <= input.seats &&
        (p.maxSeats === 999999 || p.maxSeats >= input.seats) &&
        p.id !== currentPlan.id &&
        (!explicitSpendProvided ? true : !p.isFreeTier), // Exclude free if explicit spend provided
    );

    const cheaperPlans = eligiblePlans.filter((p) => {
      const planCost = calculatePlanCost(p, input.seats);
      return planCost < currentSpendMonthly;
    });

    if (cheaperPlans.length > 0) {
      const bestCheaper = cheaperPlans.reduce((prev, curr) => {
        const prevCost = calculatePlanCost(prev, input.seats);
        const currCost = calculatePlanCost(curr, input.seats);
        return currCost < prevCost ? curr : prev;
      });

      const savingsMonthly = roundMoney(
        currentSpendMonthly - calculatePlanCost(bestCheaper, input.seats),
      );

      if (savingsMonthly >= MIN_SAVINGS_THRESHOLD) {
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlanName: currentPlan.name,
          currentSpendMonthly,
          recommended: {
            planName: bestCheaper.name,
            spendMonthly: calculatePlanCost(bestCheaper, input.seats),
            reason: `${bestCheaper.name} plan offers the same features at a lower price.`,
          },
          savingsMonthly,
          savingsAnnual: roundMoney(savingsMonthly * 12),
          currency,
          reasons: [
            `You are on the ${currentPlan.name} plan.`,
            `The ${bestCheaper.name} plan is cheaper for your team size of ${input.seats} seats.`,
          ],
          flags: [],
        };
      }
    }
  }

  // Rule 4: Check for alternative tools with better pricing
  const alternativeTools: Array<{ tool: string; toolId: string }> = [];

  if (input.useCase === "coding") {
    alternativeTools.push(
      { tool: "Cursor", toolId: "cursor" },
      {
        tool: "GitHub Copilot",
        toolId: "github-copilot",
      },
      { tool: "Windsurf", toolId: "windsurf" },
    );
  } else if (input.useCase === "writing" || input.useCase === "research") {
    alternativeTools.push(
      { tool: "Claude", toolId: "claude" },
      { tool: "ChatGPT", toolId: "chatgpt" },
      { tool: "Google Gemini", toolId: "gemini" },
    );
  }

  for (const { tool: altToolName, toolId: altToolId } of alternativeTools) {
    if (altToolId === input.toolId) continue;

    try {
      const altTool = getToolById(altToolId as any);

      const altEligiblePlans = altTool.plans.filter(
        (p) =>
          p.planType === "subscription" &&
          p.minSeats <= input.seats &&
          (p.maxSeats === 999999 || p.maxSeats >= input.seats),
      );

      if (altEligiblePlans.length === 0) continue;

      const cheapestAlt = altEligiblePlans.reduce((prev, curr) => {
        const prevCost = calculatePlanCost(prev, input.seats);
        const currCost = calculatePlanCost(curr, input.seats);
        return currCost < prevCost ? curr : prev;
      });

      const altCost = calculatePlanCost(cheapestAlt, input.seats);
      const savingsMonthly = roundMoney(currentSpendMonthly - altCost);

      if (savingsMonthly >= MIN_SAVINGS_THRESHOLD) {
        return {
          toolId: input.toolId,
          toolName: tool.name,
          currentPlanName: currentPlan.name,
          currentSpendMonthly,
          recommended: {
            planName: `${altToolName} ${cheapestAlt.name}`,
            spendMonthly: altCost,
            reason: `${altToolName} offers comparable capabilities at a lower cost.`,
          },
          savingsMonthly,
          savingsAnnual: roundMoney(savingsMonthly * 12),
          currency,
          reasons: [
            `For ${input.useCase} use cases, ${altToolName} is a viable alternative.`,
            `Their ${cheapestAlt.name} plan costs $${altCost.toFixed(2)}/month vs your current $${currentSpendMonthly.toFixed(2)}/month.`,
          ],
          flags: ["alternative-tool-available"],
        };
      }
    } catch {
      // Tool not found, skip
      continue;
    }
  }

  // No optimization found
  return {
    toolId: input.toolId,
    toolName: tool.name,
    currentPlanName: currentPlan.name,
    currentSpendMonthly,
    recommended: null,
    savingsMonthly: 0,
    savingsAnnual: 0,
    currency,
    reasons: [
      `You are on an appropriate plan for your ${input.useCase} use case and team size.`,
    ],
    flags: ["already-optimal"],
  };
}

export function runAudit(inputs: SpendInput[]): AuditReport {
  const results = inputs.map((input) => auditToolHelper(input));

  // Calculate totals by currency
  const currencyTotals: Record<
    string,
    { savingsMonthly: number; savingsAnnual: number }
  > = {};

  results.forEach((result) => {
    if (!currencyTotals[result.currency]) {
      currencyTotals[result.currency] = {
        savingsMonthly: 0,
        savingsAnnual: 0,
      };
    }
    currencyTotals[result.currency]!.savingsMonthly = roundMoney(
      currencyTotals[result.currency]!.savingsMonthly + result.savingsMonthly,
    );
    currencyTotals[result.currency]!.savingsAnnual = roundMoney(
      currencyTotals[result.currency]!.savingsAnnual + result.savingsAnnual,
    );
  });

  const totalsByCurrency = Object.entries(currencyTotals).map(
    ([currency, totals]) => ({
      currency,
      savingsMonthly: totals.savingsMonthly,
      savingsAnnual: totals.savingsAnnual,
    }),
  );

  const hasMixedCurrency = totalsByCurrency.length > 1;

  return {
    results,
    totalsByCurrency,
    hasMixedCurrency,
    generatedAt: new Date().toISOString(),
  };
}

// Legacy export for backward compatibility
export function auditTool(input: SpendInput): AuditResult {
  return auditToolHelper(input);
}
