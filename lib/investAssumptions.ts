// All values are estimates for small German businesses (2025/26 list-price ranges, rounded).
export interface InvestType {
  id: string;
  label: string;
  buyPrice: number; // € incl. integration
  maintenancePct: number; // per year, of buy price (buy + lease pay this)
  rentMonthly: number; // incl. maintenance, min 3 months
  rentSetup: number;
  leaseMonthly: number; // 60 months, excl. maintenance
  leaseDown: number;
  raasMonthly: number; // subscription incl. maintenance, 12-month term
  raasSetup: number;
  automationShare: number; // share of the manual hours it takes over
  digital: boolean; // counts for Digitalbonus (software / digital hardware)
}

export const INVEST_TYPES: InvestType[] = [
  { id: "cobot", label: "Cobot arm (e.g. tray loading, machine tending)", buyPrice: 45000, maintenancePct: 0.06, rentMonthly: 2100, rentSetup: 2500, leaseMonthly: 900, leaseDown: 4500, raasMonthly: 1350, raasSetup: 3000, automationShare: 0.7, digital: true },
  { id: "palletizer", label: "Palletizer", buyPrice: 90000, maintenancePct: 0.05, rentMonthly: 3800, rentSetup: 5000, leaseMonthly: 1750, leaseDown: 9000, raasMonthly: 2500, raasSetup: 6000, automationShare: 0.85, digital: true },
  { id: "transport", label: "Transport robot (AMR)", buyPrice: 35000, maintenancePct: 0.07, rentMonthly: 1600, rentSetup: 1500, leaseMonthly: 700, leaseDown: 3500, raasMonthly: 1050, raasSetup: 2000, automationShare: 0.6, digital: true },
  { id: "cleaning", label: "Cleaning robot", buyPrice: 12000, maintenancePct: 0.08, rentMonthly: 650, rentSetup: 300, leaseMonthly: 245, leaseDown: 1200, raasMonthly: 420, raasSetup: 500, automationShare: 0.65, digital: true },
  { id: "painting", label: "Wall-painting robot", buyPrice: 110000, maintenancePct: 0.06, rentMonthly: 5200, rentSetup: 4000, leaseMonthly: 2150, leaseDown: 11000, raasMonthly: 3600, raasSetup: 5000, automationShare: 0.5, digital: true },
  { id: "software", label: "Software licence / custom software", buyPrice: 20000, maintenancePct: 0.18, rentMonthly: 900, rentSetup: 0, leaseMonthly: 400, leaseDown: 2000, raasMonthly: 600, raasSetup: 1000, automationShare: 0.5, digital: true },
];

export const TASK_TO_TYPE: Record<string, string> = {
  "bakery-tray-cobot": "cobot",
  palletizer: "palletizer",
  "floor-cleaning-robot": "cleaning",
  "painting-robot": "painting",
  "custom-ai-scheduling": "software",
  "bakery-forecast": "software",
};

export type Option = "buy" | "rent" | "lease" | "raas";
export const OPTION_LABELS: Record<Option, string> = { buy: "Buy", rent: "Rent", lease: "Lease", raas: "Subscribe (RaaS)" };

export interface InvestInputs {
  typeId: string;
  shifts: number;
  hoursPerShift: number; // manual hours of this task per shift
  certainty: "stable" | "growing" | "uncertain";
  labourRate: number;
  cash: number;
  firstTry: boolean;
  grant: number; // funding on buy price
}

const DAYS = 21;

export function simulate(t: InvestType, i: InvestInputs) {
  const manualMonthly = i.shifts * i.hoursPerShift * DAYS * i.labourRate;
  const remaining = manualMonthly * (1 - t.automationShare);
  const maint = (t.buyPrice * t.maintenancePct) / 12;
  const series: Record<Option | "manual", number[]> = { buy: [], rent: [], lease: [], raas: [], manual: [] };
  const upfront: Record<Option, number> = { buy: t.buyPrice - i.grant, rent: t.rentSetup, lease: t.leaseDown, raas: t.raasSetup };
  const monthly: Record<Option, number> = {
    buy: maint,
    rent: t.rentMonthly,
    lease: t.leaseMonthly + maint,
    raas: t.raasMonthly,
  };
  for (let m = 0; m <= 60; m++) {
    series.manual.push(manualMonthly * m);
    (Object.keys(monthly) as Option[]).forEach((o) => series[o].push(upfront[o] + (monthly[o] + remaining) * m));
  }
  const breakEven = (o: Option) => {
    const idx = series[o].findIndex((v, m) => m > 0 && v <= series.manual[m]);
    return idx === -1 ? null : idx;
  };
  return { manualMonthly, remaining, upfront, monthly, series, breakEven };
}

export function recommend(t: InvestType, i: InvestInputs, series?: Record<Option | "manual", number[]>): { option: Option | "manual"; reason: string } {
  const buyCash = t.buyPrice - i.grant;
  if (series) {
    const cheapest = Math.min(...(["buy", "rent", "lease", "raas"] as Option[]).map((o) => series[o][60]));
    if (cheapest >= series.manual[60]) {
      return { option: "manual", reason: "Not worth it for now: every option costs more over 5 years than doing the work by hand. Check again if your volume grows to about 2 shifts a day." };
    }
  }
  if (i.certainty === "uncertain" || i.firstTry) {
    return i.certainty === "uncertain" && t.rentMonthly < t.raasMonthly * 1.8
      ? { option: "rent", reason: "Your volume is uncertain. Renting lets you stop after 3 months if work drops, with maintenance included." }
      : { option: "raas", reason: "First time with this kind of machine: subscribe for 12 months, maintenance included, then decide with real numbers instead of promises." };
  }
  if (i.certainty === "stable" && i.cash >= buyCash) {
    return { option: "buy", reason: "Stable volume and the cash on hand: buying is cheapest over 5 years, especially after funding." };
  }
  return { option: "lease", reason: "Volume looks solid but buying would tie up too much cash. Leasing spreads the cost and keeps your cash for the business." };
}
