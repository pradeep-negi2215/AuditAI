# Tests

## Test suite

**File:** `src/lib/audit/__tests__/audit-engine.test.ts`
**Runner:** Vitest (configured in `vitest.config.ts`, `environment: "node"`)
**How to run:** `npm test`
**How to run in watch mode:** `npx vitest --watch`

All 7 tests live in a single `describe("runAudit", ...)` block and call `runAudit()` from `src/lib/audit/engine.ts` directly. No mocks — the tests import live pricing data from `pricing-data.ts` and assert against real plan names, real prices, and real flags.

---

### Test 1 — Team plan overkill detection

**Test name:** `"Team 1: Team plan overkill - recommends cheaper individual plan"`

**What it covers:**
A team of 2 engineers paying for GitHub Copilot Business ($19/seat × 2 = $38/month) when GitHub Copilot Pro ($10/seat × 2 = $20/month) covers everything they need. The engine should detect that the Business plan's `minSeats` threshold makes it unnecessary for this team size, recommend the Pro plan by name, calculate savings of exactly $18/month, and attach the `"team-plan-overkill"` flag to the result.

**Key assertions:**
```ts
expect(audit.recommended?.planName).toBe("Pro");
expect(audit.savingsMonthly).toBe(18);
expect(audit.flags).toContain("team-plan-overkill");
```

---

### Test 2 — Already-optimal detection (zero savings)

**Test name:** `"Test 2: Already optimal - no optimization available"`

**What it covers:**
A team using the Anthropic API on the `haiku-4-5` plan — the cheapest available Anthropic API tier. Since API plans have no free tier eligible for substitution and there is no cheaper subscription, the engine should return `recommended: null`, `savingsMonthly: 0`, and the `"already-optimal"` flag. This test guards against the engine falsely generating a recommendation when no cheaper path exists.

**Key assertions:**
```ts
expect(audit.recommended).toBeNull();
expect(audit.savingsMonthly).toBe(0);
expect(audit.flags).toContain("already-optimal");
```

---

### Test 3 — Free plan eligibility detection

**Test name:** `"Test 3: Free plan eligible - no spend provided, so free tier recommended"`

**What it covers:**
A solo user on Windsurf Pro ($15/month) where no explicit `monthlySpend` is provided. When `monthlySpend` is omitted, the engine calculates cost from the plan's `pricePerSeatMonthly` and then checks free-tier eligibility. Windsurf has a free tier (`"Free (25 credits)"`) that is valid for 1 seat. The engine should recommend switching to the free plan, calculate $15/month in savings, and attach the `"free-plan-eligible"` flag.

**Key assertions:**
```ts
expect(audit.recommended?.planName).toBe("Free (25 credits)");
expect(audit.savingsMonthly).toBe(15);
expect(audit.flags).toContain("free-plan-eligible");
```

**Note:** The engine's free-tier logic is intentionally disabled when `monthlySpend` is explicitly provided and non-zero. This test specifically exercises the implicit-spend path.

---

### Test 4 — Cheaper same-vendor plan detection

**Test name:** `"Test 4: Cheaper plan for explicit spend - recommend lower-cost paid alternative"`

**What it covers:**
A solo developer on Cursor Pro+ ($60/month, explicit spend provided) where Cursor Pro ($20/month) would suffice. Because `monthlySpend` is explicitly set, the engine skips the free-tier check and goes directly to Rule 3: cheaper same-vendor subscription comparison. It should recommend the `"Pro"` plan and calculate $40/month in savings.

**Key assertions:**
```ts
expect(audit.recommended?.planName).toBe("Pro");
expect(audit.savingsMonthly).toBe(40);
```

---

### Test 5 — Alternative tool recommendation

**Test name:** `"Test 5: Alternative tool - writing user gets cheaper writing alternative"`

**What it covers:**
A solo user on Claude Max-5x ($100/month) with `useCase: "writing"`. The engine's Rule 4 checks alternative tools for the same use case. For `"writing"`, alternatives include Claude, ChatGPT, and Gemini. Since the user is already on Claude, the engine skips it and evaluates the cheapest plans for the other two. Either ChatGPT Plus ($20/month) or Gemini's cheapest plan should be surfaced as an alternative, producing savings > $0.

**Key assertions:**
```ts
expect(audit.recommended).not.toBeNull();
expect(audit.savingsMonthly).toBeGreaterThan(0);
```

**Note:** This test uses `toBeGreaterThan(0)` rather than a specific dollar amount because the cheapest alternative depends on pricing-data contents and could legitimately shift if pricing is updated.

---

### Test 6 — Total savings summation across multiple tools

**Test name:** `"Test 6: Total savings calculation - multiple tools with correct currency totals"`

