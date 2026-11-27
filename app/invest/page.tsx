"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/ui";
import { fundingFor } from "@/lib/funding";
import { INVEST_TYPES, OPTION_LABELS, TASK_TO_TYPE, recommend, simulate, type InvestInputs, type Option } from "@/lib/investAssumptions";
import { eur } from "@/lib/scoring";
import { useCheckState } from "@/lib/store";

const COLORS: Record<Option | "manual", string> = { manual: "#1e2a33", buy: "#24497a", rent: "#c07a00", lease: "#7a4fa0", raas: "#2e7a4c" };
const OPTS: Option[] = ["buy", "rent", "lease", "raas"];
const RISK: Record<Option, [string, string, string]> = {
  buy: ["High: you own a machine that stands still", "Low: resale only", "You pay (budgeted)"],
  rent: ["Low: return it after 3 months", "High", "Included"],
  lease: ["Medium–high: 60-month contract runs on", "Low", "You pay (budgeted)"],
  raas: ["Low–medium: 12-month term", "Medium", "Included"],
};

function Chart({ series, rec }: { series: Record<Option | "manual", number[]>; rec: Option | "manual" }) {
  const W = 720, H = 320, P = { l: 64, r: 110, t: 16, b: 36 };
  const max = Math.max(...Object.values(series).flat()) * 1.05;
  const x = (m: number) => P.l + (m / 60) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - (v / max) * (H - P.t - P.b);
  const path = (arr: number[]) => arr.map((v, m) => `${m ? "L" : "M"}${x(m).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const keys: (Option | "manual")[] = ["manual", ...OPTS];
  // direct labels at the end, nudged apart
  const ends = keys.map((k) => ({ k, y: y(series[k][60]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 16) ends[i].y = ends[i - 1].y + 16;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative cost over 60 months for each option and for doing it by hand">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#cfd4cc" strokeWidth={1} />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize={12} fill="#4a5761">{t >= 1000 ? `€${Math.round(t / 1000)}k` : "€0"}</text>
        </g>
      ))}
      {[0, 12, 24, 36, 48, 60].map((m) => (
        <text key={m} x={x(m)} y={H - P.b + 20} textAnchor="middle" fontSize={12} fill="#4a5761">{m === 0 ? "today" : `${m / 12} yr`}</text>
      ))}
      {keys.map((k) => (
        <path key={k} d={path(series[k])} fill="none" stroke={COLORS[k]} strokeWidth={k === rec ? 4 : 2} strokeDasharray={k === "manual" ? "6 5" : undefined} opacity={k === rec || k === "manual" ? 1 : 0.65} />
      ))}
      {ends.map(({ k, y: yy }) => (
        <text key={k} x={W - P.r + 8} y={yy + 4} fontSize={13} fontWeight={k === rec ? 800 : 600} fill={COLORS[k]}>{k === "manual" ? "By hand today" : OPTION_LABELS[k]}</text>
      ))}
    </svg>
  );
}

function Num({ label, value, onChange, step = 1, suffix }: { label: string; value: number; onChange: (n: number) => void; step?: number; suffix?: string }) {
  return (
    <label className="block">
      <span className="text-[15px] font-bold">{label}</span>
      <span className="mt-1 flex items-center gap-2">
        <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[18px] tnum focus:border-blue focus:outline-none" />
        {suffix && <span className="text-ink-2">{suffix}</span>}
      </span>
    </label>
  );
}

export default function InvestPage() {
  const { state } = useCheckState();
  const [inp, setInp] = useState<Omit<InvestInputs, "grant">>({ typeId: "cobot", shifts: 1, hoursPerShift: 4, certainty: "uncertain", labourRate: 35, cash: 20000, firstTry: true });
  useEffect(() => {
    const task = new URLSearchParams(window.location.search).get("task");
    if (task && TASK_TO_TYPE[task]) setInp((i) => ({ ...i, typeId: TASK_TO_TYPE[task] }));
  }, []);
  const set = <K extends keyof typeof inp>(k: K, v: (typeof inp)[K]) => setInp((i) => ({ ...i, [k]: v }));

  const t = INVEST_TYPES.find((x) => x.id === inp.typeId)!;
  const funding = fundingFor(t.buyPrice, { bavaria: state?.lead?.bavaria ?? true, teamSize: state?.lead?.teamSize ?? "10-49", rate: state?.assumptions.fundingRate ?? 0.3 });
  const full: InvestInputs = { ...inp, grant: t.digital ? funding.grant : 0 };
  const sim = useMemo(() => simulate(t, full), [t, full.shifts, full.hoursPerShift, full.labourRate, full.grant]); // eslint-disable-line react-hooks/exhaustive-deps
  const rec = recommend(t, full, sim.series);

  return (
    <>
      <SiteHeader right={<Link href="/results" className="font-bold text-blue underline underline-offset-4">Back to results</Link>} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <h1 className="font-display text-[34px] font-extrabold leading-tight">Smart Investment Selector</h1>
        <p className="mt-1 max-w-2xl text-ink-2">Buy, rent, lease or subscribe? Compare the real 5-year cost against doing it by hand. All prices are estimates.</p>

        <section className="mt-6 grid gap-5 rounded-xl border border-line bg-sheet p-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="text-[15px] font-bold">Task / machine</span>
            <select value={inp.typeId} onChange={(e) => set("typeId", e.target.value)} className="mt-1 h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-2 text-[17px] focus:border-blue focus:outline-none">
              {INVEST_TYPES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </label>
          <Num label="Shifts per day" value={inp.shifts} onChange={(n) => set("shifts", Math.max(1, Math.min(3, n)))} />
          <Num label="Volume: hours of this task per shift" value={inp.hoursPerShift} onChange={(n) => set("hoursPerShift", Math.max(0, n))} step={0.5} suffix="h" />
          <Num label="Labour cost per hour" value={inp.labourRate} onChange={(n) => set("labourRate", n)} suffix="€" />
          <Num label="Cash you could spend" value={inp.cash} step={1000} onChange={(n) => set("cash", n)} suffix="€" />
          <fieldset>
            <legend className="text-[15px] font-bold">Volume certainty</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["stable", "growing", "uncertain"] as const).map((c) => (
                <button key={c} type="button" aria-pressed={inp.certainty === c} onClick={() => set("certainty", c)}
                  className={`h-12 rounded-full border-2 px-4 font-bold capitalize ${inp.certainty === c ? "border-blue bg-blue text-white" : "border-ink/20 bg-sheet"}`}>{c}</button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-3 text-[17px] sm:col-span-2 lg:col-span-3">
            <input type="checkbox" checked={inp.firstTry} onChange={(e) => set("firstTry", e.target.checked)} className="h-6 w-6 accent-[#24497a]" />
            This would be our first machine of this kind
          </label>
        </section>

        <section className="mt-6 rounded-2xl bg-ink p-6 text-white">
          <p className="font-bold text-ruler">Our recommendation</p>
          <p className="mt-1 font-display text-[30px] font-extrabold">{rec.option === "manual" ? "❌ Keep doing it by hand" : OPTION_LABELS[rec.option]}</p>
          <p className="mt-1 max-w-2xl text-white/85">{rec.reason}</p>
          <p className="mt-3 text-[15px] text-white/70">Doing it by hand today costs ≈ {eur(sim.manualMonthly)} a month.{" "}
            {t.digital && funding.eligible ? `Buy price after Digitalbonus: ${eur(t.buyPrice)} → ${eur(t.buyPrice - funding.grant)} (estimate).` : ""}</p>
        </section>

        <section className="mt-6 rounded-xl border border-line bg-sheet p-4 sm:p-6">
          <h2 className="font-display text-[22px] font-extrabold">Total cost over 5 years, including the work still done by hand</h2>
          <div className="-mx-2 mt-4 overflow-x-auto px-2"><div className="min-w-[560px]"><Chart series={sim.series} rec={rec.option} /></div></div>
        </section>

        <section className="mt-6 overflow-x-auto rounded-xl border border-line bg-sheet">
          <table className="w-full min-w-[720px] border-collapse text-left text-[16px] tnum">
            <thead>
              <tr className="border-b border-line text-[14px] text-ink-2">
                <th className="p-3 font-normal"></th>
                {OPTS.map((o) => <th key={o} className={`p-3 font-display text-[18px] font-extrabold ${o === rec.option ? "bg-ruler/30 text-ink" : "text-ink"}`}>{OPTION_LABELS[o]}{o === rec.option ? " ✓" : ""}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Upfront", (o: Option) => (o === "buy" && full.grant > 0 ? <><s className="text-ink-2">{eur(t.buyPrice)}</s> {eur(sim.upfront.buy)}</> : eur(sim.upfront[o]))],
                ["Monthly", (o: Option) => eur(sim.monthly[o])],
                ["5-year total", (o: Option) => <b>{eur(sim.series[o][60])}</b>],
                ["Break-even vs. by hand", (o: Option) => { const b = sim.breakEven(o); return b ? `month ${b}` : "not within 5 years"; }],
                ["Risk if volume drops", (o: Option) => RISK[o][0]],
                ["Flexibility", (o: Option) => RISK[o][1]],
                ["Maintenance", (o: Option) => RISK[o][2]],
              ].map(([label, fn]) => (
                <tr key={label as string} className="border-b border-line align-top">
                  <th className="p-3 text-[15px] font-bold">{label as string}</th>
                  {OPTS.map((o) => <td key={o} className={`p-3 ${o === rec.option ? "bg-ruler/15" : ""}`}>{(fn as (o: Option) => React.ReactNode)(o)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="mt-3 text-[14px] text-ink-2">Estimates. By hand: {inp.shifts} shift(s) × {inp.hoursPerShift} h × 21 days × {eur(inp.labourRate)}. The machine takes over about {Math.round(t.automationShare * 100)}% of that work; the rest stays manual and is included in every line. {funding.note}</p>
      </main>
    </>
  );
}
