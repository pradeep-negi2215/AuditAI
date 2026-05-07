import { NextResponse } from "next/server";

import type { AuditReport, CountryCode } from "@/lib/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    report?: AuditReport;
    country?: CountryCode;
  };

  if (!payload.report) {
    return NextResponse.json({ error: "Missing report." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const publicId = crypto.randomUUID();
  const { error } = await supabase.from("audits").insert({
    public_id: publicId,
    country: payload.country ?? null,
    report: payload.report,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to store audit." }, { status: 500 });
  }

  return NextResponse.json({ publicId });
}
