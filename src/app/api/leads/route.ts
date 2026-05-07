import { NextResponse } from "next/server";

import { getResendClient } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    email?: string;
    company?: string;
    role?: string;
    website?: string;
    auditPublicId?: string | null;
  };

  if (payload.website) {
    return NextResponse.json({ ok: true });
  }

  if (!payload.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
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

  const { error } = await supabase.from("leads").insert({
    email: payload.email,
    company: payload.company ?? null,
    role: payload.role ?? null,
    audit_public_id: payload.auditPublicId ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to store lead." }, { status: 500 });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (fromEmail) {
    const resend = getResendClient();
    await resend.emails.send({
      from: fromEmail,
      to: payload.email,
      subject: "Your AI Spend Audit",
      text: "Thanks for using the AI Spend Auditor. We will follow up with your audit insights.",
    });
  }

  return NextResponse.json({ ok: true });
}
