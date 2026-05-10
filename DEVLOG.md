# Devlog — AI Spend Auditor

Solo build for a Credex internship assignment. Stack: Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase, Resend, Anthropic API.

---

## Day 1 — 2026-05-01

**Hours worked:** 2.5

**What I did:**
Read through the assignment doc three times to make sure I understood the actual scope before touching any code. The brief said "AI spend auditor with shareable results" — I spent the first hour mapping out what that actually means end-to-end: multi-step form → rule engine → results page → public share URL → optional lead capture → email. Drew it on paper.

Then scaffolded the Next.js 14 app with `npx create-next-app@14 auditai --typescript --tailwind --app --src-dir --import-alias "@/*"`. Added shadcn/ui via `npx shadcn@latest init` and installed the base components I knew I'd need immediately: button, card, input, label, select, textarea. Pushed to GitHub and set up the repo with a `.gitignore` and `.env.example`.

Wrote a rough `ARCHITECTURE.md` so I'd have something to refer back to when I inevitably forgot my own decisions.

**What I learned:**
shadcn's `init` command asks a ton of questions interactively. There's a `--defaults` flag I didn't know about that skips most of them. Would've saved five minutes. Also: `--import-alias "@/*"` is not the same as `@/` — it's a glob. Wasted ten minutes wondering why my imports were broken until I re-read the tsconfig.

**Blockers / what I'm stuck on:**
Not blocked exactly, but I haven't decided whether to use the Anthropic API for the full audit logic or just for generating the summary paragraph. The assignment doesn't specify. I'll use it only for the summary and keep the audit logic deterministic — that feels more defensible.

**Plan for tomorrow:**
Design the audit engine data model. Figure out what pricing data I actually need to hard-code and write `src/lib/audit/pricing-data.ts`.

---

## Day 2 — 2026-05-02

**Hours worked:** 4

**What I did:**
Spent the first hour going through official pricing pages for every tool listed in the assignment: ChatGPT, Claude, Gemini, GitHub Copilot, Cursor, Windsurf, v0, Notion AI. Documented everything in `PRICING_DATA.md` with source URLs and verification date. Noticed that ChatGPT India pricing is in INR and completely different from the USD pricing — this broke my initial assumption that all pricing is per-user-per-month in USD. Had to add a `currency` field to my plan type.

Designed the TypeScript types in `src/lib/audit/types.ts`: `ToolInput`, `AuditedTool`, `AuditResult`, `PlanOption`, `Recommendation`. The hardest call was whether `seatCount` should live on `ToolInput` or be a top-level field on the audit form. Settled on top-level because most tools are priced per seat for the whole team, not per-tool.

Wrote `src/lib/audit/pricing-data.ts` — ended up being about 400 lines because each tool needed multiple plan objects with `pricePerSeat`, `minSeats`, `maxSeats`, `billingCycle`, and `features`. Also started `src/lib/audit/locations.ts` for the country-aware currency override (just US → USD and IN → INR for now).

**What I learned:**
GitHub Copilot has a free tier now. Most pricing comparison tools I looked at for reference still show the old $10/month-only pricing. If I had just scraped a third-party site instead of going to the official pages, my data would have been wrong from day one.

Notion AI is bundled into Notion plans now — it's not a separate line item anymore. Decided to exclude it from the tool list rather than model it incorrectly.

**Blockers / what I'm stuck on:**
The Gemini pricing page shows "Google AI Plus", "Google AI Pro", and "Google AI Ultra" — but I can't tell if "Google AI Pro" maps to what used to be called "Gemini Advanced". The page doesn't say. I've added a comment in `pricing-data.ts` flagging this as unverified and will just go with the prices as listed.

**Plan for tomorrow:**
Write the rule engine in `src/lib/audit/engine.ts`, wire up `src/lib/audit/index.ts` as the public entry point, and write the first Vitest tests.

---

## Day 3 — 2026-05-03

**Hours worked:** 5.5

**What I did:**
Wrote the core audit logic in `src/lib/audit/engine.ts`. The engine takes a list of `ToolInput` objects and a `seatCount`, looks up the tool in `pricing-data.ts`, calculates what the team is *currently* paying versus what the cheapest appropriate plan would cost, and returns a structured `AuditResult` with per-tool `Recommendation` objects.

Got the happy path working in about two hours. Then wrote tests in `src/lib/audit/__tests__/engine.test.ts` — six tests covering: correct savings calculation, no-downgrade recommendation when already on cheapest plan, per-seat vs flat-rate plan distinction, and zero-spend edge case.

Three tests failed immediately. Two were math errors I'd made in the fixture data. The third was a type error that took an embarrassingly long time to track down:

