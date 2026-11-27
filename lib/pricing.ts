// All prices and licence rules in one place. Change numbers here; every page reads from this file.
// Prices are net (plus VAT), per year, on an annual contract that renews yearly.

export type PlanId = "starter" | "professional" | "business";
export type AgentId = "invoice" | "email" | "quote" | "phone";

export interface Plan {
  id: PlanId;
  name: string;
  yearly: number; // € per year, net
  agents: number; // how many agents the customer picks (Business: all)
  agentsLabel: string;
  users: number | null; // null = unlimited
  usersLabel: string;
  support: string;
  setup: number; // € one-off, 0 = included
  highlight?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter", name: "Starter", yearly: 1490, agents: 1, agentsLabel: "1 agent of your choice",
    users: 5, usersLabel: "Up to 5 users", support: "Email support", setup: 990,
  },
  professional: {
    id: "professional", name: "Professional", yearly: 3490, agents: 3, agentsLabel: "3 agents",
    users: 15, usersLabel: "Up to 15 users", support: "Monthly check-in", setup: 990, highlight: "Most chosen",
  },
  business: {
    id: "business", name: "Business", yearly: 5990, agents: 4, agentsLabel: "All agents incl. phone agent",
    users: null, usersLabel: "Unlimited users", support: "Priority support + quarterly on-site review", setup: 0,
  },
};

export const PLAN_ORDER: PlanId[] = ["starter", "professional", "business"];

/** Monthly view of the same annual contract: yearly price ÷ 12, rounded. */
export const perMonth = (p: Plan) => Math.round(p.yearly / 12);

export const EXTRA_CONSULTING_DAY = 690;

export const AGENTS: Record<AgentId, { name: string; does: string; businessOnly?: boolean }> = {
  invoice: { name: "Invoice agent", does: "Writes invoices from site notes and chases late payments." },
  email: { name: "Email agent", does: "Sorts the inbox and drafts replies you check and send." },
  quote: { name: "Quote agent", does: "Turns site photos and voice notes into quote drafts." },
  phone: { name: "Phone agent", does: "Answers calls you can't take and sends you the request.", businessOnly: true },
};
export const AGENT_ORDER: AgentId[] = ["invoice", "email", "quote", "phone"];

/** Which agent does the work of each tool from the check. Tools not listed don't need a licence. */
export const AGENT_FOR_USE_CASE: Record<string, AgentId> = {
  "quote-photo-voice": "quote",
  "quote-text-blocks": "quote",
  "quote-followup": "quote",
  "email-drafts": "email",
  "site-report": "email",
  "invoice-reminders": "invoice",
  "extra-work-voice-log": "invoice",
  "receipt-capture": "invoice",
  "phone-ai-answer": "phone",
  "voicemail-transcribe": "phone",
  "bakery-order-intake": "phone",
};

/** An agent counts towards the licence when its estimated value is above this, in € per month. */
export const AGENT_VALUE_THRESHOLD = 200;

export interface LicenceRecommendation {
  plan: PlanId;
  agents: AgentId[];
  valuePerMonth: number;
  share: number | null; // licence per month ÷ value per month, in %
}

/**
 * Licence rules: 1 agent worth more than €200/month → Starter; 2–3 → Professional;
 * phone agent needed, or 4 agents → Business.
 * `items` are the check's results (use case id + € value per month); `valuePerMonth` is the figure
 * the page already shows as the monthly value, used for the percentage.
 */
export function recommendLicence(items: { id: string; euroMonth: number }[], valuePerMonth: number): LicenceRecommendation {
  const byAgent = new Map<AgentId, number>();
  for (const it of items) {
    const a = AGENT_FOR_USE_CASE[it.id];
    if (a) byAgent.set(a, (byAgent.get(a) ?? 0) + it.euroMonth);
  }
  const agents = AGENT_ORDER.filter((a) => (byAgent.get(a) ?? 0) > AGENT_VALUE_THRESHOLD);
  const plan: PlanId = agents.includes("phone") || agents.length >= 4 ? "business" : agents.length >= 2 ? "professional" : "starter";
  return { plan, agents, valuePerMonth, share: shareOf(plan, valuePerMonth) };
}

export const shareOf = (plan: PlanId, valuePerMonth: number) =>
  valuePerMonth > 0 ? Math.round((perMonth(PLANS[plan]) / valuePerMonth) * 100) : null;

/** The fixed licence shown on the Becker Bauservice example (estimate). */
export const EXAMPLE_LICENCE: LicenceRecommendation = {
  plan: "professional",
  agents: ["email", "invoice", "quote"],
  valuePerMonth: 1560,
  share: shareOf("professional", 1560),
};

export const PRICING_NOTES = {
  free: "Always free: the 10-minute process check and a 30-minute call.",
  consulting: `Extra consulting day on site: €${EXTRA_CONSULTING_DAY.toLocaleString("en-US")}.`,
  terms: "All prices net, plus VAT. Annual contract, renews yearly, cancel up to 3 months before renewal.",
  funding: "Bavarian firm? Ask us about funding such as the Digitalbonus Bayern.",
};

export const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-US");
