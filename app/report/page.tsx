"use client";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Ruler, btn } from "@/components/ui";
import { FUNDING_NOTE } from "@/lib/funding";
import { BUDGET_LABELS, eur, months, rank } from "@/lib/scoring";
import { useCheckState } from "@/lib/store";

export default function ReportPage() {
  const { state } = useCheckState();
  const r = useMemo(() => (state?.picks && state.lead ? rank(state.picks, state.assumptions, state.lead, state.budget) : null), [state]);

  useEffect(() => {
    if (r && new URLSearchParams(window.location.search).get("print") === "1") setTimeout(() => window.print(), 400);
  }, [r]);

  if (!state || !r || !state.lead || !state.picks) {
    return <main className="p-10 text-center">No results yet. <Link className="font-bold text-blue underline" href="/start">Start the Quick Check</Link></main>;
  }
  const name = state.profile?.name || state.lead.companyName || "Your business";
  const pilot = state.picks.pilot;
  const pilotTitle = r.top.find((t) => t.id === pilot.id)?.title ?? state.picks.candidates.find((c) => c.id === pilot.id)?.title;
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="mx-auto w-full max-w-[820px] px-4 py-6 sm:py-10">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/results" className="font-bold text-blue underline underline-offset-4">Back to results</Link>
        <button onClick={() => window.print()} className={btn("primary", "md")}>Download PDF (Print → Save as PDF)</button>
      </div>

      <article className="print-sheet rounded-xl border border-line bg-sheet p-6 text-[14px] leading-snug sm:p-10 print:text-[10.5pt]">
        <header className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
          <div>
            <p className="font-display text-[13px] font-extrabold">MeisterBlick · 1-page pilot report</p>
            <h1 className="font-display text-[28px] font-extrabold leading-tight">{name}</h1>
            <p className="text-ink-2">{state.profile?.industry} · {state.lead.teamSize.replace("-", "–")} people · {state.lead.bavaria ? "Bavaria" : "outside Bavaria"} · {date}</p>
          </div>
          <div className="text-right">
            <p className="text-ink-2">AI Check Score</p>
            <p className="font-display text-[40px] font-black leading-none tnum">{r.checkScore}<span className="text-[16px] text-ink-2">/100</span></p>
          </div>
        </header>

        <div className="mt-2 print:hidden"><Ruler value={r.checkScore} animate={false} /></div>
        <p className="mt-3 font-display text-[19px] font-extrabold">≈ {r.totalHours} hours and {eur(r.totalEuro)} per month to win back (estimate)</p>

        <h2 className="mt-4 font-display text-[16px] font-extrabold">Top 3 (budget: {BUDGET_LABELS[state.budget]})</h2>
        <table className="mt-1 w-full border-collapse text-left tnum">
          <thead>
            <tr className="border-b border-ink/40 text-[12px] text-ink-2">
              <th className="py-1 pr-2 font-normal">Use case</th><th className="py-1 pr-2 font-normal">Verdict</th><th className="py-1 pr-2 font-normal">h / mo</th><th className="py-1 pr-2 font-normal">€ / mo</th><th className="py-1 pr-2 font-normal">Cost (after funding)</th><th className="py-1 font-normal">Payback</th>
            </tr>
          </thead>
          <tbody>
            {r.top.map((e) => (
              <tr key={e.id} className="border-b border-line align-top">
                <td className="py-1.5 pr-2"><b>{e.title}</b><br /><span className="text-[12px] text-ink-2">{e.uc.type} · effort {e.uc.effort} · risk {e.uc.risk}</span></td>
                <td className="py-1.5 pr-2">{e.verdict === "now" ? "✅ Do it now" : "⏳ Later"}</td>
                <td className="py-1.5 pr-2">{e.hours}</td>
                <td className="py-1.5 pr-2">{eur(e.euroMonth)}</td>
                <td className="py-1.5 pr-2">{e.funding.grant > 0 ? <><s className="text-ink-2">{eur(e.upfront)}</s> {eur(e.funding.fundedUpfront)}</> : eur(e.upfront)} + {eur(e.monthly)}/mo</td>
                <td className="py-1.5">{months(e.paybackMonths)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1.4fr_1fr] print:grid-cols-[1.4fr_1fr]">
          <section className="rounded-lg border-2 border-ink p-3">
            <h2 className="font-display text-[16px] font-extrabold">First pilot: {pilotTitle}</h2>
            <p className="mt-1">{pilot.why}</p>
            <ol className="mt-2 list-decimal space-y-0.5 pl-5">{pilot.plan.map((p, i) => <li key={i}>{p}</li>)}</ol>
            <p className="mt-2"><b>Success metric:</b> {pilot.metric}</p>
          </section>
          <section>
            <h2 className="font-display text-[16px] font-extrabold">❌ Not worth it (for now)</h2>
            <ul className="mt-1 space-y-1.5">{r.notWorth.map((n) => <li key={n.id}><b>{n.uc.title}:</b> {n.reason}</li>)}</ul>
            <h2 className="mt-3 font-display text-[16px] font-extrabold">Key assumptions</h2>
            <ul className="mt-1 space-y-0.5">
              <li>Hourly rate: {eur(state.assumptions.hourlyRate)}</li>
              <li>Funding: {state.lead.bavaria ? `Digitalbonus Bayern, ${Math.round(state.assumptions.fundingRate * 100)}% of one-time costs, max €10,000` : "not applied (outside Bavaria)"}</li>
              <li>Extra value counted at {Math.round(state.assumptions.extraCapture * 100)}%</li>
              {Object.entries(state.answers).slice(0, 5).map(([k, v]) => <li key={k}>{k.replace(/([A-Z])/g, " $1").toLowerCase()}: {v}</li>)}
            </ul>
          </section>
        </div>

        <footer className="mt-4 border-t border-line pt-2 text-[11px] text-ink-2">
          All figures are estimates based on your answers and typical costs; check offers before you buy. {state.lead.bavaria ? FUNDING_NOTE : ""} MeisterBlick is vendor-neutral; implementation partners pay us a disclosed commission.
        </footer>
      </article>
    </main>
  );
}
