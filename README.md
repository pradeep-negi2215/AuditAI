# AI Spend Auditor — by Credex

AI Spend Auditor is a free tool for engineering managers and technical founders who want to know exactly how much their team overspends on AI subscriptions. It compares current tool spend against official vendor pricing, recommends right-sized plans, and produces a shareable report — in under 60 seconds, with no sign-up required.

**Live tool:** [YOUR_DEPLOYED_URL]

**Screenshot:**
> [screenshot placeholder — add before submission]

---

## What is included

- Rule-based audit engine with verified pricing data in `src/lib/audit/pricing-data.ts`.
- Country-aware pricing for US (USD) and India (INR) locales.
- Multi-step audit form with `localStorage` draft persistence.
- Shareable public report URL with PII-free Supabase storage.
- Anthropic-generated summary paragraph with hardcoded fallback on API failure.
- Lead capture form triggering a Resend confirmation email.
- Vitest unit tests for the audit engine and GitHub Actions CI for lint + tests.

---

## Local development

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your keys
npm run dev
```

Open http://localhost:3000.

---

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build (run this to catch errors before deploying)
npm run lint     # ESLint
npm test         # Vitest unit tests
```

---

## Environment variables

Set these in `.env.local` for development, or in your deployment platform's secret manager. See `.env.example` for the full list with descriptions.

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon key for client-side reads |
| `SUPABASE_URL` | Yes | Same URL, used server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key — never expose to browser |
| `RESEND_API_KEY` | Yes | Resend API key for confirmation emails |
| `ANTHROPIC_API_KEY` | Yes | Anthropic key for summary generation |
| `ANTHROPIC_SUMMARY_MODEL` | No | Defaults to `claude-sonnet-4.6` |

---

## Deployment

This project is ready for Vercel or any Node 20+ host that supports Next.js App Router.

1. Set all environment variables listed above in your deployment platform.
2. Run `npm run build` locally and confirm it exits cleanly before pushing.
3. Deploy via Vercel GitHub integration or `vercel --prod`.
4. **Note on Resend:** The `from` address requires a verified domain. The sandbox sender (`onboarding@resend.dev`) only delivers to the account owner's email. Point the `from` field in `src/lib/resend.ts` at a verified domain before launching publicly.

---

## Pricing sources

Pricing data is manually verified from official vendor pricing pages and tracked in `src/lib/audit/pricing-data.ts`. A readable summary with source URLs is in `PRICING_DATA.md`. Vendor pricing changes — verify before any production use or public launch.

---

## Decisions

Five architectural and tooling trade-offs made during this build, and why.

---

**Decision:** Rule-based audit engine over AI-powered recommendations.

**Why:** The audit results need to be *defensible* — a user who sees "$840/month in potential savings" will ask "how did you get that number?" The answer has to be traceable to a specific pricing page, not a model that may have hallucinated a plan tier. A deterministic rule engine means every recommendation has an exact source URL and a reproducible calculation. It also runs instantly with zero marginal API cost per audit.

**Trade-off:** The engine can only reason about what its rules cover. It can't infer that a team's ChatGPT usage pattern suggests they'd be better served by API access than a subscription, because that requires reading usage logs we don't have. An AI-powered approach could surface those nuanced insights — but only if the input data were richer. With the data available (tool name, plan, seat count, use case), a rules engine is more reliable and more honest about what it knows.

---

**Decision:** Next.js App Router over Pages Router.

**Why:** App Router's server components make the shareable report page (`/audit/[publicId]`) genuinely simple — the page fetches its Supabase row at request time, renders server-side, and ships zero client JavaScript for the static parts. `generateMetadata` gives the OG tags for social sharing with no extra plumbing. The layout composition model also makes it easy to keep the multi-step audit form isolated as a client component island while keeping the surrounding page structure server-rendered.

**Trade-off:** App Router's documentation was in active flux during this build. The `params` object being a `Promise` in async page components is a documented change that most tutorials don't cover, and it caused a silent runtime bug (Supabase query received `undefined` as the `publicId`) that only showed up after deployment. Pages Router is more mature and its edge cases are better covered by community resources. For a first-time Next.js project, Pages Router would have moved faster on day one.

---

**Decision:** Supabase over PlanetScale or Neon for the database.

**Why:** Supabase gives you Postgres, a dashboard for viewing rows during development, row-level security policies with a GUI, and a well-documented JavaScript client — all on a free tier that supports this project's scale. The `jsonb` column type for storing the full `AuditReport` object means no schema migration every time the audit result shape evolves. PlanetScale dropped their free tier in 2024. Neon is excellent but its branching model is more useful for teams than for a solo build.

**Trade-off:** Supabase's `@supabase/ssr` package is newer than most tutorials target, and the old `@supabase/auth-helpers-nextjs` documentation still dominates Google results. The client setup took longer than it should have because of outdated references. Neon's Postgres is closer to raw Prisma usage and would have been simpler to type correctly from the start — Supabase's `unknown` return type for `jsonb` columns required an explicit type guard that Prisma's generated types would have handled automatically.

---

**Decision:** Honeypot field for abuse protection over hCaptcha or Turnstile.

**Why:** The lead capture form is the main vector for spam submissions. A honeypot — a hidden field that real users never fill in, but bots typically do — blocks the vast majority of automated submissions with zero friction for real users and zero JavaScript dependency. hCaptcha and Cloudflare Turnstile are more robust but add a visible challenge step (even the "invisible" variants add a round-trip) and introduce a third-party dependency in the critical path of the lead capture flow. At the traffic volumes this tool will see in the first 90 days, a honeypot is sufficient.

**Trade-off:** A determined human submitting fake leads can defeat a honeypot trivially. If spam submissions become a real problem at scale — which they will once the tool has any visibility — Cloudflare Turnstile is the right next step. It's invisible to real users, has a generous free tier, and its edge validation means it doesn't add a server round-trip. The honeypot is a week-one solution, not a long-term one.

---

**Decision:** Vitest over Jest for unit testing.

**Why:** Vitest is configured with a single `vitest.config.ts` file and requires no Babel setup to handle TypeScript and ESM imports — which is the default module system in a Next.js 14 project. Jest requires either `ts-jest` or a Babel transform to handle TypeScript, and its ESM support still requires either `--experimental-vm-modules` or a workaround for dynamic imports. In a project where every hour counted, not debugging a Jest transform configuration for half a day was the right call. Vitest's API is also deliberately Jest-compatible (`describe`, `it`, `expect`), so switching later is low-friction.

**Trade-off:** Vitest is less battle-tested than Jest in large enterprise codebases, and its watch mode had one flaky behavior during this build — occasionally not detecting a changed file in `src/lib/audit/__tests__/` until the process was restarted. Jest's ecosystem is broader: more community plugins, better IDE integration in some editors, and more Stack Overflow answers when things go wrong. For a project with a larger test surface or a team unfamiliar with Vitest, Jest's maturity would outweigh its setup cost.
