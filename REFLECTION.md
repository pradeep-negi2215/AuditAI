# Reflection — AI Spend Auditor

---

## Q1: The hardest bug I hit this week

The most stubborn debugging session happened when I tried to read the `report` column back out of Supabase and pass it to the audit results page. The column is stored as `jsonb`, which is the right choice — it avoids serializing and deserializing a VARCHAR — but when the Supabase JS client returns a `jsonb` column it types it as `unknown`, not as my `AuditReport` type.

The exact error that sent me down the wrong path first was not a runtime crash — it was a TypeScript error deep inside the results page:

```
Property 'totalsByCurrency' does not exist on type 'unknown'.
```

My first hypothesis was that I had mislabeled the column in the Supabase dashboard. I checked. The column was named `report` in both the schema and my query. My second hypothesis was that the `select()` call was wrong and I needed to explicitly name the column in the query string — tried `.select('report')` explicitly instead of `'*'`. Same error.

What I tried that didn't work: I cast it with `as AuditReport` directly at the query call site. TypeScript *accepted* this but ESLint flagged it as an unsafe cast from `unknown`, which was correct — a bad cast doesn't actually validate the shape at runtime. If the column had stale data in a different shape I'd get a silent runtime failure.

What finally worked: I wrote a type guard in `src/lib/audit/types.ts`:

```ts
export function isAuditReport(value: unknown): value is AuditReport {
  return (
    typeof value === "object" &&
    value !== null &&
    "results" in value &&
    "totalsByCurrency" in value &&
    Array.isArray((value as AuditReport).results)
  );
}
```

Then in the page component I read the raw `unknown` value, ran it through `isAuditReport()`, and either rendered the report or showed an error state. This is the correct pattern — TypeScript narrows `unknown` through the guard and from that point on the type is fully resolved with no cast required. I also added a Vitest test for the guard specifically with a malformed object to make sure it rejected bad data rather than falsely passing.

The real lesson wasn't the fix itself — it was that TypeScript's `unknown` is doing exactly what it should. Supabase doesn't know what's inside a `jsonb` column at compile time and neither should my code without verification.

---

## Q2: A decision I reversed mid-week

On Day 4 I started building the audit form as a single long page — all tool rows visible at once, a table-like layout where you could see every tool simultaneously. My logic was that power users would want to see everything in one shot and jump around freely. I got about three hours into it before I tested it with real inputs and immediately saw the problem.

With even four tools in the list, the form became visually overwhelming. Each tool row had four interactive fields (tool name, current plan, seat count, use case) and the rows started running into each other. Worse, the "submit audit" button was below the fold and there was no clear sense of progression — it just felt like a dense data entry screen, not a product.

I scrapped the whole layout and rebuilt it as a multi-step form with four discrete steps: team basics, tool entry, review, results. The key change architecturally was introducing a `step` index in state and rendering only the active step's content. This also made the localStorage persistence simpler — instead of syncing a complex nested object I could serialize and restore the entire `draftState` as a single JSON blob under `auditai_draft`.

The UX got significantly better. The tool entry step still allows multiple tool rows (you add them one at a time), but the surrounding interface is calm because it's the only thing on screen. The review step lets you scan the full list before submitting, which gives users the "see everything" moment at the right time — after they've entered everything, not during.

What I'd do differently: I should have wireframed this on paper before writing any code. I did roughly sketch the data flow, but not the actual interaction states. Thirty minutes of paper sketching on Day 3 would have saved three hours of thrown-away code on Day 4.

---

## Q3: What I would build in week 2

**PDF export of the audit report.** Right now the results exist as a screen and a shareable URL. A CFO or finance lead is going to want to drop this into a Notion page or attach it to a Slack message as a file. I'd use `@react-pdf/renderer` to render the `AuditReport` type into a structured PDF — savings headline, per-tool table, recommendation rationale, and source URLs. The hard part is keeping the PDF styling consistent with the web design; that alone would take most of a day.

**Rate limiting on the audit submission endpoint.** Currently anyone can call `POST /api/audit/summarise` as many times as they want. At $3/million input tokens the Anthropic cost is low but not zero, and a simple abuse loop could run up a meaningful bill. I'd add Upstash Redis with the `@upstash/ratelimit` package — limit to 10 audits per IP per hour. Implementing this in a Next.js route handler with the `next-rate-limit` middleware pattern is straightforward, but needs to be done carefully so it doesn't block legitimate users who retry after a network failure.

