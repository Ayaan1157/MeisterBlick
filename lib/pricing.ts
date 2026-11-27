// All prices and licence rules in one place. Change numbers here; every page reads from this file.
// Prices are net (plus VAT), per year, on an annual contract that renews yearly.
//
// How the prices were set (internal estimates, per customer per month; edit COSTS and re-check margins):
//   AI model use: ≈ €0.025 per task (one drafted quote, invoice, email reply or summarised call)
//   Phone line + speech: ≈ €0.15 per call minute
//   Support time: €60 / hour, setup work: €75 / hour, card and bank fees: 3 %
//
//   Plan            price/mo   running cost   margin     setup price  setup cost   margin
//   Starter          €124       ≈ €45          ≈ 64 %     €990         ≈ €375       ≈ 62 %
//   Professional     €291       ≈ €149         ≈ 49 %     €990         ≈ €1,125     ≈ -14 %
//   Business         €499       ≈ €491         ≈ 2 %      included     ≈ €2,300     loss
//   Phone add-on     €99        ≈ €66          ≈ 33 %     (in setup)
//   Custom agent     €90        ≈ €58          ≈ 36 %     from €2,900  ≈ €2,250     ≈ 22 %
//   Consulting day   €690       ≈ €750         ≈ -9 %
//
// These are the original launch prices. On the estimates above, Starter carries the margin while
// Business (phone minutes, on-site reviews, free setup) roughly breaks even in year one.

export const COSTS = {
  aiPerTask: 0.025,
  phonePerMinute: 0.15,
  supportHour: 60,
  setupHour: 75,
  paymentFees: 0.03,
};

export type PlanId = "starter" | "professional" | "business";
export type AgentId = "invoice" | "email" | "quote" | "phone";

export interface Plan {
  id: PlanId;
  name: string;
  forLabel: string; // who it's for
  yearly: number; // € per year, net
  agents: number; // standard agents the customer picks (invoice, email, quote)
  agentsLabel: string;
  phone: "addon" | "included";
  phoneLabel: string;
  users: number | null; // null = unlimited
  usersLabel: string;
  tasks: number; // fair use per month
  support: string;
  setup: number; // € one-off, 0 = included
  highlight?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter", name: "Starter", forLabel: "1–9 people", yearly: 1490,
    agents: 1, agentsLabel: "1 agent of your choice",
    phone: "addon", phoneLabel: "Add-on, €99 / month",
    users: 5, usersLabel: "Up to 5 users", tasks: 300,
    support: "Email support", setup: 990,
  },
  professional: {
    id: "professional", name: "Professional", forLabel: "10–49 people", yearly: 3490,
    agents: 3, agentsLabel: "Invoice, email and quote agents",
    phone: "addon", phoneLabel: "Add-on, €99 / month",
    users: 15, usersLabel: "Up to 15 users", tasks: 1500,
    support: "Monthly check-in", setup: 990, highlight: "Most chosen",
  },
  business: {
    id: "business", name: "Business", forLabel: "50–249 people", yearly: 5990,
    agents: 3, agentsLabel: "All agents",
    phone: "included", phoneLabel: "Included, 500 min",
    users: null, usersLabel: "Unlimited users", tasks: 5000,
    support: "Priority support + quarterly on-site review", setup: 0,
  },
};

export const PLAN_ORDER: PlanId[] = ["starter", "professional", "business"];

/** Monthly view of the same annual contract: yearly price ÷ 12, rounded. */
export const perMonth = (p: Plan) => Math.round(p.yearly / 12);

/** The phone agent on Starter and Professional. Business includes it with 500 minutes. */
export const PHONE_ADDON = { monthly: 99, yearly: 1188, minutes: 300, businessMinutes: 500, extraMinute: 0.29 };

/** An agent we build for one firm's own task (material orders, timesheets, their own software). Any plan. */
export const CUSTOM_AGENT = { buildFrom: 2900, monthly: 90, yearly: 1080 };

export const EXTRA_CONSULTING_DAY = 690;

