"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader, btn } from "@/components/ui";
import { DEMOS, DEMO_LABELS, type DemoId } from "@/data/demos";
import { INDUSTRY_LABELS, PAIN_LABELS, TOOL_LABELS, ruleProfile } from "@/lib/fallback";
import { BUDGET_LABELS } from "@/lib/scoring";
import { demoState, useCheckState } from "@/lib/store";
import type { BudgetTier, Lead, Profile, TeamSize, Worry } from "@/lib/types";

const blank: Lead = { industry: "painter", teamSize: "10-49", bavaria: true, weekText: "", pains: [], tools: [], budget: 1, worry: "cost", website: "", companyName: "" };

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`min-h-12 rounded-full border-2 px-4 py-2 text-[17px] font-bold transition-colors ${on ? "border-blue bg-blue text-white" : "border-ink/20 bg-sheet text-ink hover:border-blue"}`}>
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-6">
      <legend className="font-display text-[21px] font-extrabold">{label}</legend>
      {hint && <p className="mt-0.5 text-[16px] text-ink-2">{hint}</p>}
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

export default function StartPage() {
  const router = useRouter();
  const { state, update, replace } = useCheckState();
  const [lead, setLead] = useState<Lead>(blank);
  const [phase, setPhase] = useState<"form" | "reading" | "profile">("form");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [siteText, setSiteText] = useState<string | undefined>();
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (state?.lead && state.exampleId) setLead(state.lead);
  }, [state?.exampleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => setLead((l) => ({ ...l, [k]: v }));
  const toggle = (k: "pains" | "tools", v: string) =>
    setLead((l) => ({ ...l, [k]: l[k].includes(v) ? l[k].filter((x) => x !== v) : [...l[k], v] }));

  const loadExample = (id: DemoId) => {
    const s = demoState(id, true);
    replace(s);
    setLead(s.lead!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const demo = state?.demoMode && state.exampleId;
    setPhase("reading");
    let p: Profile;
    let text: string | undefined;
    if (demo) {
      const d = DEMOS[state!.exampleId as DemoId];
      await new Promise((r) => setTimeout(r, lead.website ? 1400 : 500));
      p = d.profile;
      text = d.siteText;
      setNote(lead.website ? `Read ${lead.website} (cached for demo)` : "");
    } else {
      try {
        const res = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lead }) });
        const j = await res.json();
        p = j.profile;
        text = j.siteText;
        setNote(j.note || "");
      } catch {
        p = ruleProfile(lead);
        setNote("Couldn't reach the server. Using your answers only.");
      }
    }
    setProfile(p);
    setSiteText(text);
    setPhase("profile");
  }

  function confirm() {
    const fresh = !(state?.demoMode && state.exampleId);
    update({
      lead, profile: profile!, siteText,
      budget: lead.budget,
      history: [], answers: fresh ? {} : state!.answers,
      picks: fresh ? undefined : state!.picks,
      exampleId: fresh ? undefined : state!.exampleId,
      demoMode: !!state?.demoMode && !!state.exampleId,
    });
    router.push("/consult");
  }

  const ex = state?.exampleId as DemoId | undefined;

  return (
    <>
      <SiteHeader right={<span className="text-[15px] text-ink-2">Step 1 of 3 · about 2 minutes</span>} />
      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        {phase === "form" && (
          <form onSubmit={submit} className="rise space-y-6">
            <div>
              <h1 className="font-display text-[34px] font-extrabold leading-tight">Tell us about your business</h1>
              <p className="mt-1 text-ink-2">No tech words needed. Tap what fits.</p>
            </div>

            {ex ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ruler-dark bg-ruler/25 p-4">
                <p className="text-[16px]"><b>Example loaded:</b> {DEMOS[ex].lead.companyName} (fictional). Change anything or continue.</p>
                <button type="button" className={btn("secondary", "sm")} onClick={() => { update({ ...demoState(ex, true) }); router.push("/results"); }}>Skip to results</button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-[16px]">
                <span className="text-ink-2">Or try an example:</span>
                {(Object.keys(DEMOS) as DemoId[]).map((id) => (
                  <button key={id} type="button" onClick={() => loadExample(id)} className="rounded-full border-2 border-ink/20 bg-sheet px-4 py-2 font-bold hover:border-blue">{DEMO_LABELS[id]}</button>
                ))}
              </div>
            )}

            <Field label="What kind of business?">
              <div className="flex flex-wrap gap-2">
                {(["painter", "electrician", "plumber", "carpentry", "bakery", "other"] as const).map((i) => (
                  <Chip key={i} on={lead.industry === i} onClick={() => set("industry", i)}>{INDUSTRY_LABELS[i]}</Chip>
                ))}
              </div>
              <label className="mt-4 block text-[16px] font-bold" htmlFor="cname">Business name <span className="font-normal text-ink-2">(optional)</span></label>
              <input id="cname" value={lead.companyName ?? ""} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Becker Bauservice"
                className="mt-1 h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[18px] focus:border-blue focus:outline-none" />
            </Field>

            <Field label="How many people work with you?">
              <div className="flex flex-wrap gap-2">
                {(["1-9", "10-49", "50-249"] as TeamSize[]).map((t) => (
                  <Chip key={t} on={lead.teamSize === t} onClick={() => set("teamSize", t)}>{t.replace("-", "–")}</Chip>
                ))}
              </div>
            </Field>

            <Field label="Your website" hint="Optional. We read it to make the advice fit you.">
              <input value={lead.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="www.your-business.de" inputMode="url" aria-label="Website address"
                className="h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[18px] focus:border-blue focus:outline-none" />
            </Field>

            <Field label="Is your business in Bavaria?" hint="For the Digitalbonus Bayern funding check.">
              <div className="flex gap-2">
                <Chip on={lead.bavaria} onClick={() => set("bavaria", true)}>Yes</Chip>
                <Chip on={!lead.bavaria} onClick={() => set("bavaria", false)}>No</Chip>
              </div>
            </Field>

            <Field label="Describe your week in your own words" hint="When does the phone ring? When do you write quotes? What annoys you?">
              <textarea value={lead.weekText} onChange={(e) => set("weekText", e.target.value)} rows={5} aria-label="Describe your week"
                placeholder="e.g. On site from 7:30. The phone rings and I can't pick up. Quotes at the kitchen table in the evening…"
                className="w-full rounded-lg border-2 border-ink/20 bg-sheet p-3 text-[18px] leading-relaxed focus:border-blue focus:outline-none" />
            </Field>

            <Field label="What eats your week?" hint="Tap all that apply.">
              <div className="flex flex-wrap gap-2">
                {Object.entries(PAIN_LABELS).map(([k, v]) => (
                  <Chip key={k} on={lead.pains.includes(k)} onClick={() => toggle("pains", k)}>{v}</Chip>
                ))}
              </div>
            </Field>

            <Field label="Which tools do you use today?">
              <div className="flex flex-wrap gap-2">
                {TOOL_LABELS.map((t) => (
                  <Chip key={t} on={lead.tools.includes(t)} onClick={() => toggle("tools", t)}>{t}</Chip>
                ))}
              </div>
            </Field>

            <Field label="What could you spend on a first step?">
              <input type="range" min={0} max={3} step={1} value={lead.budget} onChange={(e) => set("budget", Number(e.target.value) as BudgetTier)}
                className="w-full" aria-label="Budget comfort" aria-valuetext={BUDGET_LABELS[lead.budget]} />
              <div className="mt-1 grid grid-cols-4 text-[14px] text-ink-2">
                {BUDGET_LABELS.map((b, i) => <span key={b} className={`${i === lead.budget ? "font-bold text-ink" : ""} ${i === 3 ? "text-right" : i > 0 ? "text-center" : ""}`}>{b}</span>)}
              </div>
            </Field>

            <Field label="What's your biggest worry?">
              <div className="flex flex-wrap gap-2">
                {([["cost", "Cost"], ["gdpr", "Data protection (GDPR)"], ["staff", "Staff won't use it"], ["time", "No time to set it up"]] as [Worry, string][]).map(([k, v]) => (
                  <Chip key={k} on={lead.worry === k} onClick={() => set("worry", k)}>{v}</Chip>
                ))}
              </div>
            </Field>

            <div className="sticky bottom-0 -mx-4 border-t border-line bg-plaster/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
              <button type="submit" className={`${btn("primary", "lg")} w-full`} disabled={lead.pains.length === 0}>
                Continue to the short chat
              </button>
              {lead.pains.length === 0 && <p className="mt-2 text-center text-[15px] text-ink-2">Tap at least one thing that eats your week.</p>}
            </div>
          </form>
        )}

        {phase === "reading" && (
          <div className="rise flex min-h-[50vh] flex-col items-center justify-center text-center" role="status">
            <div className="w-64"><div className="h-3 overflow-hidden rounded bg-line"><div className="unfold h-full bg-ruler [animation-duration:1.4s]" /></div></div>
            <p className="mt-5 font-display text-[24px] font-extrabold">{lead.website ? `Reading your website…` : "Getting your profile ready…"}</p>
            <p className="mt-1 text-ink-2">{lead.website ? "Services, opening hours, how customers reach you." : "Just a moment."}</p>
          </div>
        )}

        {phase === "profile" && profile && (
          <div className="rise space-y-5">
            <h1 className="font-display text-[32px] font-extrabold leading-tight">Here&apos;s what we understood</h1>
            <p className="text-ink-2">Fix anything that&apos;s wrong. Then we ask you 4–5 short questions.</p>
            {note && <p className="rounded-lg bg-sheet px-3 py-2 text-[15px] text-ink-2">{note}</p>}
            <div className="squared space-y-4 rounded-xl border border-line p-5">
              <label className="block">
                <span className="text-[15px] font-bold text-ink-2">Business name</span>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 font-display text-[22px] font-extrabold focus:border-blue focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-[15px] font-bold text-ink-2">Services (one per line)</span>
                <textarea rows={Math.min(6, profile.services.length + 1)} value={profile.services.join("\n")} onChange={(e) => setProfile({ ...profile, services: e.target.value.split("\n") })} className="mt-1 w-full rounded-lg border-2 border-ink/20 bg-sheet p-3 focus:border-blue focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-[15px] font-bold text-ink-2">How customers reach you</span>
                <input value={profile.customerChannels.join(", ")} onChange={(e) => setProfile({ ...profile, customerChannels: e.target.value.split(/,\s*/) })} className="mt-1 h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 focus:border-blue focus:outline-none" />
              </label>
              {profile.areas && <p className="text-[16px]"><b>Area:</b> {profile.areas}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={confirm} className={`${btn("primary", "lg")} flex-1`}>That&apos;s right, continue</button>
              <button onClick={() => setPhase("form")} className={btn("secondary", "lg")}>Back</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
