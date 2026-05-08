// New spec exports
export * from "./pricing-data";
export { runAudit, auditTool } from "./engine";

// Legacy exports for backward compatibility
export { pricingData } from "./pricing-data";
export { countryOptions, getCountryConfig } from "./locations";
export { formatCurrency, getPlanMonthlyCost, resolvePlanPricing } from "./pricing";
export type {
  AuditReport,
  AuditTotalsByCurrency,
  BillingCycle,
  CountryCode,
  CreditsOption,
  PricingData,
  PricingPlan,
  Recommendation,
  SpendInput,
  ToolAudit,
  ToolId,
  ToolPricing,
  UseCase,
} from "./types";
