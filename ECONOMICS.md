# Economics

## What a Converted Lead Is Worth to Credex

Credex sells discounted AI credits — the primary SKU is a credits bundle that companies buy instead of paying full retail to OpenAI, Anthropic, or other providers. Based on publicly available information about AI credits resellers, a reasonable mid-market deal looks like this:

- **Average annual contract value (ACV):** $18,000 (a 12-person engineering team spending ~$1,500/month on API credits, switching to Credex at a 20–30% discount vs retail)
- **Gross margin on credits resale:** ~25% (resellers typically earn 20–30% margin on credits bundles)
- **Gross profit per customer:** $18,000 × 25% = **$4,500/year**
- **Assumed customer lifetime:** 2 years (credits are sticky — switching requires re-integrating API keys and re-negotiating)
- **LTV per customer:** $4,500 × 2 = **$9,000**

This means the business can afford to spend up to ~$3,000 in CAC and still return a 3:1 LTV:CAC ratio, which is healthy for a B2B SaaS motion.

## CAC by Channel

| Channel | Est. leads/month | Close rate | Customers/month | CAC |
|---|---|---|---|---|
| Organic (Reddit, HN, Slack) | 30 | 5% | 1.5 | ~$0 cash, ~$500 time-equivalent |
| AI Spend Auditor tool (this project) | 40 | 8% | 3.2 | ~$150 (hosting + ops) |
| LinkedIn outbound (20 DMs/week) | 8 | 15% | 1.2 | ~$400 (time) |
| Paid ads (future, month 4+) | 50 | 3% | 1.5 | ~$1,200 |

The audit tool has the best blended CAC because the lead is already educated — they've seen their own savings number before Credex ever contacts them. A lead who ran an audit and saw "$1,800/month in potential savings" is pre-qualified in a way that no ad-generated lead is.

## Conversion Funnel

```
Landing page visitor
        │
        │  30–35%
        ▼
Audit started
        │
        │  50%
        ▼
Audit completed (results seen)
        │
        │  30–35%
        ▼
Email captured
        │
        │  25%
        ▼
Consultation booked
        │
        │  40%
        ▼
Credits purchase (Credex customer)
```

**Working through 1,000 visitors:**

| Stage | Count | Rate |
|---|---|---|
| Visitors | 1,000 | — |
| Audits started | 325 | 32.5% |
| Audits completed | 163 | 50% of started |
| Emails captured | 49 | 30% of completed |
| Consultations booked | 12 | 25% of captured |
| Credits purchased | 5 | 40% of consultations |

**Revenue per 1,000 visitors:** 5 customers × $18,000 ACV = **$90,000 in pipeline**. At 25% margin that's $22,500 GP from 1,000 visitors. The tool justifies its existence at even 500 monthly visitors.

**The email-capture-to-consultation rate (25%) is the most uncertain number.** If Credex's follow-up email sequence is weak, this drops to 10%, cutting new customers roughly in half. The email nurture sequence is a higher-leverage investment than any feature on the audit tool itself.

## Path to $1M ARR in 18 Months

$1M ARR means $83,333/month in recurring revenue.

At $18,000 ACV per customer: **56 customers needed** (or 4–5 new customers per month sustained for 14–15 months, accounting for churn at 10% annually).

**Working backwards month by month:**

| Month | Cumulative customers | New this month | Monthly visitors needed |
|---|---|---|---|
| 1–2 | 6 | 3/mo | 600 |
| 3–4 | 16 | 5/mo | 1,000 |
| 5–8 | 36 | 5/mo | 1,000 |
| 9–12 | 56 | 5/mo | 1,000 |
| 13–18 | 56+ (renewal + expansion) | 2–3 net new | 600–800 |

**What needs to be true:**

1. **1,000 monthly visitors by month 3.** Achievable if the HN launch gets 200–400 visits in week 1 and SEO begins compounding from the comparison landing pages (month 2–3).

2. **Email capture rate stays above 25%.** This is the most sensitive lever. If it drops below 15% the funnel math breaks — not enough leads to close 5 customers/month. The $500/month savings threshold for the Credex CTA needs to be calibrated so it triggers on a meaningful number of audits.

3. **Credex closes at 40% of consultations booked.** This is a sales execution assumption. If close rate is 25%, the visitor target needs to scale to 1,600/month to compensate — much harder to achieve organically.

4. **Average deal size holds at $18k.** If the audit tool attracts smaller teams (4–8 people) the ACV could drop to $8,000–$10,000, requiring 100+ customers for $1M ARR. The GTM targeting of 8–25 engineer teams is specifically designed to hold deal size.

**The $1M ARR scenario is plausible but not conservative.** The realistic base case is $400k–$600k ARR in 18 months if the tool generates 600 monthly visitors and conversion rates land in the middle of the ranges above. $1M requires either paid distribution turning on by month 4 or a partnership (accelerator batch, dev tool newsletter) that spikes traffic materially.
