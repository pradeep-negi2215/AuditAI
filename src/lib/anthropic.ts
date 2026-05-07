export interface SummaryContext {
  companyName?: string;
  teamSize?: number;
  currency?: string;
  totalMonthlySavings: number;
  highlights: string[];
}

const buildFallbackSummary = (context: SummaryContext) => {
  const currency = context.currency ?? "USD";
  const savingsLine =
    context.totalMonthlySavings > 0
      ? `We found an estimated ${currency} ${context.totalMonthlySavings.toFixed(2)} in monthly savings.`
      : "We did not find meaningful overspend at this time.";

  const highlights =
    context.highlights.length > 0
      ? `Top opportunities: ${context.highlights.join(", ")}.`
      : "No immediate plan changes were flagged.";

  return `${savingsLine} ${highlights} Keep reviewing usage monthly as plans and pricing change.`;
};

const buildSummaryPrompt = (context: SummaryContext) => {
  const company = context.companyName ? `Company: ${context.companyName}` : "Company: N/A";
  const teamSize = context.teamSize ? `Team size: ${context.teamSize}` : "Team size: N/A";
  const currency = context.currency ?? "USD";

  return [
    company,
    teamSize,
    `Estimated monthly savings: ${currency} ${context.totalMonthlySavings.toFixed(2)}`,
    `Highlights: ${context.highlights.join(" | ") || "None"}`,
  ].join("\n");
};

export const generateSummary = async (context: SummaryContext) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return buildFallbackSummary(context);
  }

  const model = process.env.ANTHROPIC_SUMMARY_MODEL ?? "claude-sonnet-4.6";
  const prompt = buildSummaryPrompt(context);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 220,
        temperature: 0.4,
        system:
          "Write a single 90-110 word paragraph summarizing the audit results. Use neutral tone. Avoid promises or guarantees. Use the provided numbers only.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return buildFallbackSummary(context);
    }

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };

    const text = data.content?.[0]?.text?.trim();
    if (!text) {
      return buildFallbackSummary(context);
    }

    return text;
  } catch {
    return buildFallbackSummary(context);
  }
};
