import library from "@/data/useCases.json";
import { fundingFor, type FundingResult } from "./funding";
import type { Assumptions, BudgetTier, Candidate, Lead, Level, Picks, UseCase } from "./types";

export const USE_CASES = library as UseCase[];
export const byId = (id: string) => USE_CASES.find((u) => u.id === id);

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  hourlyRate: 45,
  fundingRate: 0.3,
  extraCapture: 0.5,
  overrides: {},
};

export const BUDGET_LABELS = ["Under €100 / month", "Under €1,000 one-time", "Under €10,000", "More"];

const lv = (l: Level) => (l === "low" ? 0 : l === "medium" ? 1 : 2);
const mid = (r: [number, number]) => (r[0] + r[1]) / 2;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const round10 = (x: number) => Math.round(x / 10) * 10;

export interface Evaluated {
  uc: UseCase;
  id: string;
  title: string;
  description: string;
  hours: number;
  timeValue: number; // € from hours
  extraValue: number; // € non-time value counted
  euroMonth: number; // total € / month
  upfront: number;
  monthly: number;
  funding: FundingResult;
  net: number; // € / month after running costs
  paybackMonths: number; // Infinity if never
  score: number; // 0-100
  verdict: "now" | "later" | "no";
  withinBudget: boolean;
  costBucket: number;
}

export function withinBudget(upfrontFunded: number, monthly: number, tier: BudgetTier) {
  if (tier === 0) return monthly <= 100 && upfrontFunded <= 500;
  if (tier === 1) return upfrontFunded <= 1000 && monthly <= 150;
  if (tier === 2) return upfrontFunded <= 10000;
  return true;
}

export function evaluate(
  c: Pick<Candidate, "id" | "title" | "description" | "hoursPerMonth" | "extraValuePerMonth">,
  a: Assumptions,
  lead: Pick<Lead, "bavaria" | "teamSize">,
  budget: BudgetTier,
): Evaluated | null {
  const uc = byId(c.id);
  if (!uc) return null;
  const o = a.overrides[c.id] ?? {};
  const hours = Math.max(0, Math.round(o.hours ?? c.hoursPerMonth ?? mid(uc.hoursSaved)));
  const extraRaw = c.extraValuePerMonth ?? (uc.extraValue ? mid(uc.extraValue) : 0);
  const extraValue = Math.round(extraRaw * a.extraCapture);
  const upfront = Math.max(0, o.upfront ?? round10(mid(uc.upfrontCost)));
  const monthly = Math.max(0, o.monthly ?? round10(mid(uc.monthlyCost)));
  const funding = fundingFor(upfront, { bavaria: lead.bavaria, teamSize: lead.teamSize, rate: a.fundingRate });
  const timeValue = Math.round(hours * a.hourlyRate);
  const euroMonth = timeValue + extraValue;
  const net = euroMonth - monthly;
  const paybackMonths = net <= 0 ? Infinity : funding.fundedUpfront / net;

  const impact = clamp(net / 2000);
  const pb = net <= 0 ? 0 : clamp(1 - paybackMonths / 18);
  const ease = 1 - (lv(uc.effort) + lv(uc.risk)) / 4;
  const score = Math.round(100 * (0.45 * impact + 0.35 * pb + 0.2 * ease));

  const inBudget = withinBudget(funding.fundedUpfront, monthly, budget);
  const verdict: Evaluated["verdict"] =
    net <= 0 || paybackMonths > 36 ? "no" : score >= 50 && paybackMonths <= 6 && inBudget ? "now" : "later";
  const effMonthly = monthly + funding.fundedUpfront / 12;
  const costBucket = effMonthly <= 100 ? 0 : effMonthly <= 500 ? 1 : 2;

  return {
    uc, id: c.id, title: c.title || uc.title, description: c.description || uc.description,
    hours, timeValue, extraValue, euroMonth, upfront, monthly, funding, net, paybackMonths, score,
    verdict, withinBudget: inBudget, costBucket,
  };
}

export interface Results {
  top: Evaluated[];
  notWorth: (Evaluated & { reason: string })[];
  overBudget: Evaluated[];
  checkScore: number;
  totalHours: number;
  totalEuro: number;
}

/** Pick top 3 by score among in-budget candidates, then show them cheapest-first (ties: higher ROI). */
export function rank(picks: Picks, a: Assumptions, lead: Pick<Lead, "bavaria" | "teamSize">, budget: BudgetTier): Results {
  const notIds = new Set(picks.notWorthIt.map((n) => n.id));
  const evals = picks.candidates
    .filter((c) => !notIds.has(c.id))
    .map((c) => evaluate(c, a, lead, budget))
    .filter((e): e is Evaluated => !!e && e.verdict !== "no");
  const inBudget = evals.filter((e) => e.withinBudget).sort((x, y) => y.score - x.score);
  const overBudget = evals.filter((e) => !e.withinBudget);
  const best = inBudget.slice(0, 3);
  // too strict a budget: fill with the cheapest remaining so Thomas always sees 3 options
  if (best.length < 3) {
    best.push(...overBudget.sort((x, y) => x.costBucket - y.costBucket || y.score - x.score).slice(0, 3 - best.length));
  }
  const byScore = [...best].sort((x, y) => y.score - x.score);
  const w = [0.5, 0.3, 0.2];
  const checkScore = Math.round(byScore.reduce((s, e, i) => s + e.score * w[i], 0) / w.slice(0, Math.max(1, byScore.length)).reduce((s, x) => s + x, 0));
  const top = best.sort((x, y) => x.costBucket - y.costBucket || y.score - x.score);

  const notWorth = picks.notWorthIt
    .map((n) => {
      const uc = byId(n.id);
      if (!uc) return null;
      // a machine that would stand idle: count the low end of the range (realistic utilisation)
      const e = evaluate({ id: n.id, title: uc.title, description: uc.description, hoursPerMonth: uc.hoursSaved[0], extraValuePerMonth: uc.extraValue?.[0] ?? 0 }, a, lead, 3);
      return e ? ({ ...e, verdict: "no", reason: n.reason || uc.notWorthItReason } as Evaluated & { reason: string }) : null;
    })
    .filter((x): x is Evaluated & { reason: string } => !!x)
    .slice(0, 2);

  return {
    top,
    notWorth,
    overBudget: overBudget.filter((o) => !top.includes(o)),
    checkScore: isFinite(checkScore) ? checkScore : 0,
    totalHours: top.reduce((s, e) => s + e.hours, 0),
    totalEuro: top.reduce((s, e) => s + e.net, 0),
  };
}

export const eur = (n: number) =>
  "€" + Math.round(n).toLocaleString("en-US");
export const months = (n: number) =>
  !isFinite(n) || n > 120 ? (isFinite(n) ? "over 10 years" : "never")
  : n >= 24 ? `about ${Math.round(n / 12)} years`
  : n < 1 ? "under 1 month" : `${Math.ceil(n)} month${Math.ceil(n) === 1 ? "" : "s"}`;
