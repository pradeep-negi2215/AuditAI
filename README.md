# AI Spend Auditor (Credex)

Free, pricing-grounded audits that show AI subscription overspend, recommended plan switches, and estimated savings.

## What is included

- Rule-based audit engine with pricing data in `src/lib/audit`.
- Country-aware pricing for supported regional plans.
- Next.js 14 App Router setup with Tailwind CSS and shadcn/ui base components.
- Supabase, Resend, and Anthropic client stubs (no secrets in repo).
- Vitest tests and GitHub Actions CI for lint and tests.

## Local development

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run lint
npm test
```

## Environment variables

Set these in `.env.local` (do not commit secrets):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- ANTHROPIC_API_KEY
- ANTHROPIC_SUMMARY_MODEL (optional, default: claude-sonnet-4.6)

## Pricing sources

Pricing data is tracked in `src/lib/audit/pricing-data.ts` and summarized in PRICING_DATA.md. Verify before production use since vendor pricing changes.
