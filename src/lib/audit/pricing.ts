import type { BillingCycle, CountryCode, PricingPlan } from "./types";
import { getCurrencyForCountry, getLocaleForCountry } from "./locations";

export interface ResolvedPricing {
  currency: PricingPlan["currency"];
  monthlyPerSeat?: number;
  monthlyPerSeatAnnual?: number;
  monthlyFlat?: number;
  monthlyFlatAnnual?: number;
  usedFallback: boolean;
}

export const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const resolvePlanPricing = (
  plan: PricingPlan,
  country?: CountryCode,
): ResolvedPricing => {
  const regional = country ? plan.regionalPrices?.[country] : undefined;
  if (regional) {
    return {
      currency: regional.currency,
      monthlyPerSeat: regional.monthlyPerSeat ?? plan.monthlyPerSeat,
      monthlyPerSeatAnnual: regional.monthlyPerSeatAnnual ?? plan.monthlyPerSeatAnnual,
      monthlyFlat: regional.monthlyFlat ?? plan.monthlyFlat,
      monthlyFlatAnnual: regional.monthlyFlatAnnual ?? plan.monthlyFlatAnnual,
      usedFallback: false,
    };
  }

  const countryCurrency = getCurrencyForCountry(country);
  const usedFallback =
    Boolean(countryCurrency) && plan.currency !== countryCurrency;

  return {
    currency: plan.currency,
    monthlyPerSeat: plan.monthlyPerSeat,
    monthlyPerSeatAnnual: plan.monthlyPerSeatAnnual,
    monthlyFlat: plan.monthlyFlat,
    monthlyFlatAnnual: plan.monthlyFlatAnnual,
    usedFallback,
  };
};

export const getPlanMonthlyCost = (
  plan: PricingPlan,
  seats: number,
  billingCycle: BillingCycle,
  country?: CountryCode,
) => {
  const resolved = resolvePlanPricing(plan, country);

  if (plan.costModel === "seat") {
    const perSeat =
      billingCycle === "annual" && resolved.monthlyPerSeatAnnual !== undefined
        ? resolved.monthlyPerSeatAnnual
        : resolved.monthlyPerSeat ?? 0;
    return {
      monthlyCost: roundMoney(perSeat * seats),
      currency: resolved.currency,
      usedFallback: resolved.usedFallback,
    };
  }

  if (plan.costModel === "flat") {
    const flat =
      billingCycle === "annual" && resolved.monthlyFlatAnnual !== undefined
        ? resolved.monthlyFlatAnnual
        : resolved.monthlyFlat ?? 0;
    return {
      monthlyCost: roundMoney(flat),
      currency: resolved.currency,
      usedFallback: resolved.usedFallback,
    };
  }

  return {
    monthlyCost: 0,
    currency: resolved.currency,
    usedFallback: resolved.usedFallback,
  };
};

export const formatCurrency = (
  value: number,
  currency: PricingPlan["currency"],
  country?: CountryCode,
) => {
  const locale = getLocaleForCountry(country);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};
