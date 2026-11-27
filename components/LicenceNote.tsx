import { ButtonLink } from "@/components/ui";
import { AGENTS, PHONE_ADDON, PLANS, euro, perMonth, type LicenceRecommendation } from "@/lib/pricing";

/** The recommended annual licence for a result. Reads every price from lib/pricing. */
export function LicenceNote({ rec, button = false, className = "" }: { rec: LicenceRecommendation; button?: boolean; className?: string }) {
  const p = PLANS[rec.plan];
  const agents = rec.agents.map((a) => AGENTS[a].name.replace(" agent", "")).join(", ");
  return (
    <div className={`rounded-xl border border-line bg-plaster p-4 sm:p-5 ${className}`}>
      <p className="text-[15px] font-bold text-ink-2">Recommended licence</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-[24px] font-extrabold">{p.name}</span>
        <span className="tnum text-ink-2">{euro(p.yearly)} / year · ≈ {euro(perMonth(p))} / month</span>
      </p>
      {rec.phoneAddOn && (
        <p className="mt-1 text-[16px] tnum">
          + Phone agent {euro(PHONE_ADDON.monthly)} / month = <b>≈ {euro(rec.monthly)} / month</b>
        </p>
      )}
      <p className="mt-2 text-[16px]">
        {agents ? <><b>{rec.agents.length === 1 ? "Agent" : "Agents"}:</b> {agents}</> : <>Pick the one agent that fits you best.</>}
      </p>
      {rec.share !== null && (
        <p className="mt-1 text-[16px]">Your licence costs ≈ <b className="tnum">{rec.share}%</b> of the time it gives back{rec.valuePerMonth ? <> (≈ {euro(rec.valuePerMonth)} value per month)</> : null}.</p>
      )}
      <p className="mt-1 text-[13px] text-ink-2">Estimate.</p>
      {button && <ButtonLink href={`/checkout?plan=${rec.plan}${rec.phoneAddOn ? "&phone=1" : ""}`} variant="signal" className="mt-4">Choose your licence</ButtonLink>}
    </div>
  );
}
