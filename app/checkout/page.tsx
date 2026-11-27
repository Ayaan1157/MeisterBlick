"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader, Footer } from "@/components/ui";
import { LiquidCheckout } from "@/components/ui/liquid-glass-checkout";
import { useCheckState } from "@/lib/store";

type PlanId = "pilot-report" | "starter-build" | "ai-coach";

const PLANS: Record<PlanId, { name: string; today: number; terms: string; items: string[]; next: string }> = {
  "pilot-report": {
    name: "Pilot Report",
    today: 490,
    terms: "€490 one-off",
    items: ["1-hour call with an implementation expert", "Detailed 2-week pilot plan for your top use case", "Vendor shortlist with prices", "Help with the Digitalbonus Bayern application"],
    next: "We call you within one working day to book the 1-hour call.",
  },
  "starter-build": {
    name: "Starter Build",
    today: 499,
    terms: "€499 setup today, then €49 / month",
    items: ["Ready-made template for your trade", "e.g. phone and callback assistant", "Set up with your own texts and prices", "Live within a week, cancel monthly"],
    next: "We call you within one working day to start the setup.",
  },
  "ai-coach": {
    name: "AI Coach",
    today: 99,
    terms: "€99 / month, cancel monthly",
    items: ["Ongoing support by phone and email", "Quarterly re-check of your top 3", "ROI tracking against your real numbers"],
    next: "We call you within one working day for your first coaching session.",
  },
};
const ORDER: PlanId[] = ["pilot-report", "starter-build", "ai-coach"];

export default function CheckoutPage() {
  const { state } = useCheckState();
  const [plan, setPlan] = useState<PlanId>("pilot-report");
  const [paid, setPaid] = useState<PlanId | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan") as PlanId | null;
    if (p && p in PLANS) setPlan(p);
  }, []);

  const choose = (p: PlanId) => {
    setPlan(p);
    setPaid(null);
    window.history.replaceState(null, "", `/checkout?plan=${p}`);
  };

  const P = PLANS[plan];
  const company = state?.profile?.name || state?.lead?.companyName;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-16 pt-6 sm:pt-10">
        <h1 className="font-display text-[32px] font-extrabold leading-tight sm:text-[40px]">Book {P.name}</h1>
        <p className="mt-2 max-w-[60ch] text-[17px] text-ink-2">
          {company ? <>For <b className="text-ink">{company}</b>. </> : null}
          This is a demo checkout. No money is charged and no card details leave your browser.
        </p>

        <div role="radiogroup" aria-label="Choose a plan" className="mt-5 flex flex-wrap gap-2">
          {ORDER.map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={plan === id}
              onClick={() => choose(id)}
              className={`rounded-full border-2 px-4 py-2 font-bold transition-colors ${plan === id ? "border-ink bg-ink text-white" : "border-ink/20 bg-sheet hover:border-blue"}`}
            >
              {PLANS[id].name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6">
          <section className="rounded-xl border border-line bg-sheet p-5">
            <h2 className="font-display text-[20px] font-extrabold">{P.name}</h2>
            <p className="mt-1 font-bold tnum">{P.terms}</p>
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-[16px] sm:grid-cols-2">
              {P.items.map((i) => (
                <li key={i} className="flex gap-2"><span aria-hidden className="mt-[9px] h-2 w-2 flex-none rounded-full bg-go" />{i}</li>
              ))}
            </ul>
            <div className="mt-4 border-t border-line pt-3 text-[15px] text-ink-2">
              <p>Test card: <b className="tnum text-ink">4242 4242 4242 4242</b>, any future date, any CVC.</p>
            </div>
          </section>

          <section
            className="relative overflow-hidden rounded-xl px-3 py-8 sm:px-6 sm:py-10"
            style={{ background: "radial-gradient(120% 90% at 15% 10%, #ffffff 0%, #eef0ee 48%, #d6e0e9 100%)" }}
          >
            <LiquidCheckout
              key={plan}
              amount={P.today}
              currency="EUR"
              locale="en-IE"
              merchant="MeisterBlick"
              issuer="MeisterBlick"
              resetAfter={0}
              cards={[
                { id: "sky", label: "Business Visa", theme: "sky", brand: "VISA", last4: "4242", holder: "Thomas Becker", expiry: "09/29" },
                { id: "glass", label: "Mastercard", theme: "glass", brand: "Mastercard", last4: "4444", holder: "Thomas Becker", expiry: "12/28" },
                { id: "deep", label: "Amex", theme: "deep", brand: "AMEX", last4: "0005", holder: "Thomas Becker", expiry: "01/30" },
              ]}
              onPay={async () => {
                // Demo only: nothing is sent anywhere.
                await new Promise((r) => setTimeout(r, 1400));
                setPaid(plan);
              }}
              note="Demo checkout · no money is charged"
            />
          </section>
        </div>

        {paid && (
          <div className="rise mt-6 rounded-xl border-2 border-go bg-go-bg p-5" role="status">
            <p className="font-display text-[20px] font-extrabold text-go">Booked: {PLANS[paid].name}</p>
            <p className="mt-1 text-[17px]">{PLANS[paid].next} (Demo: no payment was taken.)</p>
            <div className="mt-3 flex flex-wrap gap-4 font-bold">
              <Link href="/results" className="text-blue underline underline-offset-4">Back to your results</Link>
              <Link href="/report" className="text-blue underline underline-offset-4">Download pilot report</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
