# Metrics

## North Star Metric

**Qualified leads generated per week** — defined as: a unique email address captured from a user whose audit identified ≥ $500/month in potential savings.

**Why this and not audit completions or DAU:**

Audit completions measure activity, not value delivered to Credex. A tool that generates 500 completions/week from solo freelancers with no AI spend is worthless to the business. DAU is irrelevant — this is a tool people use once a quarter, not daily. What matters is whether the tool is routing high-value, in-market prospects into the Credex pipeline.

The $500/month savings threshold is the right qualifier because: (a) it's the threshold at which a conversation about switching to discounted credits becomes rational for the buyer, and (b) it correlates with team sizes and spend levels that produce ACVs above $12,000 — Credex's profitable deal size.

A team generating 10 qualified leads/week is on track. A team generating 3 is not, regardless of how many total audits ran.

## 3 Input Metrics That Drive the North Star

**1. Audit completion rate** (target: ≥ 50% of audits started)
The step most likely to kill the funnel is the form itself. If users start the audit and abandon mid-step, the results and email capture never happen. Completion rate signals whether the form is too long, too confusing, or asking for information people don't have on hand. Track abandonment by step, not just overall.

**2. Savings surfaced ≥ $500/month rate** (target: ≥ 40% of completed audits)
If only 15% of completed audits surface ≥ $500/month in savings, either the pricing data is wrong, the tool is reaching the wrong users (teams already on optimal plans), or the audit engine rules are too conservative. This metric connects tool accuracy to business value.

**3. Email capture rate among qualifying audits** (target: ≥ 35% of audits that surfaced ≥ $500/month)
Users who saw a large savings number but didn't share their email represent the biggest leak in the funnel. This rate tells you whether the post-results CTA is compelling enough. If the number is below 25%, the issue is almost certainly the email capture copy, not the audit quality.

## Instrumentation — Events to Fire First

Instrument these in order of priority. Do not track everything — track only what drives a decision.

| Event | When it fires | Properties |
|---|---|---|
| `audit_started` | User hits Step 1 of the form | `{ source, referrer }` |
| `audit_step_abandoned` | User exits mid-form | `{ step_index, tools_entered }` |
| `audit_completed` | Results page renders | `{ tools_count, total_savings_usd, qualifies_threshold }` |
| `email_captured` | Lead form submitted | `{ savings_usd, tool_count, country }` |
| `share_link_clicked` | User clicks "copy share link" | `{ savings_usd }` |
| `share_link_viewed` | Public share page loads from external referrer | `{ referrer, savings_usd }` |
| `credex_cta_clicked` | User clicks Credex consultation CTA | `{ savings_usd, source: 'results' \| 'share' \| 'email' }` |

Do not track page views at launch — they create noise without driving decisions. Add them in month 2 when there is enough volume to segment meaningfully.

## Pivot Triggers

These are the specific numbers that force a strategy change. Not "review if metrics are bad" — explicit thresholds that force a decision:

**Trigger 1: Audit completion rate < 35% after 200 audits started**
Action: Shorten the form to 2 steps. Remove the "use case" field and infer it from the tool selection. Run the shorter form as the only version for 2 weeks and compare.

**Trigger 2: Email capture rate < 15% after 500 completed audits**
Action: The results page value prop is not landing. Redesign the email capture framing — try "email me this report as PDF" instead of "get savings tips." The user wants to keep the output, not receive more content.

**Trigger 3: Savings ≥ $500/month rate < 20% after 300 audits**
Action: The tool is reaching the wrong users OR the audit engine is underestimating savings. Audit 10 completed sessions manually. If users are already on optimal plans, tighten the GTM targeting. If the engine is missing real savings, fix the pricing rules first.

**Trigger 4: Credex CTA click rate < 5% among qualifying audits**
Action: The gap between "I see my savings" and "I should talk to Credex" is too wide. Add one sentence of specific explanation — not "talk to an expert" but "Credex can match or beat your current AI pricing — average 23% discount on API spend."

**Lagging signal to watch monthly:** median days between `email_captured` and `credex_cta_clicked`. If this is > 14 days, the email nurture sequence is too slow or too generic to move buyers. That is a Credex ops problem, not a tool problem — but it shows up here first.