export const AGENTS: Record<AgentId, { name: string; does: string }> = {
  invoice: { name: "Invoice agent", does: "Writes invoices from site notes and chases late payments." },
  email: { name: "Email agent", does: "Sorts the inbox and drafts replies you check and send." },
  quote: { name: "Quote agent", does: "Turns site photos and voice notes into quote drafts." },
  phone: { name: "Phone agent", does: "Answers calls you can't take and sends you the request." },
};
export const AGENT_ORDER: AgentId[] = ["invoice", "email", "quote", "phone"];
/** The agents a plan's agent count refers to. The phone agent is an add-on (or included in Business). */
export const STANDARD_AGENTS: AgentId[] = ["invoice", "email", "quote"];

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
  phoneAddOn: boolean; // phone agent booked as an add-on (never on Business, where it's included)
  monthly: number; // licence + add-on, € per month
  valuePerMonth: number;
  share: number | null; // monthly ÷ value per month, in %
}

/** € per month for a plan, with the phone add-on if booked. */
export const monthlyCost = (plan: PlanId, phoneAddOn = false) =>
  perMonth(PLANS[plan]) + (phoneAddOn && PLANS[plan].phone === "addon" ? PHONE_ADDON.monthly : 0);

export const shareOf = (plan: PlanId, valuePerMonth: number, phoneAddOn = false) =>
  valuePerMonth > 0 ? Math.round((monthlyCost(plan, phoneAddOn) / valuePerMonth) * 100) : null;

/**
 * Licence rules, so small firms never pay for what they don't use:
 *   standard agents worth more than €200/month: 0–1 → Starter, 2–3 → Professional;
 *   50–249 people → at least Professional, and Business once they use 2+ agents (their volume
 *   outgrows Professional's fair use); lighter use stays on Professional, the cheapest plan that fits;
 *   phone agent needed on Starter or Professional → €99/month add-on.
 * `items` are the check's results (use case id + € value per month); `valuePerMonth` is the figure
 * the page already shows as the monthly value, used for the percentage.
 */
export function recommendLicence(
  items: { id: string; euroMonth: number }[],
  valuePerMonth: number,
  teamSize?: "1-9" | "10-49" | "50-249",
): LicenceRecommendation {
  const byAgent = new Map<AgentId, number>();
  for (const it of items) {
    const a = AGENT_FOR_USE_CASE[it.id];
    if (a) byAgent.set(a, (byAgent.get(a) ?? 0) + it.euroMonth);
  }
  const agents = AGENT_ORDER.filter((a) => (byAgent.get(a) ?? 0) > AGENT_VALUE_THRESHOLD);
  const phone = agents.includes("phone");
  const n = agents.filter((a) => a !== "phone").length;
  const plan: PlanId =
    teamSize === "50-249" && n >= 2 ? "business"
    : teamSize === "50-249" || n >= 2 ? "professional"
    : "starter";
  const phoneAddOn = phone && PLANS[plan].phone === "addon";
  return { plan, agents, phoneAddOn, monthly: monthlyCost(plan, phoneAddOn), valuePerMonth, share: shareOf(plan, valuePerMonth, phoneAddOn) };
}

/** The fixed licence shown on the Becker Bauservice example (estimate). */
export const EXAMPLE_LICENCE: LicenceRecommendation = {
  plan: "professional",
  agents: ["email", "invoice", "quote"],
  phoneAddOn: false,
  monthly: monthlyCost("professional"),
  valuePerMonth: 1560,
  share: shareOf("professional", 1560),
};

export const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-US");

export const PRICING_NOTES = {
  free: "Always free: the 10-minute process check and a 30-minute call.",
  tasks: "A task is one drafted quote, invoice, email reply or answered call. Go over fair use and we talk first: no surprise bills.",
  phone: `Phone agent on Starter or Professional: ${euro(PHONE_ADDON.monthly)} / month with ${PHONE_ADDON.minutes} call minutes, then €${PHONE_ADDON.extraMinute.toFixed(2)} a minute.`,
  consulting: `Extra consulting day on site: ${euro(EXTRA_CONSULTING_DAY)}.`,
  terms: "All prices net, plus VAT. Annual contract, renews yearly, cancel up to 3 months before renewal.",
  funding: "Bavarian firm? The setup and process analysis may count for funding such as the Digitalbonus Bayern.",
};
