// Rule-based fallback: works with no API key, no network, on stage.
import { DEFAULT_ASSUMPTIONS, USE_CASES, evaluate } from "./scoring";
import type { Candidate, ChatTurn, Lead, Picks, Profile, UseCase } from "./types";

export const TRADES = ["painter", "electrician", "plumber", "carpentry"];

export const INDUSTRY_LABELS: Record<string, string> = {
  painter: "Painter & decorator",
  electrician: "Electrician",
  plumber: "Plumber / heating",
  carpentry: "Carpentry & wood workshop",
  bakery: "Bakery",
  other: "Other small business",
};

export const PAIN_LABELS: Record<string, string> = {
  calls: "Phone calls",
  quotes: "Quotes",
  scheduling: "Scheduling",
  billing: "Invoices & billing",
  emails: "Emails",
  whatsapp: "WhatsApp chaos",
  social: "Social media & reviews",
  physical: "Repetitive physical work",
};

export const TOOL_LABELS = ["Excel", "Word", "WhatsApp", "Outlook / Gmail", "DATEV", "Lexware", "Trade software", "Other"];

export interface Question {
  key: string;
  q: string;
  options: string[];
}

export const QUESTION_BANK: Record<string, Question> = {
  quotesPerWeek: { key: "quotesPerWeek", q: "How many quotes do you write in a normal week?", options: ["1–3", "4–8", "9–15", "More than 15"] },
  quoteHours: { key: "quoteHours", q: "And how long does one quote take you, roughly?", options: ["30 minutes", "1 hour", "2 hours", "Half a day"] },
  missedCalls: { key: "missedCalls", q: "How many calls do you miss on a normal day while you're on site?", options: ["0–1", "2–4", "5–10", "More than 10"] },
  unbilled: { key: "unbilled", q: "Extra work on site that never makes it onto the invoice: how much per month, roughly?", options: ["Hardly any", "About €200", "About €500", "€1,000 or more"] },
  overdue: { key: "overdue", q: "How many invoices are overdue at the end of a month?", options: ["None", "1–3", "4–10", "More than 10"] },
  preorders: { key: "preorders", q: "How many pre-orders (cakes, catering) come in per week by phone or WhatsApp?", options: ["Under 10", "10–30", "30–60", "More than 60"] },
  leftovers: { key: "leftovers", q: "What's left over and thrown away on a normal day, in euros, across all shops?", options: ["Under €30", "About €60", "About €120", "€200 or more"] },
  webVisitors: { key: "webVisitors", q: "Roughly how many people visit your website each month?", options: ["Don't know", "Under 100", "100–1,000", "More than 1,000"] },
  hourlyRate: { key: "hourlyRate", q: "Last one: what is one hour of your time worth? Your hourly rate is a good guess.", options: ["€40", "€45", "€55", "€65"] },
};

/** Turn a chip answer or free text into a number. */
export function parseNum(key: string, text?: string): number | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (/don.?t know|not sure|keine/.test(t)) return null;
  if (/hardly|none|no |^0$|kaum/.test(t)) return 0;
  if (key === "quoteHours") {
    if (/half a day/.test(t)) return 4;
    const m = t.match(/(\d+(?:[.,]\d+)?)\s*(min|h|hour|stund)/);
    if (m) return m[2].startsWith("min") ? parseFloat(m[1]) / 60 : parseFloat(m[1].replace(",", "."));
  }
  const nums = (t.replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:[.,]\d+)?/g) || []).map((n) => parseFloat(n.replace(",", ".")));
  if (!nums.length) return null;
  if (/more than|or more|\+/.test(t)) return nums[0] * 1.3;
  if (/under/.test(t)) return nums[0] * 0.5;
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
  return nums[0];
}

