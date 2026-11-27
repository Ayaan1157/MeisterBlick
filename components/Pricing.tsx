"use client";
import { useState } from "react";
import { ButtonLink } from "@/components/ui";
import { CUSTOM_AGENT, PLANS, PLAN_ORDER, PRICING_NOTES, euro, perMonth } from "@/lib/pricing";

/** Three annual licences. The monthly view is the same annual contract, shown as yearly ÷ 12. */
export function PricingCards() {
  const [monthly, setMonthly] = useState(false);
  return (
    <>
      <div role="radiogroup" aria-label="Billing view" className="mt-10 inline-flex rounded-full border border-ink/25 p-1">
        {[["Pay yearly", false], ["Pay monthly", true]].map(([label, m]) => (
          <button
            key={label as string}
            type="button"
            role="radio"
            aria-checked={monthly === m}
            onClick={() => setMonthly(m as boolean)}
            className={`h-10 rounded-full px-4 text-[16px] font-bold transition-colors ${monthly === m ? "bg-ink text-white" : "text-ink hover:text-signal-dark"}`}
          >
            {label as string}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-5 lg:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const hi = !!p.highlight;
          return (
            <li key={id} className={`relative flex flex-col rounded-2xl bg-sheet p-5 sm:p-7 ${hi ? "border-2 border-ink" : "border border-line"}`}>
              {hi && <span className="absolute -top-3.5 left-5 rounded-full bg-ruler px-3 py-1 text-[13px] font-bold text-ink">{p.highlight}</span>}
              <h3 className="font-display text-[22px] font-extrabold">{p.name}</h3>
              <p className="mt-3">
                <span className="font-poster text-[44px] tnum">{euro(monthly ? perMonth(p) : p.yearly)}</span>
                <span className="ml-1 text-[16px] text-ink-2">/ {monthly ? "month" : "year"}</span>
              </p>
              <p className="text-[14px] text-ink-2 tnum">
                {monthly ? `${euro(p.yearly)} per year, annual contract` : `≈ ${euro(perMonth(p))} / month`}
              </p>
              <dl className="mt-5 flex-1 divide-y divide-line border-y border-line text-[16px]">
                {[
                  ["For", p.forLabel],
                  ["Agents", p.agentsLabel],
                  ["Phone agent", p.phoneLabel],
                  ["Users", p.usersLabel],
                  ["Fair use", `≈ ${p.tasks.toLocaleString("en-US")} tasks / month`],
                  ["Support", p.support],
                  ["Setup", p.setup ? `${euro(p.setup)} one-off` : "Included"],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[104px_1fr] gap-3 py-2.5">
                    <dt className="text-ink-2">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href={`/checkout?plan=${id}`} variant={hi ? "signal" : "secondary"} className="mt-6 w-full">Choose {p.name}</ButtonLink>
            </li>
          );
        })}
      </ul>

      {/* Custom agent: for the task none of the standard agents covers */}
      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-dashed border-ink/40 bg-plaster p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="max-w-2xl">
          <h3 className="font-display text-[22px] font-extrabold">Custom agent</h3>
          <p className="mt-1 text-[17px]">
            A job none of our agents does, like material orders, timesheets or your own software? We build an agent for it.
          </p>
          <p className="mt-2 text-[16px] font-bold tnum">
            From {euro(CUSTOM_AGENT.buildFrom)} one-off, then {euro(CUSTOM_AGENT.monthly)} / month. Works with every licence.
          </p>
          <p className="mt-1 text-[14px] text-ink-2">Fixed price after the process analysis, before you sign.</p>
        </div>
        <ButtonLink href="/checkout?custom=1" variant="secondary" className="flex-none">Add a custom agent</ButtonLink>
      </div>

      <ul className="mt-8 max-w-2xl space-y-1.5 text-[15px] text-ink-2">
        <li className="font-bold text-ink">{PRICING_NOTES.free}</li>
        <li>{PRICING_NOTES.tasks}</li>
        <li>{PRICING_NOTES.phone}</li>
        <li>{PRICING_NOTES.consulting}</li>
        <li>{PRICING_NOTES.terms}</li>
        <li>{PRICING_NOTES.funding}</li>
      </ul>
    </>
  );
}
