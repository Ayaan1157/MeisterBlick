"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ButtonLink, Ruler, SiteHeader, Tag, Verdict, btn } from "@/components/ui";
import { FUNDING_NOTE } from "@/lib/funding";
import { BUDGET_LABELS, eur, months, rank, type Evaluated } from "@/lib/scoring";
import { useCheckState } from "@/lib/store";
import type { Assumptions, BudgetTier } from "@/lib/types";

const levelText = (l: string) => (l === "low" ? "Low" : l === "medium" ? "Medium" : "High");

const spring = { type: "spring" as const, stiffness: 300, damping: 28 };

function Card({ e, index }: { e: Evaluated; index: number }) {
  const reduce = useReducedMotion();
  const funded = e.funding.eligible && e.funding.grant > 0;
  const invest = e.uc.type === "Robot" || e.upfront > 5000;
  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, transition: { ...spring, delay: index * 0.08 } }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      transition={spring}
      className="rounded-xl border border-line bg-sheet p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Verdict v={e.verdict} />
        <Tag>{e.uc.type}</Tag>
        {!e.withinBudget && <span className="text-[14px] font-bold text-later">Above your budget</span>}
      </div>
      <h3 className="mt-3 font-display text-[24px] font-extrabold leading-tight">{e.title}</h3>
      <p className="mt-2 text-ink-2">{e.description}</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-4 sm:grid-cols-4">
        <div>
          <dt className="text-[14px] text-ink-2">Time saved</dt>
          <dd className="font-display text-[24px] font-extrabold tnum">≈ {e.hours} h<span className="text-[15px] font-bold text-ink-2"> / month</span></dd>
        </div>
        <div>
          <dt className="text-[14px] text-ink-2">Value</dt>
          <dd className="font-display text-[24px] font-extrabold tnum">≈ {eur(e.euroMonth)}<span className="text-[15px] font-bold text-ink-2"> / month</span></dd>
          {e.extraValue > 0 && <dd className="text-[13px] text-ink-2">incl. {eur(e.extraValue)} {e.uc.extraValueLabel}</dd>}
        </div>
        <div>
          <dt className="text-[14px] text-ink-2">Cost</dt>
          <dd className="text-[17px] font-bold tnum">
            {funded ? (<><s className="text-ink-2">{eur(e.upfront)}</s> {eur(e.funding.fundedUpfront)}</>) : eur(e.upfront)} once
          </dd>
          <dd className="text-[17px] font-bold tnum">+ {eur(e.monthly)} / month</dd>
          {funded && <dd className="text-[13px] text-go">after {eur(e.funding.grant)} Digitalbonus</dd>}
        </div>
        <div>
          <dt className="text-[14px] text-ink-2">Pays for itself in</dt>
          <dd className="font-display text-[24px] font-extrabold tnum">{months(e.paybackMonths)}</dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-3 text-[16px] sm:grid-cols-2">
        <p><b>Effort:</b> {levelText(e.uc.effort)} · <b>Risk:</b> {levelText(e.uc.risk)}</p>
        <p><b>Score:</b> <span className="tnum">{e.score}</span> / 100</p>
        <p className="sm:col-span-2"><b>Data protection:</b> {e.uc.gdpr}</p>
        <p className="sm:col-span-2"><b>Your people:</b> {e.uc.readiness}</p>
      </div>
      <div className="mt-4">
        <p className="text-[15px] font-bold">Options from different vendors <span className="font-normal text-ink-2">(examples, not endorsements)</span></p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {e.uc.tools.map((t) => <li key={t} className="rounded-md border border-line px-2.5 py-1 text-[15px]">{t}</li>)}
        </ul>
      </div>
      {invest && (
        <Link href={`/invest?task=${e.id}`} className="mt-4 inline-block font-bold text-blue underline underline-offset-4">Compare buy, rent, lease or subscribe</Link>
      )}
    </motion.article>
  );
}

