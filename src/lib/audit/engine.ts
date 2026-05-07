import { pricingData } from "./pricing-data";
import { getCountryConfig } from "./locations";
import { getPlanMonthlyCost, resolvePlanPricing, roundMoney } from "./pricing";
import type {
  AuditReport,
  AuditTotalsByCurrency,
  BillingCycle,
  PricingPlan,
  Recommendation,
  SpendInput,
  ToolAudit,
  ToolPricing,
  UseCase,
} from "./types";

const MIN_SAVINGS_THRESHOLD = 1;
const ALT_SAVINGS_MIN_DELTA = 25;

const isPlanEligible = (plan: PricingPlan, seats: number, useCase: UseCase) => {
  if (seats < plan.minSeats) {
    return false;
  }
  if (plan.maxSeats !== undefined && seats > plan.maxSeats) {
    return false;
  }
  return plan.useCases.includes(useCase);
};

const resolveCurrentMonthlyCost = (
  spend: SpendInput,
  plan: PricingPlan,
) => {
  if (spend.monthlySpend !== undefined && spend.monthlySpend > 0) {
    return roundMoney(spend.monthlySpend);
  }

  if (plan.costModel === "metered") {
    return 0;
  }

  return getPlanMonthlyCost(
    plan,
    spend.seats,
    spend.billingCycle,
    spend.country,
  ).monthlyCost;
};

const getCheapestPlan = (
  tool: ToolPricing,
  seats: number,
  useCase: UseCase,
  billingCycle: BillingCycle,
  allowFreeTier: boolean,
  country: SpendInput["country"],
  currency: Recommendation["currency"],
) => {
  const eligiblePlans = tool.plans.filter(
    (plan) =>
      plan.planType === "subscription" && isPlanEligible(plan, seats, useCase),
  );

  const filteredPlans = allowFreeTier
    ? eligiblePlans
    : eligiblePlans.filter((plan) => !plan.isFreeTier);

  if (filteredPlans.length === 0) {
    return undefined;
  }

  const matchingCurrencyPlans = filteredPlans.filter((plan) =>
    getPlanMonthlyCost(plan, seats, billingCycle, country).currency === currency,
  );

  if (matchingCurrencyPlans.length === 0) {
    return undefined;
  }

  return matchingCurrencyPlans.reduce((cheapest, plan) => {
    const cheapestCost = getPlanMonthlyCost(
      cheapest,
      seats,
      billingCycle,
      country,
    ).monthlyCost;
    const candidateCost = getPlanMonthlyCost(
      plan,
      seats,
      billingCycle,
      country,
    ).monthlyCost;
    return candidateCost < cheapestCost ? plan : cheapest;
  }, matchingCurrencyPlans[0]);
};

const buildRecommendation = (
  candidate: Recommendation,
  currentMonthlyCost: number,
  reasons: string[],
): { recommendation: Recommendation; savingsMonthly: number; reasons: string[] } => {
  const savingsMonthly = roundMoney(currentMonthlyCost - candidate.monthlyCost);
  return {
    recommendation: candidate,
    savingsMonthly: savingsMonthly > 0 ? savingsMonthly : 0,
    reasons,
  };
};

