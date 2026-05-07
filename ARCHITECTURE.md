# Architecture

## Overview
AI Spend Auditor is a Next.js 14 web app that gathers AI subscription inputs, runs a rule-based audit, and produces savings recommendations with citations to official pricing pages.

## Core modules
- App Router UI for inputs, results, and public share pages.
- Audit engine in src/lib/audit (pricing data + rule logic).
- Supabase persistence for audits and leads.
- Resend for confirmation email delivery.
- Anthropic summary generator for the results paragraph.

## Data flow
1. User enters tools and spend in a multi-step form with localStorage persistence.
2. Audit engine calculates plan fit, cheaper same-vendor options, and alternatives.
3. Results are saved to Supabase with PII separated from public fields.
4. Anthropic summary is generated server-side with fallback text on failure.
5. Public share URL reads sanitized audit data and renders share metadata.

## Security and privacy
- PII is never stored in public share rows.
- Service role key only used in server-side code paths.
- All secrets are supplied via environment variables.
