import Anthropic from "@anthropic-ai/sdk";

export type SummaryInput = {
  teamSize?: number;
  currency?: string;
  totalMonthlySavings: number;
  highlights: string[];
};

export async function generateSummary(input: SummaryInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If API key is not set, return fallback immediately
  if (!apiKey) {
    return `Based on your current subscriptions, our audit identified potential savings of ${input.totalMonthlySavings} per month. Review the breakdown below for specific recommendations.`;
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system:
        "Write a single 90–110 word paragraph summarizing an AI spend audit. Neutral tone. Use only the numbers provided. No promises or guarantees.",
      messages: [
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });

    // Extract text from the response
    const textContent = message.content.find((block) => block.type === "text");
    if (textContent && textContent.type === "text") {
      return textContent.text;
    }

    // Fallback if no text content
    return `Based on your current subscriptions, our audit identified potential savings of ${input.totalMonthlySavings} per month. Review the breakdown below for specific recommendations.`;
  } catch {
    // On any error, return fallback string — never throw
    return `Based on your current subscriptions, our audit identified potential savings of ${input.totalMonthlySavings} per month. Review the breakdown below for specific recommendations.`;
  }
}