**Benchmark mode — compare to industry averages.** The most useful thing this tool could do beyond a point-in-time audit is tell teams: *other startups at your stage spend X per engineer on AI tools*. I'd build a simple aggregated benchmark derived from submitted audits (anonymized, opt-in) — average spend per seat by company size bucket (1–10, 11–50, 51–200). This turns the tool from a one-time calculator into something teams revisit quarterly.

**Email digest for saved audits.** Right now the email sent via Resend is a one-shot confirmation. In week 2 I'd add a Supabase scheduled function (or a Vercel cron job) that runs monthly, re-runs the audit with updated pricing data, and emails the lead if their potential savings have changed. This gives the tool a retention loop and a reason to re-engage.

---

## Q4: How I used AI tools

I used Claude (via claude.ai) and GitHub Copilot throughout the week, but for very different things.

**What I used Claude for:** First-draft boilerplate I knew I'd rewrite anyway — the initial `resend.ts` stub, the Supabase RLS policy SQL, and the CI workflow YAML. It's faster to edit something than to write it from scratch when the structure is standard. I also used it to rubber-duck the type guard question in Q1 — describing the problem out loud (or in a prompt) helped me realize my own cast was wrong before Claude even responded.

**What I used Copilot for:** Autocomplete while writing the audit engine tests — specifically filling in assertion values once I'd written the test structure. It's good at pattern-matching across test files.

**What I didn't trust either of them with:** All the actual pricing numbers in `src/lib/audit/pricing-data.ts`. I went to every vendor's pricing page myself and typed the numbers in manually. This turned out to be the right call.

**The specific time AI was wrong and I caught it:** I asked Claude to help me draft a pricing data stub to get unblocked quickly while I verified the real numbers. It generated a `cursor` tool entry with an `"enterprise"` plan at `$25/seat/month`. That plan does not exist — Cursor's current tiers are Pro ($20), Pro+ ($60), Ultra ($200), and Teams ($40/user). There is no Enterprise tier at $25. If I had used that stub unchecked and hadn't verified against the real pricing page, the audit engine would have been giving users wrong downgrade recommendations from day one. The whole point of the tool is that the numbers are correct, so having AI hallucinate them would have been a silent, serious flaw.

The rule I settled on: use AI for code structure and syntax, never for domain-specific data that has to be accurate.

---

## Q5: Self-rating 1–10

**Discipline — 6/10**
I stuck to the plan on most days but Day 4 was a real burn — three hours of code I threw away. Some of that was unavoidable exploration, but if I had wireframed before coding I'd have avoided the wasted afternoon. Also skipped the PDF export entirely, which I knew was a useful feature but kept deprioritizing.

**Code quality — 7/10**
The audit engine is well-tested and the types are clean — I'm happy with `types.ts` and the type guard pattern. But `src/app/audit/page.tsx` is 39KB, which is embarrassing. The multi-step form logic, the tool row state, and the results rendering are all in one file when they should be split into focused sub-components. I ran out of time to refactor it before the deadline.

**Design sense — 5/10**
The UI is functional and the shadcn/ui components are being used correctly. But it doesn't have a strong visual identity — it looks like a competent Next.js app, not a product someone would screenshot and share. I didn't spend enough time on the hero section, spacing, and the results page data visualization. The numbers are there but they don't *land* the way they should.

**Problem-solving — 8/10**
The type guard solution for the Supabase `unknown` column was the right call, not the easy one. I also correctly identified early that the Anthropic API should only generate the summary paragraph rather than drive the audit logic — keeping the engine deterministic was a defensible architecture decision. When things broke I had a methodical approach: form a hypothesis, change one thing, test.

**Entrepreneurial thinking — 7/10**
I added the `$500/month savings threshold` logic for the Credex consultation CTA, which is directly tied to a real business outcome rather than just a product feature. And I kept PII out of the public share rows without being asked — that's the kind of decision that matters when you're thinking about what happens after launch, not just whether the demo works.
