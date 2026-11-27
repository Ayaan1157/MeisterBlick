"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LicenceNote } from "@/components/LicenceNote";
import { ButtonLink, Ruler, Verdict } from "@/components/ui";
import { recommendLicence } from "@/lib/pricing";
import { rulePicks } from "@/lib/fallback";
import { DEFAULT_ASSUMPTIONS, eur, rank } from "@/lib/scoring";
import type { Industry, Lead, TeamSize } from "@/lib/types";

const TRADES: { id: Industry; label: string }[] = [
  { id: "painter", label: "Painter" },
  { id: "electrician", label: "Electrician" },
  { id: "plumber", label: "Plumber" },
  { id: "carpentry", label: "Carpenter" },
];
const TEAMS: { id: TeamSize; label: string }[] = [
  { id: "1-9", label: "1–9" },
  { id: "10-49", label: "10–49" },
  { id: "50-249", label: "50–249" },
];

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`h-11 rounded-full border px-4 text-[16px] font-bold transition-colors ${value === o.id ? "border-ink bg-ink text-white" : "border-ink/25 hover:border-ink"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Slider({ id, label, value, min, max, step = 1, unit, onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-bold">{label}</label>
        <output htmlFor={id} className="font-display text-[20px] font-extrabold tnum">{unit === "€" ? `€${value}` : `${value} ${unit}`}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" />
    </div>
  );
}

/** Ten-second estimate on the homepage: same rules and maths as the full check, typical numbers for the rest. */
export function QuickEstimate() {
  const [trade, setTrade] = useState<Industry>("painter");
  const [team, setTeam] = useState<TeamSize>("10-49");
  const [quotes, setQuotes] = useState(6);
  const [calls, setCalls] = useState(3);
  const [rate, setRate] = useState(50);
  const [bavaria, setBavaria] = useState(true);

  const r = useMemo(() => {
    const lead: Lead = { industry: trade, teamSize: team, bavaria, weekText: "", pains: ["quotes", "calls"], tools: [], budget: 2, worry: "cost" };
    const answers = { quotesPerWeek: String(quotes), quoteHours: "1 hour", missedCalls: String(calls), hourlyRate: `€${rate}` };
    const picks = rulePicks(lead, answers);
    return rank(picks, { ...DEFAULT_ASSUMPTIONS, hourlyRate: rate, overrides: {} }, lead, 2);
  }, [trade, team, quotes, calls, rate, bavaria]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      <div className="space-y-6">
        <Chips label="Your trade" value={trade} options={TRADES} onChange={setTrade} />
        <Chips label="People in the team" value={team} options={TEAMS} onChange={setTeam} />
        <Slider id="q-quotes" label="Quotes you write a week" value={quotes} min={0} max={20} unit={quotes === 1 ? "quote" : "quotes"} onChange={setQuotes} />
        <Slider id="q-calls" label="Calls you miss a day" value={calls} min={0} max={12} unit={calls === 1 ? "call" : "calls"} onChange={setCalls} />
        <Slider id="q-rate" label="What one hour of your time is worth" value={rate} min={35} max={90} step={5} unit="€" onChange={setRate} />
        <label className="flex items-center gap-3 text-[16px] font-bold">
          <input type="checkbox" checked={bavaria} onChange={(e) => setBavaria(e.target.checked)} className="h-5 w-5 accent-[var(--signal)]" />
          Based in Bavaria (counts the Digitalbonus)
        </label>
      </div>

      <div className="rounded-2xl border border-line bg-sheet p-5 sm:p-7" aria-live="polite">
        <p className="text-[15px] font-bold text-ink-2">Rough estimate, per month</p>
        <p className="mt-2 font-poster text-[56px] tnum sm:text-[72px]">{eur(Math.max(0, r.totalEuro))}</p>
        <p className="mt-1 text-[18px]">and ≈ <b className="tnum">{r.totalHours} hours</b> back, after running costs</p>
        <Ruler value={r.checkScore} label={`AI Check Score ${r.checkScore} of 100`} animate={false} />
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {r.top.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <span className="font-bold">{e.title}</span>
              <span className="flex items-center gap-3">
                <span className="tnum text-ink-2">{eur(e.euroMonth)}/mo</span>
                <Verdict v={e.verdict} />
              </span>
            </li>
          ))}
          {r.notWorth[0] && (
            <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <span className="text-ink-2">{r.notWorth[0].uc.title}</span>
              <Verdict v="no" />
            </li>
          )}
        </ul>
        <LicenceNote rec={recommendLicence(r.top, Math.max(0, r.totalEuro), team)} className="mt-6" />
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <ButtonLink href="/start" variant="signal" size="lg">Do the full check · 10 min</ButtonLink>
          <Link href="/results?example=becker" className="font-bold underline decoration-2 underline-offset-4 hover:decoration-signal">See a full example</Link>
        </div>
        <p className="mt-4 text-[14px] text-ink-2">Typical numbers for your trade. The full check asks about your week and gets much closer.</p>
      </div>
    </div>
  );
}