```
Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

The error was on line 47 of `engine.ts` — I was doing `pricing-data.ts` lookup with `TOOLS[input.toolId]` and then accessing `.plans[0].name` without checking whether the tool existed in the map. TypeScript was right to complain. Fixed by adding a guard and returning an early `null` recommendation for unknown tool IDs, with a test to confirm that path.

Also wired up `src/lib/audit/index.ts` as a barrel export: `export { runAudit } from "./engine"` and re-exported the types from `./types`.

**What I learned:**
TypeScript's "optional chaining is not enough" lesson — `TOOLS[input.toolId]?.plans[0].name` still gives `string | undefined` because `plans[0]` can itself be undefined if the array is empty. You can't just sprinkle `?.` everywhere and assume you're safe. You have to think about what each link in the chain actually guarantees.

**Blockers / what I'm stuck on:**
The per-seat math works fine for tools like GitHub Copilot where every seat costs the same. But Cursor Teams is `$40/user/month` with no volume discount. I want to flag when a team is small enough that individual Pro accounts ($20/mo each) would be cheaper than the Teams plan. The engine doesn't handle that comparison yet — it only compares within a single tool's plan list, not across billing structures. Added a TODO comment; will revisit if time allows.

**Plan for tomorrow:**
Build the multi-step audit form in `src/app/audit/page.tsx` with localStorage persistence between steps.

---

## Day 4 — 2026-05-04

**Hours worked:** 6

**What I did:**
Built the multi-step form. This was the largest single-day chunk of work. The form has four steps: (1) team size and country, (2) tool selection with per-tool plan and spend fields, (3) a review/confirm screen, (4) results. Steps 1–3 are client-side with localStorage persistence so nothing is lost on refresh. Step 4 fires the submit and renders results.

Used `useState` for the active step index and a `useEffect` that saves the entire form state object to `localStorage` under the key `auditai_draft` on every change, and reads it back on mount. Took about 45 minutes to get the round-trip working without hydration mismatches — the trick was reading localStorage inside a `useEffect`, not during render.

Added dynamic tool rows: the user can add/remove tools from a list, and each row has selects for tool name and current plan, plus a number input for seat count. Wired this up to the audit engine on submission.

The shadcn `Select` component inside a `.map()` hit a bug I didn't see coming: every select was sharing the same open/close state because I'd forgotten to give each one a unique `key` that included the index, not just the tool name (which wasn't set yet on new rows). Took 40 minutes to figure out. Fixed by keying on `row-${index}` instead of `row-${toolId}`.

**What I learned:**
`localStorage` access during SSR in Next.js App Router causes a `ReferenceError: localStorage is not defined` at build time if you're not careful. Wrapping it in `typeof window !== "undefined"` is the fix, but it's easy to miss when you're used to CRA where everything is client-side by default.

Also learned that shadcn's `Select` uses Radix UI's `SelectRoot` under the hood, and the open/close state is internal to each root instance — so duplicate keys between instances will cause React to reuse the wrong DOM node.

**Blockers / what I'm stuck on:**
The form submit handler calls `runAudit()` synchronously, then needs to save results to Supabase and also call the Anthropic API for the summary — both async. I haven't wired those up yet. For now the results just render client-side without persistence. Need to add a server action or an API route tomorrow.

**Plan for tomorrow:**
Build the results page UI and wire up the Anthropic API summary call via a Next.js route handler.

---

## Day 5 — 2026-05-05

**Hours worked:** 5

**What I did:**
Built the results page UI — savings headline, per-tool recommendation cards, and a narrative summary paragraph. The summary paragraph slot is a server-rendered string that comes back from the Anthropic API via `POST /api/audit/summarise`.

Wrote `src/lib/anthropic.ts` to wrap the Anthropic SDK. The route handler in `src/app/api/audit/summarise/route.ts` takes the `AuditResult` as JSON, builds a short prompt, calls `claude-3-5-haiku-20241022` (cheapest model that can write a coherent paragraph), and returns the text. Added a 10-second timeout and a try/catch that falls back to a hardcoded template string so the results page always renders even if the API is down or over quota.

The first API call I made during testing came back with:
```
AnthropicError: 401 {"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}
```

I had set `ANTHROPIC_API_KEY` in `.env.local` correctly but the route handler was running in the Edge runtime, which doesn't have access to `process.env` in the same way as the Node runtime. Adding `export const runtime = "nodejs"` to the route file fixed it.

**What I learned:**
The Anthropic SDK is Node.js-only — it uses `node:http` internally. Edge runtime won't work. I'd assumed all Next.js API routes run in the same environment; they don't. You have to declare the runtime explicitly if you're not using the default.

Also: Claude's output for audit summaries is surprisingly consistent even with a minimal prompt. I was expecting to need few-shot examples but a clear system prompt with the result data embedded was enough.

**Blockers / what I'm stuck on:**
The fallback text renders fine but it looks identical to the real summary — there's no way for the user to know the API failed. I should add a subtle "generated by AI" vs "estimated summary" label, but I'm not sure where to put it without cluttering the UI. Leaving it for the polish day.

**Plan for tomorrow:**
Supabase schema, saving audit results, generating public share URLs, lead capture form, and Resend confirmation email.

---

## Day 6 — 2026-05-06

**Hours worked:** 4.5

**What I did:**
Created the Supabase project and wrote the schema. Two tables: `audits` (stores the full result JSON, a `public_id` UUID for the share URL, and a `created_at` timestamp — no PII) and `leads` (stores email, name, estimated monthly savings, and a foreign key to `audits`). Ran the SQL in the Supabase dashboard and added Row Level Security policies: `audits` rows are readable by anyone with the `public_id`, `leads` rows are service-role-only.

Wrote `src/lib/supabase/server.ts` using the `@supabase/ssr` package with the service role key for writes, and `src/lib/supabase/client.ts` for the public anon key on reads. Wired up `src/utils/supabase/` as re-exports following the pattern from the Supabase Next.js docs.

The share page lives at `src/app/audit/[publicId]/page.tsx`. It reads the audit row from Supabase and renders a read-only summary. Added `generateMetadata` so the OG title shows the savings number.

Built the lead capture form — email + name fields, renders after the results if estimated monthly savings > 0. On submit it inserts a `leads` row and calls `src/lib/resend.ts` to send a confirmation email via `POST /api/leads`. The Resend email is simple text — no HTML template yet.

**What I learned:**
Supabase's `@supabase/ssr` package is different from the old `@supabase/auth-helpers-nextjs` — the docs on Google are mostly for the old package and the new one has a different API. Wasted 30 minutes following an outdated tutorial before finding the correct one in the Supabase GitHub readme.

RLS policies are surprisingly easy to get wrong. My first policy made `audits` readable only to authenticated users, which broke the public share page entirely. Fixed by using `(true)` as the SELECT policy for `audits` and restricting by `public_id` at the query level in the page component instead.

**Blockers / what I'm stuck on:**
The Resend `from` address requires a verified domain. I don't own `credex.rocks` so I used the Resend sandbox sender (`onboarding@resend.dev`) which only delivers to my own email. The email works, but in production someone would need to verify the actual domain. Added a comment in `src/lib/resend.ts` and a note in `README.md`.

**Plan for tomorrow:**
Accessibility fixes, final polish pass, get CI green, write markdown files, and deploy to Vercel.

---

## Day 7 — 2026-05-07

**Hours worked:** 3.5

**What I did:**
Started with `npm run build` to see what was actually broken. Two errors:

1. `src/app/audit/page.tsx` — used `Math.random()` to generate a draft ID on initial render, which caused a hydration mismatch because the server and client produced different values. Fixed by moving the ID generation into `useEffect` and initialising state to `null`.

2. `src/app/audit/[publicId]/page.tsx` — `params` wasn't being awaited, which is required in Next.js 14 dynamic routes when using async page components. Fixed by changing the function signature to `async function Page({ params }: { params: Promise<{ publicId: string }> })` and awaiting `params`.

After that `npm run build` was clean. Ran `npm run lint` — one ESLint warning about a missing `alt` attribute on an SVG I'd used as a decorative icon. Fixed with `aria-hidden="true"`.

Ran the Vitest suite — 6/6 passing. Set up the GitHub Actions CI workflow in `.github/workflows/ci.yml`: installs deps, runs lint, runs tests, runs `next build`. Pushed and watched it go green.

Deployed to Vercel. Set all the environment variables in the Vercel dashboard. Tested the full flow on the live URL: entered 3 tools, got results, checked the share URL, submitted the lead form, confirmed the email landed in my inbox.

Wrote `README.md`, cleaned up `ARCHITECTURE.md`, wrote `AGENTS.md`, and updated `PRICING_DATA.md` with the final verification date.

**What I learned:**
`params` being a `Promise` in Next.js 14 App Router is something a lot of tutorials skip over because it was added mid-v14. If you write `params.publicId` without awaiting, TypeScript doesn't always catch it — it just gives you `undefined` at runtime and you spend time wondering why your Supabase query returns nothing.

Also: Vercel's build logs are much more useful than local build output for debugging environment variable issues. One of my vars had a trailing space when I pasted it — the local build worked fine because `.env.local` stripped it, but Vercel didn't, and the Supabase client silently failed on every request.

**Blockers / what I'm stuck on:**
The Resend domain verification issue from Day 6 is still unresolved — can't fix it without access to the `credex.rocks` DNS. Everything else is working end-to-end. If this were a real production deploy I'd flag this to whoever owns the domain before launch.

**Plan for tomorrow:**
Submit the assignment. If there's feedback, iterate. If not, this is done.
