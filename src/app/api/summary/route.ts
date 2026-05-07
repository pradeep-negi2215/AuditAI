import { NextResponse } from "next/server";

import { generateSummary } from "@/lib/anthropic";

export async function POST(request: Request) {
  const payload = await request.json();
  const summary = await generateSummary(payload);

  return NextResponse.json({ summary });
}
