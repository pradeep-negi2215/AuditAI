export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export type PlanId = string;
export type UseCase =
  | "coding"
  | "writing"
  | "research"
  | "api-integration"
  | "general";
export type BillingCycle = "monthly" | "annual";
export type CountryCode = "US" | "IN" | "GB" | "CA" | "AU" | "DE" | "FR";

export interface Plan {
  id: PlanId;
  name: string;
  pricePerSeatMonthly: number;
  isFreeTier: boolean;
  planType: "subscription" | "api";
  minSeats: number;
  maxSeats: number;
}

export interface Tool {
  id: ToolId;
  name: string;
  category: "coding-assistant" | "writing-assistant" | "api" | "general-ai";
  plans: Plan[];
}

export interface PricingDatabase {
  tools: Record<ToolId, Tool>;
}

export interface SpendInput {
  toolId: ToolId;
  currentPlanId: PlanId;
  seats: number;
  teamSize: number;
  useCase: UseCase;
  monthlySpend?: number;
  monthlyTokens?: number;
  country: CountryCode;
  billingCycle: BillingCycle;
}

export interface AuditResult {
  toolId: ToolId;
  toolName: string;
  currentPlanName: string;
  currentSpendMonthly: number;
  recommended: {
    planName: string;
    spendMonthly: number;
    reason: string;
  } | null;
  savingsMonthly: number;
  savingsAnnual: number;
  currency: string;
  reasons: string[];
  flags: string[];
}

export interface AuditReport {
  results: AuditResult[];
  totalsByCurrency: {
    currency: string;
    savingsMonthly: number;
    savingsAnnual: number;
  }[];
  hasMixedCurrency: boolean;
  generatedAt: string;
}

export const countryOptions: { code: CountryCode; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
];

export const countryCurrencies: Record<CountryCode, string> = {
  US: "USD",
  IN: "INR",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
};