export const auditTool = (spend: SpendInput): ToolAudit => {
  const tool = pricingData.tools[spend.toolId];
  if (!tool) {
    throw new Error(`Unknown toolId: ${spend.toolId}`);
  }

  const currentPlan = tool.plans.find((plan) => plan.id === spend.planId);
  if (!currentPlan) {
    throw new Error(`Unknown planId: ${spend.planId} for ${tool.displayName}`);
  }

  const currentPricing = resolvePlanPricing(currentPlan, spend.country);
  const currentMonthlyCost = resolveCurrentMonthlyCost(spend, currentPlan);
  const flags: string[] = [];
  const baseReasons: string[] = [];

  if (currentPricing.usedFallback) {
    flags.push("pricing-location-fallback");
    const countryConfig = getCountryConfig(spend.country);
    if (countryConfig) {
      baseReasons.push(
        `Pricing for ${countryConfig.label} is not available. Using ${currentPricing.currency} pricing instead.`,
      );
    }
  }

  if (!isPlanEligible(currentPlan, spend.seats, spend.useCase)) {
    flags.push("plan-mismatch");
    baseReasons.push(
      `Current plan does not support ${spend.seats} seats for ${spend.useCase}.`,
    );
  }

  const allowFreeTier = currentPlan.isFreeTier || currentMonthlyCost === 0;

  const candidates: Array<{
    recommendation: Recommendation;
    reasons: string[];
    savingsMonthly: number;
  }> = [];

  const cheapestSameVendor = getCheapestPlan(
    tool,
    spend.seats,
    spend.useCase,
    spend.billingCycle,
    allowFreeTier,
    spend.country,
    currentPricing.currency,
  );

  if (cheapestSameVendor && cheapestSameVendor.id !== currentPlan.id) {
    const monthlyCost = getPlanMonthlyCost(
      cheapestSameVendor,
      spend.seats,
      spend.billingCycle,
      spend.country,
    ).monthlyCost;
    const recommendation: Recommendation = {
      toolId: tool.toolId,
      toolName: tool.displayName,
      planId: cheapestSameVendor.id,
      planName: cheapestSameVendor.name,
      monthlyCost,
      currency: currentPricing.currency,
      type: "same-vendor",
    };

    candidates.push(
      buildRecommendation(recommendation, currentMonthlyCost, [
        ...baseReasons,
        "Cheaper plan available for the same vendor.",
      ]),
    );
  }

  if (tool.alternatives && tool.alternatives.length > 0) {
    tool.alternatives.forEach((altId) => {
      const altTool = pricingData.tools[altId];
      if (!altTool) {
        return;
      }

      const altEligiblePlans = altTool.plans.filter(
        (plan) =>
          plan.planType === "subscription" &&
          isPlanEligible(plan, spend.seats, spend.useCase),
      );
      const hasCurrencyMatch = altEligiblePlans.some(
        (plan) =>
          getPlanMonthlyCost(plan, spend.seats, spend.billingCycle, spend.country)
            .currency === currentPricing.currency,
      );

      if (!hasCurrencyMatch) {
        if (altEligiblePlans.length > 0) {
          flags.push("currency-mismatch");
        }
        return;
      }

      const cheapestAltPlan = getCheapestPlan(
        altTool,
        spend.seats,
        spend.useCase,
        spend.billingCycle,
        allowFreeTier,
        spend.country,
        currentPricing.currency,
      );

      if (!cheapestAltPlan) {
        return;
      }

      const altMonthlyCost = getPlanMonthlyCost(
        cheapestAltPlan,
        spend.seats,
        spend.billingCycle,
        spend.country,
      ).monthlyCost;

      const recommendation: Recommendation = {
        toolId: altTool.toolId,
        toolName: altTool.displayName,
        planId: cheapestAltPlan.id,
        planName: cheapestAltPlan.name,
        monthlyCost: altMonthlyCost,
        currency: currentPricing.currency,
        type: "alternative",
      };

      candidates.push(
        buildRecommendation(recommendation, currentMonthlyCost, [
          ...baseReasons,
          "Comparable capability with lower monthly cost.",
        ]),
      );
    });
  }

  if (tool.creditsOptions && tool.creditsOptions.length > 0) {
    tool.creditsOptions.forEach((option) => {
      if (
        currentMonthlyCost >= option.minMonthlySpend &&
        option.allowedUseCases.includes(spend.useCase)
      ) {
        const discountedCost = roundMoney(
          currentMonthlyCost * (1 - option.discountPercent),
        );

        const recommendation: Recommendation = {
          toolId: tool.toolId,
          toolName: tool.displayName,
          planId: currentPlan.id,
          planName: `${currentPlan.name} (${option.name})`,
          monthlyCost: discountedCost,
          currency: currentPricing.currency,
          type: "credits",
        };

        candidates.push(
          buildRecommendation(recommendation, currentMonthlyCost, [
            ...baseReasons,
            `Use ${option.name} pricing for eligible workloads.`,
          ]),
        );
      }
    });
  }

  const filteredCandidates = candidates.filter(
    (candidate) => candidate.savingsMonthly >= MIN_SAVINGS_THRESHOLD,
  );

  const bestSameVendor = filteredCandidates
    .filter(
      (candidate) =>
        candidate.recommendation.type === "same-vendor" ||
        candidate.recommendation.type === "credits",
    )
    .sort((a, b) => b.savingsMonthly - a.savingsMonthly)[0];

  const bestAlternative = filteredCandidates
    .filter((candidate) => candidate.recommendation.type === "alternative")
    .sort((a, b) => b.savingsMonthly - a.savingsMonthly)[0];

  let bestCandidate = bestSameVendor;
  if (bestAlternative) {
    if (!bestSameVendor) {
      bestCandidate = bestAlternative;
    } else if (
      bestAlternative.savingsMonthly - bestSameVendor.savingsMonthly >=
      ALT_SAVINGS_MIN_DELTA
    ) {
      bestCandidate = bestAlternative;
    }
  }

  const defaultRecommendation: Recommendation = {
    toolId: tool.toolId,
    toolName: tool.displayName,
    planId: currentPlan.id,
    planName: currentPlan.name,
    monthlyCost: currentMonthlyCost,
    currency: currentPricing.currency,
    type: "none",
  };

  const recommendation = bestCandidate
    ? bestCandidate.recommendation
    : defaultRecommendation;

  const savingsMonthly = bestCandidate ? bestCandidate.savingsMonthly : 0;
  const savingsAnnual = roundMoney(savingsMonthly * 12);
  const reasons = bestCandidate
    ? bestCandidate.reasons
    : ["Current plan is cost effective for your inputs."];

  return {
    toolId: tool.toolId,
    toolName: tool.displayName,
    currency: currentPricing.currency,
    pricingCountry: spend.country,
    currentPlanId: currentPlan.id,
    currentPlanName: currentPlan.name,
    currentMonthlyCost,
    recommended: recommendation,
    savingsMonthly,
    savingsAnnual,
    reasons,
    flags,
  };
};

export const runAudit = (spendInputs: SpendInput[]): AuditReport => {
  const results = spendInputs.map((input) => auditTool(input));

  const totalsMap = new Map<string, AuditTotalsByCurrency>();
  results.forEach((result) => {
    const existing = totalsMap.get(result.currency) ?? {
      currency: result.currency,
      currentMonthly: 0,
      recommendedMonthly: 0,
      savingsMonthly: 0,
      savingsAnnual: 0,
    };

    existing.currentMonthly = roundMoney(
      existing.currentMonthly + result.currentMonthlyCost,
    );
    existing.recommendedMonthly = roundMoney(
      existing.recommendedMonthly + result.recommended.monthlyCost,
    );
    existing.savingsMonthly = roundMoney(
      existing.savingsMonthly + result.savingsMonthly,
    );
    existing.savingsAnnual = roundMoney(existing.savingsMonthly * 12);

    totalsMap.set(result.currency, existing);
  });

  const totalsByCurrency = Array.from(totalsMap.values());

  return {
    results,
    totalsByCurrency,
    hasMixedCurrency: totalsByCurrency.length > 1,
  };
};