export function questionPlan(lead: Lead): Question[] {
  const keys: string[] = [];
  const p = new Set(lead.pains);
  const trade = TRADES.includes(lead.industry);
  if (p.has("quotes") || trade) keys.push("quotesPerWeek", "quoteHours");
  if (p.has("calls") || p.has("whatsapp")) keys.push("missedCalls");
  if (lead.industry === "bakery") keys.push("preorders", "leftovers");
  if (trade && (p.has("billing") || keys.length < 3)) keys.push("unbilled");
  else if (p.has("billing")) keys.push("overdue");
  if (lead.website) keys.push("webVisitors");
  const uniq = [...new Set(keys)].slice(0, 4);
  uniq.push("hourlyRate");
  return uniq.map((k) => QUESTION_BANK[k]);
}

export function nextRuleQuestion(lead: Lead, history: ChatTurn[]): Question | null {
  const asked = new Set(history.filter((h) => h.role === "assistant" && h.key).map((h) => h.key));
  return questionPlan(lead).find((q) => !asked.has(q.key)) ?? null;
}

function num(answers: Record<string, string>, key: string) {
  return parseNum(key, answers[key]);
}

function fits(uc: UseCase, industry: string) {
  return (
    uc.fitsIndustries.includes("all") ||
    uc.fitsIndustries.includes(industry) ||
    (uc.fitsIndustries.includes("trades") && TRADES.includes(industry))
  );
}

function triggered(uc: UseCase, lead: Lead, answers: Record<string, string>): boolean {
  const q = num(answers, "quotesPerWeek");
  const calls = num(answers, "missedCalls");
  const web = num(answers, "webVisitors");
  const unbilled = num(answers, "unbilled");
  return uc.notWorthItWhen.some((c) => {
    switch (c) {
      case "few_quotes": return q !== null && q < 2;
      case "few_calls": return calls !== null && calls < 1;
      case "low_web_traffic": return !lead.website || (web !== null && web < 100) || /under 100/i.test(answers.webVisitors || "");
      case "team_tiny":
      case "team_small":
      case "small_floor": return lead.teamSize === "1-9";
      case "team_mid": return lead.teamSize === "10-49";
      case "no_unbilled": return unbilled === 0;
      case "full_order_book": return /full|fully booked|ausgebucht|waiting list/i.test(lead.weekText);
      default: return false;
    }
  });
}

/** Estimate hours and extra € from the conversation. */
export function estimate(uc: UseCase, answers: Record<string, string>): { hours: number; extra?: number } {
  const [hMin, hMax] = uc.hoursSaved;
  const clampH = (h: number) => Math.round(Math.min(hMax * 1.3, Math.max(hMin * 0.5, h)));
  const q = num(answers, "quotesPerWeek");
  const qh = num(answers, "quoteHours") ?? 1;
  const calls = num(answers, "missedCalls");
  const extraMax = uc.extraValue?.[1] ?? 0;
  switch (uc.id) {
    case "quote-photo-voice": if (q !== null) return { hours: clampH(q * qh * 4.3 * 0.55) }; break;
    case "quote-text-blocks": if (q !== null) return { hours: clampH(q * qh * 4.3 * 0.25) }; break;
    case "quote-followup": if (q !== null) return { hours: clampH(q * 0.1 * 4.3), extra: Math.min(extraMax, q * 4.3 * 0.05 * 400) }; break;
    case "phone-ai-answer":
    case "bakery-order-intake":
      if (calls !== null) return { hours: clampH(calls * 21 * 0.15), extra: Math.min(extraMax, calls * 21 * 0.04 * 350) };
      break;
    case "extra-work-voice-log": {
      const u = num(answers, "unbilled");
      if (u !== null) return { hours: clampH((hMin + hMax) / 2), extra: Math.round(u * 0.7) };
      break;
    }
    case "bakery-forecast": {
      const l = num(answers, "leftovers");
      if (l !== null) return { hours: clampH((hMin + hMax) / 2), extra: Math.round(l * 26 * 0.25) };
      break;
    }
  }
  return { hours: Math.round((hMin + hMax) / 2) };
}