export function formatCurrency(
  amount: number,
  currency: string,
  country: CountryCode,
): string {
  const formatter = new Intl.NumberFormat(
    country === "US"
      ? "en-US"
      : country === "IN"
        ? "en-IN"
        : country === "GB"
          ? "en-GB"
          : country === "CA"
            ? "en-CA"
            : country === "AU"
              ? "en-AU"
              : country === "DE"
                ? "de-DE"
                : "fr-FR",
    {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  return formatter.format(amount);
}

export const pricingData: PricingDatabase = {
  tools: {
    cursor: {
      id: "cursor",
      name: "Cursor",
      category: "coding-assistant",
      plans: [
        {
          id: "hobby",
          name: "Hobby (Free)",
          pricePerSeatMonthly: 0,
          isFreeTier: true,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro",
          name: "Pro",
          pricePerSeatMonthly: 20,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro-plus",
          name: "Pro Plus",
          pricePerSeatMonthly: 60,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "ultra",
          name: "Ultra",
          pricePerSeatMonthly: 200,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "teams",
          name: "Teams",
          pricePerSeatMonthly: 40,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 3,
          maxSeats: 999,
        },
        {
          id: "enterprise",
          name: "Enterprise",
          pricePerSeatMonthly: 0,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 10,
          maxSeats: 9999,
        },
      ],
    },
    "github-copilot": {
      id: "github-copilot",
      name: "GitHub Copilot",
      category: "coding-assistant",
      plans: [
        {
          id: "free",
          name: "Free",
          pricePerSeatMonthly: 0,
          isFreeTier: true,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro",
          name: "Pro",
          pricePerSeatMonthly: 10,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro-plus",
          name: "Pro Plus",
          pricePerSeatMonthly: 39,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "business",
          name: "Business",
          pricePerSeatMonthly: 19,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 3,
          maxSeats: 999,
        },
        {
          id: "enterprise",
          name: "Enterprise",
          pricePerSeatMonthly: 39,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 10,
          maxSeats: 9999,
        },
      ],
    },
    claude: {
      id: "claude",
      name: "Claude",
      category: "writing-assistant",
      plans: [
        {
          id: "free",
          name: "Free",
          pricePerSeatMonthly: 0,
          isFreeTier: true,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro",
          name: "Pro",
          pricePerSeatMonthly: 20,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "max-5x",
          name: "Max (5x)",
          pricePerSeatMonthly: 100,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "max-20x",
          name: "Max (20x)",
          pricePerSeatMonthly: 200,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "team-standard",
          name: "Team Standard",
          pricePerSeatMonthly: 20,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 3,
          maxSeats: 999,
        },
        {
          id: "team-premium",
          name: "Team Premium",
          pricePerSeatMonthly: 100,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 3,
          maxSeats: 999,
        },
      ],
    },
    chatgpt: {
      id: "chatgpt",
      name: "ChatGPT",
      category: "general-ai",
      plans: [
        {
          id: "free",
          name: "Free",
          pricePerSeatMonthly: 0,
          isFreeTier: true,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "plus",
          name: "Plus",
          pricePerSeatMonthly: 20,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro-100",
          name: "Pro 100",
          pricePerSeatMonthly: 100,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro-200",
          name: "Pro 200",
          pricePerSeatMonthly: 200,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "business",
          name: "Business",
          pricePerSeatMonthly: 20,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 3,
          maxSeats: 999,
        },
      ],
    },
    "anthropic-api": {
      id: "anthropic-api",
      name: "Anthropic API",
      category: "api",
      plans: [
        {
          id: "haiku-4-5",
          name: "Haiku 4.5",
          pricePerSeatMonthly: 6,
          isFreeTier: false,
          planType: "api",
          minSeats: 1,
          maxSeats: 9999,
        },
        {
          id: "sonnet-4-6",
          name: "Sonnet 4.6",
          pricePerSeatMonthly: 18,
          isFreeTier: false,
          planType: "api",
          minSeats: 1,
          maxSeats: 9999,
        },
        {
          id: "opus-4-6",
          name: "Opus 4.6",
          pricePerSeatMonthly: 30,
          isFreeTier: false,
          planType: "api",
          minSeats: 1,
          maxSeats: 9999,
        },
      ],
    },
    "openai-api": {
      id: "openai-api",
      name: "OpenAI API",
      category: "api",
      plans: [
        {
          id: "gpt-5-4",
          name: "GPT-5.4",
          pricePerSeatMonthly: 12.5,
          isFreeTier: false,
          planType: "api",
          minSeats: 1,
          maxSeats: 9999,
        },
        {
          id: "gpt-5-5",
          name: "GPT-5.5",
          pricePerSeatMonthly: 35,
          isFreeTier: false,
          planType: "api",
          minSeats: 1,
          maxSeats: 9999,
        },
        {
          id: "gpt-4o-mini",
          name: "GPT-4o Mini",
          pricePerSeatMonthly: 0.375,
          isFreeTier: false,
          planType: "api",
          minSeats: 1,
          maxSeats: 9999,
        },
      ],
    },
    gemini: {
      id: "gemini",
      name: "Google Gemini",
      category: "general-ai",
      plans: [
        {
          id: "free",
          name: "Free",
          pricePerSeatMonthly: 0,
          isFreeTier: true,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "plus",
          name: "Gemini Plus",
          pricePerSeatMonthly: 7.99,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro",
          name: "Gemini Pro",
          pricePerSeatMonthly: 19.99,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "ultra",
          name: "Gemini Ultra",
          pricePerSeatMonthly: 249.99,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
      ],
    },
    windsurf: {
      id: "windsurf",
      name: "Windsurf",
      category: "coding-assistant",
      plans: [
        {
          id: "free",
          name: "Free (25 credits)",
          pricePerSeatMonthly: 0,
          isFreeTier: true,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "pro",
          name: "Pro (500 credits)",
          pricePerSeatMonthly: 15,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 1,
          maxSeats: 1,
        },
        {
          id: "teams",
          name: "Teams",
          pricePerSeatMonthly: 30,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 3,
          maxSeats: 999,
        },
        {
          id: "enterprise",
          name: "Enterprise",
          pricePerSeatMonthly: 60,
          isFreeTier: false,
          planType: "subscription",
          minSeats: 10,
          maxSeats: 9999,
        },
      ],
    },
  },
};

export function getToolById(toolId: ToolId): Tool {
  const tool = pricingData.tools[toolId];
  if (!tool) {
    throw new Error(`Tool not found: ${toolId}`);
  }
  return tool;
}

export function getPlanById(toolId: ToolId, planId: PlanId): Plan {
  const tool = getToolById(toolId);
  const plan = tool.plans.find((p) => p.id === planId);
  if (!plan) {
    throw new Error(`Plan not found for tool ${toolId}: ${planId}`);
  }
  return plan;
}

export function getDefaultPlanId(toolId: ToolId): PlanId {
  const tool = getToolById(toolId);
  const freePlan = tool.plans.find((p) => p.isFreeTier);
  return freePlan ? freePlan.id : tool.plans[0]!.id;
}
