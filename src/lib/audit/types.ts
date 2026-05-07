export type ToolId =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "gemini"
  | "openai_api"
  | "anthropic_api"
  | "windsurf"
  | "v0";

export type ToolCategory = "coding" | "assistant" | "prototyping" | "api";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type BillingCycle = "monthly" | "annual";

export type CurrencyCode = "USD" | "INR";

export type CountryCode = "US" | "IN";

export type PlanCostModel = "seat" | "flat" | "metered";

export interface SpendInput {
  toolId: ToolId;
  planId: string;
  monthlySpend?: number;
  seats: number;
  teamSize: number;
  useCase: UseCase;
  billingCycle: BillingCycle;
  country?: CountryCode;
}

export interface ApiPricingReference {
  model: string;
  inputPer1MTokens: number;
  outputPer1MTokens: number;
  cachedInputPer1MTokens?: number;
  sourceUrl: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  planType: "subscription" | "api";
  costModel: PlanCostModel;
  currency: CurrencyCode;
  monthlyPerSeat?: number;
  monthlyPerSeatAnnual?: number;
  monthlyFlat?: number;
  monthlyFlatAnnual?: number;
  minSeats: number;
  maxSeats?: number;
  useCases: UseCase[];
  sourceUrl: string;
  notes?: string;
  apiPricing?: ApiPricingReference;
  isFreeTier?: boolean;
  regionalPrices?: Partial<
    Record<
      CountryCode,
      {
        currency: CurrencyCode;
        monthlyPerSeat?: number;
        monthlyPerSeatAnnual?: number;
        monthlyFlat?: number;
        monthlyFlatAnnual?: number;
      }
    >
  >;
}

export interface CreditsOption {
  id: string;
  name: string;
  discountPercent: number;
  minMonthlySpend: number;
  allowedUseCases: UseCase[];
  sourceUrl: string;
  notes?: string;
}

export interface ToolPricing {
  toolId: ToolId;
  displayName: string;
  category: ToolCategory;
  plans: PricingPlan[];
  creditsOptions?: CreditsOption[];
  alternatives?: ToolId[];
}

export interface PricingData {
  tools: Record<ToolId, ToolPricing>;
}

export interface Recommendation {
  toolId: ToolId;
  toolName: string;
  planId: string;
  planName: string;
  monthlyCost: number;
  currency: CurrencyCode;
  type: "same-vendor" | "alternative" | "credits" | "none";
}

export interface ToolAudit {
  toolId: ToolId;
  toolName: string;
  currency: CurrencyCode;
  pricingCountry?: CountryCode;
  currentPlanId: string;
  currentPlanName: string;
  currentMonthlyCost: number;
  recommended: Recommendation;
  savingsMonthly: number;
  savingsAnnual: number;
  reasons: string[];
  flags: string[];
}

export interface AuditTotalsByCurrency {
  currency: CurrencyCode;
  currentMonthly: number;
  recommendedMonthly: number;
  savingsMonthly: number;
  savingsAnnual: number;
}

export interface AuditReport {
  results: ToolAudit[];
  totalsByCurrency: AuditTotalsByCurrency[];
  hasMixedCurrency: boolean;
}
