# AI Check

**We don't tell you what AI can do. We tell you where it pays off for you. And where it doesn't.**

Live: https://ai-check-nine.vercel.app · On stage: https://ai-check-nine.vercel.app/start?example=becker&demo=1

Built at the Foundry 8.8.8 Start-a-thon (THWS Schweinfurt), problem 02: *"AI or not? AI for the small company."*

## The problem

Small craft businesses (painters, electricians, bakeries) hear about AI everywhere but have no way to tell which of it pays off for *them*. They can't judge vendors, fear a wrong investment, worry about data protection, and have no time to learn prompting. Vendors only ever say "yes".

## Persona

**Thomas Becker, 52**, third-generation painting & building-services business in Lower Franconia. 14 people. On sites 7:30–15:00, where the phone rings and he can't pick up. Writes quotes at the kitchen table 20:00–22:00. Paid €80/month for an app nobody used. Tried ChatGPT once, didn't know what to ask.

> "Tell me where AI saves me my evenings. Then I'll listen."

## The solution

A 10-minute, vendor-neutral Quick Check:

1. **Describe your business** (`/start`): trade, size, website (optional, scraped), Bavaria, what eats your week, tools, budget, biggest worry.
2. **Short consultant chat** (`/consult`): 4–5 questions with tap-to-answer chips ("How many calls do you miss a day?").
3. **Results** (`/results`): AI Check Score (0–100), hours and € per month, **top 3** (cheapest working option first) with cost after Digitalbonus Bayern funding, payback, effort/risk, GDPR note, people readiness and multi-vendor options. **❌ Not worth it** cards with honest reasons. **First pilot** with a 2-week plan and one success metric. Budget slider and every assumption are editable and recalculate live.
4. **Demo assistant** (`/demo`): a chat widget "on their website" that answers only from the scraped site text and takes a callback request when it doesn't know.
5. **1-page pilot report** (`/report`): print-ready, made to show the tax advisor.
6. **Smart Investment Selector** (`/invest`): buy vs. rent vs. lease vs. subscribe (RaaS) for robots and large purchases, with a 60-month cumulative cost chart against doing it by hand. Says "keep doing it by hand" when nothing pays off.

### What makes it different

- **Honest verdicts**, including "not worth it" (painting robot for 14 people, custom AI scheduler, chatbot for a site with 20 visitors).
- **Reproducible**: the LLM only picks and personalises use cases from a curated library and estimates hours; all maths runs in TypeScript (`lib/scoring.ts`).
- **Cost first**: funding-adjusted cost and payback on every card.
- **Never breaks on stage**: no key, failed call or invalid JSON leads to a rule-based fallback (`lib/fallback.ts`); `?demo=1` uses cached data only.

## Business model

| Offer | Price |
|---|---|
| Free Quick Check | €0 (lead magnet: top 3, PDF, demo assistant) |
| Pilot Report | €490 one-off (1h call, pilot plan, vendor shortlist, funding application help) |
| Starter Build | from €499 setup + €49/month (industry templates, e.g. callback assistant) |
| AI Coach | €99–199/month (support, quarterly re-check, ROI tracking) |
| Pay from savings | 30% of measured savings for 6 months, proven use cases only |

Implementation through vetted partners; we earn a commission and disclose it. Distribution through people owners already trust: tax advisors, banks, chamber of crafts, guilds (planned partners).

**Moat:** more customers → more verified outcome data (ROI, failures, costs, reliability) → smarter matching → better recommendations → more customers.

## Key assumptions (all labelled as estimates in the UI)

- € impact/month = hours saved × hourly rate (default €45, editable) + 50% of non-time value (missed jobs, unbilled work, less waste).
- Payback = one-time cost after funding ÷ (€/month − monthly cost).
- Score per use case = 45% impact (net €/month, saturating at €2,000) + 35% payback speed (0 at 18 months) + 20% ease (effort + risk). AI Check Score = 50/30/20 weighted top 3.
- Digitalbonus Bayern (Standard): Bavaria + ≤249 employees, 30% default (30–50% configurable), max €10,000, one-time costs only. *Estimate. Check eligibility at digitalbonus.bayern. Monthly quotas can run out.*
- Cost ranges and vendors in `data/useCases.json` and `lib/investAssumptions.ts` are rounded 2025/26 market estimates. Vendors are examples, not endorsements.
- Demo businesses (Becker Bauservice, Bäckerei Hollerbach) are fictional.

## How to run

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local   # optional; without it the rule-based fallback runs
npm run dev
```

Open http://localhost:3000. Examples: `/start?example=becker`, `/start?example=bakery`. Stage mode (cached only): add `?demo=1`.

## Stack

Next.js (App Router) + TypeScript + Tailwind · Claude API (`claude-opus-5-5`, structured JSON output validated with zod, all calls in `lib/llm.ts`) · cheerio website scrape (home + up to 5 internal pages, 12k chars, SSRF-guarded) · Motion for layout transitions · print stylesheet for the PDF · no database, state in the browser.

```
app/            pages + API routes (profile, consult, pick, demo-chat)
lib/scoring.ts  ROI, payback, score, ranking (deterministic)
lib/funding.ts  Digitalbonus Bayern
lib/fallback.ts rule-based questions, estimates and picks
lib/llm.ts      the 4 LLM calls
data/           use case library + cached demo businesses
```
