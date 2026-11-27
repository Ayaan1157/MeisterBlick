"use client";
import Link from "next/link";
import { useState } from "react";
import { SiteAssistant, WhatsAppNote, type CallbackRequest } from "@/components/SiteAssistant";
import { SiteHeader } from "@/components/ui";
import * as becker from "@/data/demos/becker";
import { useCheckState } from "@/lib/store";

const SUGGEST: Record<string, string[]> = {
  bakery: ["When are you open on Sunday?", "How early do I need to order a birthday cake?", "Are your rolls nut-free?", "Do you deliver?"],
  default: ["Do you come to Bad Kissingen?", "When is your office open?", "How do I get a quote?", "What does painting a 20 m² room cost?"],
};

export default function DemoPage() {
  const { state } = useCheckState();
  const [sent, setSent] = useState<CallbackRequest | null>(null);

  const usingOwn = !!state?.siteText;
  const siteText = state?.siteText || becker.siteText;
  const company = (usingOwn ? state?.profile?.name : null) || (usingOwn ? state?.lead?.companyName : null) || becker.profile.name;
  const services = (usingOwn ? state?.profile?.services : becker.profile.services) ?? [];
  const domain = (usingOwn ? state?.lead?.website : becker.lead.website) || "your-website.de";
  const suggestions = state?.exampleId === "bakery" && usingOwn ? SUGGEST.bakery : SUGGEST.default;

  return (
    <>
      <SiteHeader right={<Link href="/results" className="font-bold text-signal underline underline-offset-4">Back to results</Link>} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <h1 className="font-display text-[30px] font-extrabold leading-tight">Your demo assistant</h1>
        <p className="mt-1 max-w-2xl text-ink-2">
          This is how it would look on {usingOwn ? "your" : "a"} website. It answers only from {usingOwn ? "your website text" : `${company}'s website (example; you didn't enter a website)`}. If it doesn't know, it says so and takes a callback request.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* fake website */}
          <div className="overflow-hidden rounded-xl border border-line bg-sheet shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 border-b border-line bg-plaster px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-line" /><span className="h-3 w-3 rounded-full bg-line" /><span className="h-3 w-3 rounded-full bg-line" />
              <span className="ml-2 truncate rounded bg-sheet px-3 py-0.5 text-[14px] text-ink-2">{domain}</span>
            </div>
            <div className="p-6 sm:p-10">
              <p className="font-serif text-[15px] uppercase tracking-wide text-ink-2">{usingOwn ? state?.profile?.industry : becker.profile.industry}</p>
              <h2 className="mt-1 font-serif text-[36px] font-bold leading-tight">{company}</h2>
              <p className="mt-3 max-w-md text-ink-2">{(usingOwn ? state?.profile?.areas : becker.profile.areas) || ""}</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {services.slice(0, 6).map((s) => <li key={s} className="rounded border border-line px-3 py-2 text-[16px]">{s}</li>)}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
                <span className="rounded bg-ink px-4 py-2.5 font-serif text-[16px] text-white">Request a quote</span>
                <span className="font-serif text-[16px] text-ink-2">Office hours by phone. Outside them, the assistant on the right takes your request.</span>
              </div>
            </div>
          </div>

          <SiteAssistant siteText={siteText} company={company} suggestions={suggestions} rulesOnly={!!state?.demoMode} onCallback={setSent} />
        </div>

        {sent && (
          <section className="rise mt-8 max-w-xl">
            <h2 className="font-display text-[22px] font-extrabold">What the owner gets on WhatsApp, on site</h2>
            <div className="mt-3"><WhatsAppNote company={company} sent={sent} /></div>
            <p className="mt-3 font-bold">No more missed calls: every request lands in one place.</p>
          </section>
        )}
      </main>
    </>
  );
}
