"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer, SiteHeader, btn } from "@/components/ui";
import { AGENTS, AGENT_ORDER, PLANS, PLAN_ORDER, PRICING_NOTES, euro, perMonth, type AgentId, type PlanId } from "@/lib/pricing";
import { useCheckState } from "@/lib/store";

const STORE = "meisterblick:licence-requests";
const field = "mt-1 h-12 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[17px] focus:border-signal focus:outline-none";

/** Agents a plan starts with: Business gets all, the others the first ones that fit. */
const defaultAgents = (plan: PlanId): AgentId[] =>
  plan === "business" ? [...AGENT_ORDER] : AGENT_ORDER.filter((a) => !AGENTS[a].businessOnly).slice(0, PLANS[plan].agents);

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
  avv: boolean; terms: boolean;
};

export default function CheckoutPage() {
  const { state } = useCheckState();
  const [r, setR] = useState<Request>({
    plan: "professional", billing: "yearly", company: "", contact: "", email: "", phone: "",
    street: "", postcode: "", city: "", users: 5, start: "", agents: defaultAgents("professional"), avv: false, terms: false,
  });
  const [today, setToday] = useState("");
  const [sent, setSent] = useState<Request | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan") as PlanId | null;
    if (p && p in PLANS) setR((x) => ({ ...x, plan: p, agents: defaultAgents(p), users: Math.min(x.users, PLANS[p].users ?? x.users) }));
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
      if (x.plan === "business" || AGENTS[a].businessOnly) return x;
      if (PLANS[x.plan].agents === 1) return { ...x, agents: [a] };
      return { ...x, agents: x.agents.includes(a) ? x.agents.filter((y) => y !== a) : [...x.agents, a] };
    });

  const P = PLANS[r.plan];
  const firstYear = P.yearly + P.setup;
  const agentsOk = r.agents.length === Math.min(P.agents, AGENT_ORDER.length);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agentsOk) return;
    // Demo only: nothing is sent anywhere and no payment is taken. Kept in this browser for the demo.
    try {
      const prev = JSON.parse(localStorage.getItem(STORE) || "[]");
      localStorage.setItem(STORE, JSON.stringify([...prev, { ...r, at: new Date().toISOString() }]));
    } catch {}
    console.info("[licence request]", r);
    setSent(r);
    window.scrollTo({ top: 0 });
  }

  if (sent) {
    const S = PLANS[sent.plan];
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10 sm:px-6">
          <div className="rise rounded-xl border-2 border-go bg-go-bg p-5 sm:p-6" role="status">
            <p className="font-display text-[26px] font-extrabold leading-tight text-go">Licence requested: {S.name}</p>
            <p className="mt-2 text-[18px]">We&apos;ll confirm your licence and book the process analysis within 2 working days.</p>
            <dl className="mt-5 space-y-1 text-[16px]">
              <div><dt className="inline font-bold">Company: </dt><dd className="inline">{sent.company}</dd></div>
              <div><dt className="inline font-bold">Agents: </dt><dd className="inline">{sent.agents.map((a) => AGENTS[a].name).join(", ")}</dd></div>
              <div><dt className="inline font-bold">Billing: </dt><dd className="inline tnum">{sent.billing === "yearly" ? `${euro(S.yearly)} per year` : `≈ ${euro(perMonth(S))} per month, annual contract`}</dd></div>
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
              <p className="mt-3 text-[15px] text-ink-2">{P.agentsLabel} · {P.usersLabel} · {P.support}</p>

              <p className="mt-5 font-display text-[20px] font-extrabold" aria-hidden>Billing</p>
              <div role="radiogroup" aria-label="Billing" className="mt-3 flex flex-wrap gap-2">
                {(["yearly", "monthly"] as const).map((b) => (
                  <button key={b} type="button" role="radio" aria-checked={r.billing === b} onClick={() => set("billing", b)}
                    className={`rounded-full border-2 px-4 py-2 font-bold transition-colors ${r.billing === b ? "border-ink bg-ink text-white" : "border-ink/20 bg-sheet hover:border-signal"}`}>
                    {b === "yearly" ? `Yearly · ${euro(P.yearly)}` : `Monthly · ≈ ${euro(perMonth(P))}`}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[14px] text-ink-2">Same annual contract either way.</p>
            </fieldset>

            <fieldset className="rounded-xl border border-line bg-sheet p-5">
              <legend className="sr-only">Agents</legend>
              <p className="font-display text-[20px] font-extrabold" aria-hidden>Your agents</p>
              <p className="mt-1 text-[15px] text-ink-2">
                {r.plan === "business" ? "All agents are included." : `Pick ${P.agents === 1 ? "1 agent" : `${P.agents} agents`}.`}
              </p>
              <ul className="mt-3 space-y-2">
                {AGENT_ORDER.map((a) => {
                  const A = AGENTS[a];
                  const locked = r.plan === "business" || !!A.businessOnly;
                  const on = r.agents.includes(a);
                  const full = !on && P.agents > 1 && r.agents.length >= P.agents;
                  return (
                    <li key={a}>
                      <label className={`flex gap-3 rounded-lg border-2 p-3 ${on ? "border-signal" : "border-ink/15"} ${locked && !on ? "opacity-60" : ""}`}>
                        <input type={P.agents === 1 && r.plan !== "business" ? "radio" : "checkbox"} name="agents" checked={on} disabled={locked || full}
                          onChange={() => toggleAgent(a)} className="mt-1 h-5 w-5 flex-none accent-[var(--signal)]" />
                        <span>
                          <span className="flex flex-wrap items-center gap-2 font-bold">
                            {A.name}
                            {A.businessOnly && <span className="rounded-full bg-ruler px-2 py-0.5 text-[12px] font-bold text-ink">Business licence only</span>}
                          </span>
                          <span className="block text-[15px] text-ink-2">{A.does}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
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
              {r.billing === "monthly" && (
                <div className="flex justify-between gap-3 py-2.5"><dt>Paid monthly</dt><dd className="font-bold tnum">≈ {euro(perMonth(P))} / month</dd></div>
              )}
              <div className="flex justify-between gap-3 py-2.5"><dt>Setup fee</dt><dd className="font-bold tnum">{P.setup ? euro(P.setup) : "Included"}</dd></div>
              <div className="flex justify-between gap-3 py-2.5"><dt className="font-bold">Total first year</dt><dd className="font-poster text-[28px] leading-none tnum">{euro(firstYear)}</dd></div>
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
