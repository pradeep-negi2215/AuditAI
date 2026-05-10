# Go-To-Market Plan

## Target User (Primary)

**Engineering Manager at a Series A SaaS company with 8–25 engineers.**

More specifically: they were promoted from senior engineer 12–18 months ago, now own a tools budget they didn't ask for, and are currently getting dinged by their CFO about rising infrastructure costs. They have a personal Cursor Pro subscription, put 6 people on GitHub Copilot Enterprise without fully understanding what they got, and vaguely know there is overlap between their Anthropic API usage and ChatGPT Team seats — but haven't had time to figure out what to do about it. They are not cost-obsessed; they are embarrassed. A clean report that lets them say "I looked into this" in the next budget review is the product they actually want.

**Secondary user:** Technical co-founder (solo or co-founding pair) at a seed-stage company with 4–12 people, burning $3k–$8k/month on SaaS and trying to find anything to cut without slowing the team down.

## What They Google Before They Want This

These are the real searches. Not "AI cost management software." The searches happen *before* they've conceptualized a solution:

- `"github copilot enterprise worth it" small team`
- `cursor vs copilot 2025 cost`
- `how much does chatgpt team cost per user`
- `reduce ai subscription costs startup`
- `claude pro vs api which is cheaper for team`
- `ai tools budget engineering team`
- `openai api vs chatgpt plus which is cheaper`

SEO play: write one landing page per head-to-head comparison. "Cursor vs Copilot — which is cheaper for a 12-person team?" with a CTA to run the full audit.

## Where They Hang Out

**Reddit:**
- `r/ExperiencedDevs` — EMs and senior engineers debating tools. High signal, high skepticism. Works if the post is honest and shows real numbers.
- `r/SaaS` — founders comparing costs. Lower technical bar, higher cost-sensitivity. Works for the secondary user.
- `r/startups` — less technical, but good for founder persona. Cross-post savings story posts here.
- `r/devops` — catches teams reviewing cloud + SaaS spend together.

**Slack groups:**
- **Rands Leadership Slack** (`randsinrepose.com`) — the single best place for EMs. Channel `#tools` is active. Post a "what's your team actually paying for AI tools" conversation starter before mentioning the audit.
- **Lenny's Slack** — product-heavy but founders and operators read it. Channel `#growth` surfaces cost tools well.
- **SaaStr community Slack** — GTM and ops-focused operators. Less technical but higher company size.
- **Cerebral Valley Discord** — AI-native startup founders. This crowd runs high API spend and is price-aware.

**X (Twitter):**
- Follow and engage with the `#buildinpublic` crowd — they share costs openly and love free tools.
- Target followers of @swyx, @levelsio, @patio11 — overlap with technical founders who think about SaaS economics.
- Engage in threads about AI pricing changes (whenever OpenAI or Anthropic announces a price move, there's a 48-hour window of high-intent discussion).

**Newsletters to pitch for inclusion:**
- Pragmatic Engineer (Gergely Orosz) — paid but has a free tier, targets EMs exactly.
- TLDR Tech — short format, free tool with a real result angle fits perfectly.
- Pointer.io — curated for engineering leaders.

## How to Get the First 100 Users in 30 Days ($0 Budget)

**Week 1 — Reddit seeding:**
Post in `r/SaaS` with title: *"Built a free tool that found $340/mo in AI overspend in my team — sharing it here."* The post body shows a real audit result (your own team or a friend's), explains the methodology, and links the tool at the end. Do not lead with the link. Lead with the finding.

Separately, post a "Show HN" on Hacker News: *"Show HN: AI Spend Auditor – finds overspend across ChatGPT, Copilot, Cursor, Claude (free)"*. The HN crowd will probe the pricing data — make sure the Supabase query is fast and the results are defensible.

**Week 2 — Slack seeding:**
Join Rands Leadership Slack. Spend three days participating in `#tools` before posting anything. Then open a thread: *"Curious what EMs here are actually spending per engineer per month on AI tools — we ran an audit across 8 tools, happy to share the template."* Respond to every reply. On day 4, share the tool link with the framing "made this to answer exactly this question."

**Week 3 — DM outreach:**
Find 20 EMs on LinkedIn who have posted about AI tools in the last 90 days. Send a message that is 3 sentences: what you noticed about their post, what the tool does in one sentence, and a direct link. No ask beyond "would be curious what your audit comes back with." Goal is 5–8 completed audits from this cohort and at least one person who shares it.

**Week 4 — Amplification:**
Ask the 3–5 highest-savings audit users to share their result on X or LinkedIn with the share link. People share these because the number is surprising — "$1,200/month saved" is inherently shareable. Offer to write the tweet for them if needed.

**Target at end of 30 days:** 200+ audits started, 40+ emails captured, 3–5 consultation requests.

## The Unfair Distribution Channel

Credex has existing relationships with companies that are spending on AI — that's the customer base they're already selling credits to. The audit tool is a natural re-engagement touchpoint for the existing Credex pipeline.

Specifically: any company that has already spoken to Credex but didn't convert (common in a credits-selling motion — buyers need to justify spend before switching) gets sent the audit tool as a follow-up. The email subject line is: *"We built something that might help answer your question about current AI spend."* This is a re-warm that doesn't feel like a re-warm.

No other AI credits vendor has a free public audit tool to send this cohort. That is the unfair advantage — Credex can funnel an existing warm pipeline through an educational asset they built themselves.

## Week-1 Traction Targets

| Metric | Target |
|---|---|
| Landing page unique visitors | 400–600 |
| Audits started | 120 |
| Audits completed | 60 (50% completion) |
| Emails captured | 18–22 (30–35% of completions) |
| Share links generated | 15 |
| Share link views (by others) | 40 |
| Credex CTA clicks (`/credex` or booking link) | 6–8 |
| Consultation requests | 2–3 |

If share link views per audit are below 1.5x by end of week 1, the results page is not generating enough surprise. The savings number needs to be larger or more specific. That's the design signal — not a copy problem, a results-calibration problem.