export function rulePicks(lead: Lead, answers: Record<string, string>, companyName?: string): Picks {
  const rate = num(answers, "hourlyRate") ?? 45;
  const fitting = USE_CASES.filter((u) => fits(u, lead.industry));
  const ok = fitting.filter((u) => !triggered(u, lead, answers) && u.pilot.plan.length > 0);
  const painMatch = (u: UseCase) => u.pains.filter((p) => lead.pains.includes(p)).length;

  const cands: (Candidate & { score: number; pm: number })[] = ok.map((u) => {
    const est = estimate(u, answers);
    const c: Candidate = { id: u.id, title: u.title, description: personalise(u, lead, answers, companyName), hoursPerMonth: est.hours, extraValuePerMonth: est.extra };
    const e = evaluate(c, { ...DEFAULT_ASSUMPTIONS, hourlyRate: rate }, lead, 3);
    return { ...c, score: e?.score ?? 0, pm: painMatch(u) };
  });
  // Pain match counts most, then score. Keep 6 so the budget slider can re-rank.
  cands.sort((a, b) => Math.min(b.pm, 1) - Math.min(a.pm, 1) || b.score - a.score);
  const candidates = cands.slice(0, 6).map(({ score: _s, pm: _p, ...c }) => c);

  const typeOrder = (u: UseCase) => (u.type === "Robot" ? 0 : u.id === "custom-ai-scheduling" ? 1 : 2);
  const notWorthIt = fitting
    .filter((u) => triggered(u, lead, answers))
    .sort((a, b) => typeOrder(a) - typeOrder(b))
    .slice(0, 2)
    .map((u) => ({ id: u.id, reason: u.notWorthItReason }));

  const best = [...cands].sort((a, b) => b.score - a.score)[0];
  const uc = USE_CASES.find((u) => u.id === best?.id) ?? ok[0];
  return {
    candidates,
    notWorthIt,
    pilot: {
      id: uc.id,
      why: `Highest return for the least risk, and you can test it in 2 weeks without changing how your crews work.`,
      plan: uc.pilot.plan,
      metric: uc.pilot.metric,
    },
    source: "rules",
  };
}

function personalise(u: UseCase, lead: Lead, answers: Record<string, string>, name?: string): string {
  const q = answers.quotesPerWeek;
  const calls = answers.missedCalls;
  if (u.id === "quote-photo-voice" && q) return `You write ${q.toLowerCase()} quotes a week, mostly in the evening. Photos and a voice note from the site become a draft in your own template; you check and send.`;
  if ((u.id === "phone-ai-answer" || u.id === "bakery-order-intake") && calls) return `You miss ${calls.toLowerCase()} calls a day. An assistant answers, notes the request and sends it to your WhatsApp${name ? ` as "${name}"` : ""}, so you call back the same day.`;
  if (u.id === "extra-work-voice-log" && answers.unbilled) return `${answers.unbilled} of extra work a month goes unbilled. Crew leads say it into the phone on site; it lands on the invoice.`;
  return u.description;
}

export function ruleProfile(lead: Lead, siteText?: string): Profile {
  const title = siteText?.match(/^TITLE: (.+)$/m)?.[1]?.split(/[|–-]/)[0]?.trim();
  const headings = (siteText?.match(/^H: (.+)$/gm) || []).map((h) => h.slice(3)).slice(0, 6);
  const channels = ["Phone"];
  if (lead.tools.includes("WhatsApp")) channels.push("WhatsApp");
  if (lead.tools.includes("Outlook / Gmail")) channels.push("Email");
  if (lead.website) channels.push("Website");
  return {
    name: lead.companyName || title || "Your business",
    industry: INDUSTRY_LABELS[lead.industry] || lead.industryOther || "Small business",
    services: headings.length ? headings : [INDUSTRY_LABELS[lead.industry]],
    customerChannels: channels,
    painPoints: lead.pains.map((p) => PAIN_LABELS[p]),
    followUpQuestions: questionPlan(lead).map((q) => q.q),
  };
}