**What it covers:**
A 3-tool audit (Cursor Pro+, Claude Pro, ChatGPT Plus — all USD, all 1 seat) that validates the `runAudit()` aggregation layer rather than individual tool rules. The test asserts that `totalsByCurrency` contains a USD entry and that `savingsAnnual` is exactly `savingsMonthly × 12` — catching any rounding or aggregation bug in `engine.ts`'s `roundMoney()` accumulation loop.

**Key assertions:**
```ts
expect(result.results).toHaveLength(3);
expect(result.totalsByCurrency.length).toBeGreaterThan(0);
const usdTotal = result.totalsByCurrency.find((t) => t.currency === "USD");
expect(usdTotal).toBeDefined();
expect(usdTotal.savingsAnnual).toBe(usdTotal.savingsMonthly * 12);
```

---

### Test 7 — Mixed currency detection

**Test name:** `"Test 7: Mixed currency detection - USD and INR tools show hasMixedCurrency"`

**What it covers:**
A 2-tool audit where one tool is priced in USD (Cursor Pro, `country: "US"`) and one in INR (Gemini Plus, `country: "IN"`, ₹799/month). The engine should produce separate `totalsByCurrency` entries for `"USD"` and `"INR"` and set `hasMixedCurrency: true` on the `AuditReport`. This flag is used on the results page to render separate savings totals per currency rather than converting and summing across currencies, which would be misleading.

**Key assertions:**
```ts
expect(result.hasMixedCurrency).toBe(true);
expect(currencies).toContain("USD");
expect(currencies).toContain("INR");
```

---

## Linting

**How to run:** `npm run lint`

Runs ESLint via the Next.js ESLint config (`eslint.config.mjs`). Catches unused imports, missing `alt` attributes on images, and unsafe TypeScript patterns. CI fails on any lint error or warning that ESLint is configured to treat as an error.

---

## CI

**Workflow file:** `.github/workflows/ci.yml`
**Triggers:** push and pull request to `master`

**Steps in order:**
1. Checkout (`actions/checkout@v4`)
2. Setup Node 20 with npm cache (`actions/setup-node@v4`)
3. Install dependencies (`npm ci` — uses lockfile, not `npm install`)
4. Lint (`npm run lint`)
5. Test (`npm test`)

Note: `npm run build` is **not** part of CI. Running a full Next.js build requires all environment variables to be present (Supabase URL, Anthropic key, etc.), which are not available in the CI environment without secret configuration. Build correctness is validated locally before pushing, and TypeScript correctness is covered by `tsc --noEmit` which ESLint runs implicitly via `@typescript-eslint`.

**Running CI locally:**
Install [`act`](https://github.com/nektos/act) to run the GitHub Actions workflow locally without pushing:

```bash
# macOS
brew install act

# Run the full CI workflow
act push
```

`act` requires Docker. Without `act`, run the CI steps manually in order:

```bash
npm ci
npm run lint
npm test
```

---

## What is NOT covered

### UI / component tests

There are no tests for any React components — the multi-step form, the results page, the lead capture form, or the public share page. The primary reason is time: writing meaningful component tests requires either a DOM environment (jsdom) or a browser driver (Playwright), and the Vitest config is currently `environment: "node"` which does not simulate the DOM.

The secondary reason is that the UI is tightly coupled to the Supabase and Anthropic clients via route handlers. Meaningful integration tests would require either mocking those clients (which adds maintenance overhead) or running against real services (which requires secrets in CI). Neither was in scope for a 7-day build.

**What to add first if tests are extended:** A Playwright `e2e/` suite covering the happy path — filling the form, completing the audit, seeing the results page, and clicking the share link. This would catch the hydration mismatch bug and the `params` Promise issue from Day 7 before they reached production.

### API route integration tests

The route handlers in `src/app/api/audit/summarise/route.ts` and `src/app/api/leads/route.ts` are untested. Unit-testing them would require mocking `@supabase/supabase-js`, `@anthropic-ai/sdk`, and `resend` — three separate SDKs with non-trivial initialization. The risk surface is low for the summary route (it has an explicit fallback for every failure mode) and moderate for the leads route (a bug there means a lead is captured in Supabase but no email is sent, or vice versa). The leads route is the next candidate for a test.

### Pricing data correctness

`pricing-data.ts` is tested indirectly — every engine test that asserts a specific plan name or price implicitly verifies that the pricing data contains that plan at that price. There is no dedicated test that iterates over every entry in `pricing-data.ts` and validates its shape against the `PricingPlan` type. TypeScript's structural typing provides some of this guarantee at compile time, but a runtime schema validation test (e.g. using Zod against the full pricing data object) would catch data errors that TypeScript cannot, such as a `pricePerSeatMonthly` of `0` on a paid plan.
