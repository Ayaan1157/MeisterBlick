"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer, SiteHeader, btn } from "@/components/ui";
import { AGENTS, CUSTOM_AGENT, PHONE_ADDON, PLANS, PLAN_ORDER, PRICING_NOTES, STANDARD_AGENTS, euro, type AgentId, type PlanId } from "@/lib/pricing";
import { useCheckState } from "@/lib/store";

const STORE = "meisterblick:licence-requests";
const field = "mt-1 h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[17px] focus:border-signal focus:outline-none";

/** Standard agents a plan starts with: the first ones that fit (Professional and Business: all three). */
const defaultAgents = (plan: PlanId): AgentId[] => STANDARD_AGENTS.slice(0, PLANS[plan].agents);
const tag = "rounded-full px-2 py-0.5 text-[12px] font-bold";

function Input({ id, label, hint, ...rest }: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-bold">{label}</label>
      <input id={id} name={id} className={field} {...rest} />
      {hint && <p className="mt-1 text-[14px] text-ink-2">{hint}</p>}
    </div>
  );
}

type Request = {
  plan: PlanId; billing: "yearly" | "monthly"; company: string; contact: string; email: string; phone: string;
  street: string; postcode: string; city: string; users: number; start: string; agents: AgentId[];
  phoneAddOn: boolean; custom: boolean; customTask: string; avv: boolean; terms: boolean;
};