function NumberInput({ label, value, onChange, step = 1, suffix }: { label: string; value: number; onChange: (n: number) => void; step?: number; suffix?: string }) {
  return (
    <label className="block">
      <span className="text-[14px] text-ink-2">{label}</span>
      <span className="mt-1 flex items-center gap-1">
        <input type="number" inputMode="decimal" step={step} value={Number.isFinite(value) ? value : 0} onChange={(ev) => onChange(Number(ev.target.value))}
          className="h-11 w-full rounded-lg border-2 border-ink/20 bg-sheet px-2 text-[17px] tnum focus:border-blue focus:outline-none" />
        {suffix && <span className="text-[14px] text-ink-2">{suffix}</span>}
      </span>
    </label>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { state, update } = useCheckState();
  const [openAssumptions, setOpenAssumptions] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);

  useEffect(() => {
    if (state && (!state.picks || !state.lead)) router.replace("/start");
  }, [state, router]);

  const results = useMemo(() => {
    if (!state?.picks || !state.lead) return null;
    return rank(state.picks, state.assumptions, state.lead, state.budget);
  }, [state]);

  if (!state || !results || !state.picks || !state.lead) return <><SiteHeader /><main className="p-10 text-center text-ink-2">Loading your results…</main></>;

  const a = state.assumptions;
  const setA = (p: Partial<Assumptions>) => update((s) => ({ assumptions: { ...s.assumptions, ...p } }));
  const setOverride = (id: string, k: "hours" | "upfront" | "monthly", v: number) =>
    update((s) => ({ assumptions: { ...s.assumptions, overrides: { ...s.assumptions.overrides, [id]: { ...s.assumptions.overrides[id], [k]: v } } } }));
  const name = state.profile?.name || state.lead.companyName || "Your business";
  const pilot = state.picks.pilot;
  const pilotEval = results.top.find((t) => t.id === pilot.id);
  const pilotTitle = pilotEval?.title ?? state.picks.candidates.find((c) => c.id === pilot.id)?.title ?? "";

  return (
    <>
      <SiteHeader right={<span className="text-[15px] text-ink-2">Step 3 of 3 · your results</span>} />
      <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        {/* Headline */}
        <section className="squared rise rounded-2xl border border-line p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-bold">{name} · AI Check Score</p>
            <p className="text-[14px] text-ink-2">{state.picks.source === "ai" ? "personalised by AI, " : ""}all figures are estimates</p>
          </div>
          <Ruler value={results.checkScore} label={`AI Check Score ${results.checkScore} of 100`} />
          <h1 className="mt-5 font-display text-[30px] font-extrabold leading-tight sm:text-[40px]">
            ≈ {results.totalHours} hours and {eur(results.totalEuro)} per month you could win back
          </h1>
          <p className="mt-2 text-ink-2">From your top 3, after running costs. Change any number under “Assumptions”.</p>
        </section>

        {/* Budget slider */}
        <section className="mt-6 rounded-xl border border-line bg-sheet p-5">
          <label htmlFor="budget" className="font-display text-[20px] font-extrabold">Your budget for a first step</label>
          <input id="budget" type="range" min={0} max={3} step={1} value={state.budget} onChange={(e) => update({ budget: Number(e.target.value) as BudgetTier })}
            className="mt-3 w-full" aria-valuetext={BUDGET_LABELS[state.budget]} />
          <div className="mt-1 grid grid-cols-4 text-[14px] text-ink-2">
            {BUDGET_LABELS.map((b, i) => <span key={b} className={`${i === state.budget ? "font-bold text-ink" : ""} ${i === 3 ? "text-right" : i > 0 ? "text-center" : ""}`}>{b}</span>)}
          </div>
        </section>

        {/* Top 3 */}
        <section className="mt-10">
          <h2 className="font-display text-[30px] font-extrabold">Your top 3</h2>
          <p className="text-ink-2">Cheapest working option first, then by return.</p>
          <div className="mt-5 space-y-5">
            <AnimatePresence initial={true}>
              {results.top.map((e, i) => <Card key={e.id} e={e} index={i} />)}
            </AnimatePresence>
          </div>
        </section>

        {/* Not worth it */}
        {results.notWorth.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-[30px] font-extrabold">Not worth it (for now)</h2>
            <p className="text-ink-2">We'd rather tell you now than after you've paid.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {results.notWorth.map((e) => (
                <article key={e.id} className="rounded-xl border-2 border-no/25 bg-no-bg/40 p-5">
                  <div className="flex flex-wrap items-center gap-2"><Verdict v="no" /><Tag>{e.uc.type}</Tag></div>
                  <h3 className="mt-3 font-display text-[21px] font-extrabold leading-tight">{e.uc.title}</h3>
                  <p className="mt-2">{e.reason}</p>
                  <p className="mt-3 text-[15px] text-ink-2 tnum">Costs ≈ {eur(e.upfront)} up front + {eur(e.monthly)} / month · payback {months(e.paybackMonths)}</p>
                  {(e.uc.type === "Robot" || e.upfront > 5000) && (
                    <Link href={`/invest?task=${e.id}`} className="mt-2 inline-block text-[16px] font-bold text-blue underline underline-offset-4">Check buy vs. rent anyway</Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Pilot */}
        <section className="mt-12 rounded-2xl bg-ink p-6 text-white sm:p-8">
          <p className="font-bold text-ruler">Your first pilot</p>
          <h2 className="mt-1 font-display text-[28px] font-extrabold leading-tight">{pilotTitle}</h2>
          <p className="mt-2 text-white/85">{pilot.why}</p>
          <h3 className="mt-6 font-display text-[19px] font-extrabold">2-week test plan</h3>
          <ol className="mt-3 space-y-2">
            {pilot.plan.map((s, i) => (
              <li key={i} className="flex gap-3"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ruler font-display text-[14px] font-black text-ink tnum">{i + 1}</span><span>{s}</span></li>
            ))}
          </ol>
          <div className="mt-6 rounded-lg border border-white/25 p-4">
            <p className="text-[15px] text-white/70">Success looks like</p>
            <p className="font-bold">{pilot.metric}</p>
          </div>
        </section>

        {/* CTAs */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <ButtonLink href="/demo" size="lg">Try your demo assistant</ButtonLink>
          <ButtonLink href="/report" size="lg" variant="secondary">Download 1-page pilot report (PDF)</ButtonLink>
          <ButtonLink href="/checkout?plan=pilot-report" size="lg" variant="secondary">Book Pilot Report €490</ButtonLink>
          <button className={btn("secondary", "lg")} onClick={() => setBooked("funding help")}>Get funding help</button>
        </section>
        {booked && (
          <p className="rise mt-3 rounded-lg bg-go-bg px-4 py-3 font-bold text-go" role="status">
            Noted: {booked}. In the live product we call you back within one working day. (Demo: no payment taken.)
          </p>
        )}
        <p className="mt-4 text-[15px] text-ink-2">{state.lead.bavaria ? FUNDING_NOTE : "Not in Bavaria: funding check available. We look at federal and state programmes for you."}</p>

        {/* Assumptions */}
        <section className="mt-10 rounded-xl border border-line bg-sheet">
          <button className="flex w-full items-center justify-between px-5 py-4 text-left" aria-expanded={openAssumptions} onClick={() => setOpenAssumptions((o) => !o)}>
            <span className="font-display text-[20px] font-extrabold">Assumptions (edit, everything recalculates)</span>
            <span aria-hidden className={`text-[22px] transition-transform ${openAssumptions ? "rotate-45" : ""}`}>+</span>
          </button>
          {openAssumptions && (
            <div className="rise space-y-6 border-t border-line px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberInput label="Your hourly rate (€)" value={a.hourlyRate} onChange={(n) => setA({ hourlyRate: n })} />
                <NumberInput label="Funding rate (30–50%)" value={Math.round(a.fundingRate * 100)} onChange={(n) => setA({ fundingRate: Math.min(50, Math.max(30, n)) / 100 })} suffix="%" />
                <NumberInput label="Share of extra value we count" value={Math.round(a.extraCapture * 100)} onChange={(n) => setA({ extraCapture: Math.min(100, Math.max(0, n)) / 100 })} suffix="%" />
              </div>
              <div className="space-y-4">
                {[...results.top, ...results.overBudget].map((e) => (
                  <div key={e.id} className="border-t border-line pt-4">
                    <p className="font-bold">{e.title}</p>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      <NumberInput label="Hours / month" value={e.hours} onChange={(n) => setOverride(e.id, "hours", n)} />
                      <NumberInput label="One-time (€)" value={e.upfront} step={50} onChange={(n) => setOverride(e.id, "upfront", n)} />
                      <NumberInput label="Monthly (€)" value={e.monthly} step={5} onChange={(n) => setOverride(e.id, "monthly", n)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button className={btn("ghost", "sm")} onClick={() => setA({ overrides: {} })}>Reset my changes</button>
              </div>
              <p className="text-[15px] text-ink-2">How we calculate: € per month = hours saved × hourly rate + {Math.round(a.extraCapture * 100)}% of extra value (e.g. jobs from missed calls). Payback = one-time cost after funding ÷ (€ per month − monthly cost). Score = impact vs. effort, risk and cost, 0–100. The AI only picks and personalises use cases; all maths runs in code, so the same inputs always give the same result.</p>
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-wrap gap-4 text-[16px]">
          <Link href="/start" className="font-bold text-blue underline underline-offset-4">Start over</Link>
          <Link href="/invest" className="font-bold text-blue underline underline-offset-4">Smart Investment Selector</Link>
        </div>
      </main>
    </>
  );
}