export default function CheckoutPage() {
  const { state } = useCheckState();
  const [r, setR] = useState<Request>({
    plan: "professional", billing: "yearly", company: "", contact: "", email: "", phone: "",
    street: "", postcode: "", city: "", users: 5, start: "", agents: defaultAgents("professional"),
    phoneAddOn: false, custom: false, customTask: "", avv: false, terms: false,
  });
  const [today, setToday] = useState("");
  const [sent, setSent] = useState<Request | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = q.get("plan") as PlanId | null;
    if (p && p in PLANS) setR((x) => ({ ...x, plan: p, agents: defaultAgents(p), users: Math.min(x.users, PLANS[p].users ?? x.users) }));
    if (q.get("phone") === "1") setR((x) => ({ ...x, phoneAddOn: true }));
    if (q.get("custom") === "1") setR((x) => ({ ...x, custom: true }));
    setToday(new Date().toISOString().slice(0, 10));
  }, []);
  useEffect(() => {
    const name = state?.profile?.name || state?.lead?.companyName;
    if (name && !state?.exampleId) setR((x) => (x.company ? x : { ...x, company: name }));
  }, [state]);

  const set = <K extends keyof Request>(k: K, v: Request[K]) => setR((x) => ({ ...x, [k]: v }));
  const choosePlan = (p: PlanId) => {
    setR((x) => ({ ...x, plan: p, agents: defaultAgents(p), users: Math.min(x.users, PLANS[p].users ?? x.users) }));
    window.history.replaceState(null, "", `/checkout?plan=${p}`);
  };
  const toggleAgent = (a: AgentId) =>
    setR((x) => {
      if (PLANS[x.plan].agents >= STANDARD_AGENTS.length) return x;
      if (PLANS[x.plan].agents === 1) return { ...x, agents: [a] };
      return { ...x, agents: x.agents.includes(a) ? x.agents.filter((y) => y !== a) : [...x.agents, a] };
    });

  const P = PLANS[r.plan];
  const allIncluded = P.agents >= STANDARD_AGENTS.length;
  const phoneIncluded = P.phone === "included";
  const phoneYear = r.phoneAddOn && !phoneIncluded ? PHONE_ADDON.yearly : 0;
  const customYear = r.custom ? CUSTOM_AGENT.yearly : 0;
  const runningYear = P.yearly + phoneYear + customYear;
  const firstYear = runningYear + P.setup + (r.custom ? CUSTOM_AGENT.buildFrom : 0);
  const agentsOk = r.agents.length === P.agents;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agentsOk) return;
    // Demo only: nothing is sent anywhere and no payment is taken. Kept in this browser for the demo.
    try {
      const prev = JSON.parse(localStorage.getItem(STORE) || "[]");
      localStorage.setItem(STORE, JSON.stringify([...prev, { ...r, at: new Date().toISOString() }]));
    } catch {}
    console.info("[licence request]", { ...r, runningYear, firstYear });
    setSent(r);
    window.scrollTo({ top: 0 });
  }

  if (sent) {
    const S = PLANS[sent.plan];
    const sentAgents = [
      ...sent.agents.map((a) => AGENTS[a].name),
      ...(S.phone === "included" || sent.phoneAddOn ? [AGENTS.phone.name] : []),
      ...(sent.custom ? ["Custom agent"] : []),
    ];
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10 sm:px-6">
          <div className="rise rounded-xl border-2 border-go bg-go-bg p-5 sm:p-6" role="status">
            <p className="font-display text-[26px] font-extrabold leading-tight text-go">Licence requested: {S.name}</p>
            <p className="mt-2 text-[18px]">We&apos;ll confirm your licence and book the process analysis within 2 working days.</p>
            <dl className="mt-5 space-y-1 text-[16px]">
              <div><dt className="inline font-bold">Company: </dt><dd className="inline">{sent.company}</dd></div>
              <div><dt className="inline font-bold">Agents: </dt><dd className="inline">{sentAgents.join(", ")}</dd></div>
              {sent.custom && <div><dt className="inline font-bold">Custom agent: </dt><dd className="inline">{sent.customTask}</dd></div>}
              <div><dt className="inline font-bold">Billing: </dt><dd className="inline tnum">{sent.billing === "yearly" ? `${euro(runningYear)} per year, plus one-off setup` : `≈ ${euro(runningYear / 12)} per month, annual contract, plus one-off setup`}</dd></div>
              <div><dt className="inline font-bold">Start: </dt><dd className="inline">{sent.start}</dd></div>
            </dl>
            <p className="mt-4 text-[14px] text-ink-2">Demo: nothing was sent and no payment was taken.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 font-bold">
            <Link href="/" className="text-signal underline underline-offset-4">Back to the home page</Link>
            <Link href="/start" className="text-signal underline underline-offset-4">Do the free process check</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <h1 className="font-display text-[32px] font-extrabold leading-tight sm:text-[40px]">Request your {P.name} licence</h1>
        <p className="mt-2 max-w-[60ch] text-[17px] text-ink-2">
          An annual licence with your agents and setup by us. This is a demo form: nothing is sent and no payment is taken.
        </p>

        <form onSubmit={submit} className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <fieldset className="rounded-xl border border-line bg-sheet p-5">
              <legend className="sr-only">Plan and billing</legend>
              <p className="font-display text-[20px] font-extrabold" aria-hidden>Plan</p>
              <div role="radiogroup" aria-label="Plan" className="mt-3 flex flex-wrap gap-2">
                {PLAN_ORDER.map((id) => (
                  <button key={id} type="button" role="radio" aria-checked={r.plan === id} onClick={() => choosePlan(id)}
                    className={`rounded-full border-2 px-4 py-2 font-bold transition-colors ${r.plan === id ? "border-ink bg-ink text-white" : "border-ink/20 bg-sheet hover:border-signal"}`}>
                    {PLANS[id].name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[15px] text-ink-2">For {P.forLabel} · {P.agentsLabel} · {P.usersLabel} · {P.support}</p>

              <p className="mt-5 font-display text-[20px] font-extrabold" aria-hidden>Billing</p>
              <div role="radiogroup" aria-label="Billing" className="mt-3 flex flex-wrap gap-2">
                {(["yearly", "monthly"] as const).map((b) => (
                  <button key={b} type="button" role="radio" aria-checked={r.billing === b} onClick={() => set("billing", b)}
                    className={`rounded-full border-2 px-4 py-2 font-bold transition-colors ${r.billing === b ? "border-ink bg-ink text-white" : "border-ink/20 bg-sheet hover:border-signal"}`}>
                    {b === "yearly" ? `Yearly · ${euro(runningYear)}` : `Monthly · ≈ ${euro(runningYear / 12)}`}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[14px] text-ink-2">Same annual contract either way.</p>
            </fieldset>

            <fieldset className="rounded-xl border border-line bg-sheet p-5">
              <legend className="sr-only">Agents</legend>
              <p className="font-display text-[20px] font-extrabold" aria-hidden>Your agents</p>
              <p className="mt-1 text-[15px] text-ink-2">
                {allIncluded ? "Invoice, email and quote agents are included." : `Pick ${P.agents === 1 ? "1 agent" : `${P.agents} agents`}.`}
              </p>
              <ul className="mt-3 space-y-2">
                {STANDARD_AGENTS.map((a) => {
                  const A = AGENTS[a];
                  const on = r.agents.includes(a);
                  const full = !on && P.agents > 1 && r.agents.length >= P.agents;
                  return (
                    <li key={a}>
                      <label className={`flex gap-3 rounded-lg border-2 p-3 ${on ? "border-signal" : "border-ink/15"}`}>
                        <input type={P.agents === 1 ? "radio" : "checkbox"} name="agents" checked={on} disabled={allIncluded || full}
                          onChange={() => toggleAgent(a)} className="mt-1 h-5 w-5 flex-none accent-[var(--signal)]" />
                        <span>
                          <span className="font-bold">{A.name}</span>
                          <span className="block text-[15px] text-ink-2">{A.does}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
                <li>
                  <label className={`flex gap-3 rounded-lg border-2 p-3 ${phoneIncluded || r.phoneAddOn ? "border-signal" : "border-ink/15"}`}>
                    <input type="checkbox" name="phone" checked={phoneIncluded || r.phoneAddOn} disabled={phoneIncluded}
                      onChange={(e) => set("phoneAddOn", e.target.checked)} className="mt-1 h-5 w-5 flex-none accent-[var(--signal)]" />
                    <span>
                      <span className="flex flex-wrap items-center gap-2 font-bold">
                        {AGENTS.phone.name}
                        <span className={`${tag} ${phoneIncluded ? "bg-go-bg text-go" : "bg-ruler text-ink"}`}>
                          {phoneIncluded ? `Included, ${PHONE_ADDON.businessMinutes} min / month` : `Add-on, +${euro(PHONE_ADDON.monthly)} / month`}
                        </span>
                      </span>
                      <span className="block text-[15px] text-ink-2">
                        {AGENTS.phone.does} {phoneIncluded ? "" : `${PHONE_ADDON.minutes} call minutes a month included, then €${PHONE_ADDON.extraMinute.toFixed(2)} a minute.`}
                      </span>
                    </span>
                  </label>
                </li>
                <li>
                  <div className={`rounded-lg border-2 border-dashed p-3 ${r.custom ? "border-signal" : "border-ink/30"}`}>
                    <label className="flex gap-3">
                      <input type="checkbox" name="custom" checked={r.custom}
                        onChange={(e) => set("custom", e.target.checked)} className="mt-1 h-5 w-5 flex-none accent-[var(--signal)]" />
                      <span>
                        <span className="flex flex-wrap items-center gap-2 font-bold">
                          Custom agent
                          <span className={`${tag} border border-ink/30 text-ink`}>From {euro(CUSTOM_AGENT.buildFrom)} + {euro(CUSTOM_AGENT.monthly)} / month</span>
                        </span>
                        <span className="block text-[15px] text-ink-2">
                          We build an agent for a job none of the others does. Fixed price after the process analysis, before you sign.
                        </span>
                      </span>
                    </label>
                    {r.custom && (
                      <div className="mt-3 sm:pl-8">
                        <label htmlFor="customTask" className="block text-[15px] font-bold">What should it do?</label>
                        <textarea id="customTask" name="customTask" required rows={3} value={r.customTask}
                          onChange={(e) => set("customTask", e.target.value)}
                          placeholder="e.g. Order materials from our supplier when a quote is accepted."
                          className="mt-1 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 py-2.5 text-[17px] leading-relaxed focus:border-signal focus:outline-none" />
                      </div>
                    )}
                  </div>
                </li>
              </ul>
              {!agentsOk && <p className="mt-2 text-[15px] font-bold text-no" role="alert">Pick {P.agents} agent{P.agents === 1 ? "" : "s"} to continue.</p>}
            </fieldset>

            <fieldset className="rounded-xl border border-line bg-sheet p-5">
              <legend className="sr-only">Your details</legend>
              <p className="font-display text-[20px] font-extrabold" aria-hidden>Your details</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Input id="company" label="Company" required autoComplete="organization" value={r.company} onChange={(e) => set("company", e.target.value)} />
                <Input id="contact" label="Contact person" required autoComplete="name" value={r.contact} onChange={(e) => set("contact", e.target.value)} />
                <Input id="email" label="Email" type="email" required autoComplete="email" value={r.email} onChange={(e) => set("email", e.target.value)} />
                <Input id="phone" label="Phone" type="tel" required autoComplete="tel" inputMode="tel" value={r.phone} onChange={(e) => set("phone", e.target.value)} />
                <div className="sm:col-span-2">
                  <Input id="street" label="Street and number" required autoComplete="street-address" value={r.street} onChange={(e) => set("street", e.target.value)} />
                </div>
                <Input id="postcode" label="Postcode" required autoComplete="postal-code" inputMode="numeric" value={r.postcode} onChange={(e) => set("postcode", e.target.value)} />
                <Input id="city" label="City" required autoComplete="address-level2" value={r.city} onChange={(e) => set("city", e.target.value)} />
                <Input id="users" label="Number of users" type="number" required min={1} max={P.users ?? undefined}
                  hint={P.users ? `Up to ${P.users} with ${P.name}.` : "Unlimited with Business."}
                  value={r.users} onChange={(e) => set("users", Math.max(1, Number(e.target.value) || 1))} />
                <Input id="start" label="Start date" type="date" required min={today || undefined} value={r.start} onChange={(e) => set("start", e.target.value)} />
              </div>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-line bg-sheet p-5">
              <legend className="sr-only">Agreements</legend>
              <label className="flex items-start gap-3 text-[16px]">
                <input type="checkbox" required checked={r.avv} onChange={(e) => set("avv", e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[var(--signal)]" />
                I accept the data processing agreement (AVV)
              </label>
              <label className="flex items-start gap-3 text-[16px]">
                <input type="checkbox" required checked={r.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[var(--signal)]" />
                I accept the terms
              </label>
            </fieldset>
          </div>

          {/* Summary */}
          <aside className="rounded-xl border-2 border-ink bg-sheet p-5 lg:sticky lg:top-20" aria-label="Summary">
            <p className="font-display text-[20px] font-extrabold">{P.name} licence</p>
            <dl className="mt-3 divide-y divide-line border-y border-line text-[16px]">
              <div className="flex justify-between gap-3 py-2.5"><dt>Licence per year</dt><dd className="font-bold tnum">{euro(P.yearly)}</dd></div>
              {phoneYear > 0 && (
                <div className="flex justify-between gap-3 py-2.5"><dt>Phone agent per year</dt><dd className="font-bold tnum">{euro(phoneYear)}</dd></div>
              )}
              {customYear > 0 && (
                <div className="flex justify-between gap-3 py-2.5"><dt>Custom agent upkeep per year</dt><dd className="font-bold tnum">{euro(customYear)}</dd></div>
              )}
              {r.billing === "monthly" && (
                <div className="flex justify-between gap-3 py-2.5"><dt>Paid monthly</dt><dd className="font-bold tnum">≈ {euro(runningYear / 12)} / month</dd></div>
              )}
              <div className="flex justify-between gap-3 py-2.5"><dt>Setup, one-off</dt><dd className="font-bold tnum">{euro(P.setup)}</dd></div>
              {r.custom && (
                <div className="flex justify-between gap-3 py-2.5"><dt>Custom agent build</dt><dd className="font-bold tnum">from {euro(CUSTOM_AGENT.buildFrom)}</dd></div>
              )}
              <div className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="font-bold">Total first year</dt>
                <dd className="text-right font-poster text-[28px] leading-none tnum">{r.custom && <span className="mr-1 font-display text-[15px] font-bold normal-case">from</span>}{euro(firstYear)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[14px] text-ink-2">Net, plus VAT.</p>
            <button type="submit" className={`${btn("signal", "lg")} mt-5 w-full`}>Request licence</button>
            <p className="mt-3 text-[14px] text-ink-2">{PRICING_NOTES.terms}</p>
          </aside>
        </form>
      </main>
      <Footer />
    </>
  );
}
