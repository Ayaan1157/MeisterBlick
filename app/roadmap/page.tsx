import type { Metadata } from "next";
import { ButtonLink, Footer, SiteHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Roadmap | MeisterBlick",
  description: "This site is the MeisterBlick prototype. Here is what works today, and what we build next, phase by phase.",
};

// Edit the phases here. `now: true` marks the current one.
const PHASES = [
  {
    name: "Prototype",
    when: "Now · November 2026",
    goal: "Show the whole journey in one place, from the first question to the signed licence.",
    items: [
      "Free process check with scoring rules for five trades",
      "Website scan that reads a real site and finds what AI can do for it",
      "Demo assistant that answers only from a firm's own website",
      "Results file, 1-page PDF report and licence recommendation",
      "Pricing, licence request and funding guide",
    ],
    proof: "Judges and first craft firms can try it end to end in ten minutes.",
    now: true,
  },
  {
    name: "Pilot",
    when: "January – March 2027",
    goal: "Prove the estimates with real firms, real agents and real numbers.",
    items: [
      "5 to 10 craft firms in Lower Franconia as pilot customers",
      "Real invoice, email, quote and phone agents connected to their office",
      "Measure the hours each firm actually saves, against what the check promised",
      "Contracts, data processing agreement and EU hosting in place",
      "First Digitalbonus Bayern applications filed by pilot firms",
    ],
    proof: "Measured savings within 20% of the estimate, and most pilots want to keep their agents.",
  },
  {
    name: "Launch in Bavaria",
    when: "April – September 2027",
    goal: "Turn the pilot into a product firms can buy and run without us in the room.",
    items: [
      "Online contracts and payment instead of the demo forms",
      "Connections to the tools firms already use: Outlook, Gmail, WhatsApp Business, DATEV, Lexware",
      "A monthly report for the owner: hours saved, calls caught, invoices chased",
      "Partnerships with chambers of crafts and Mittelstand-Digital centres",
    ],
    proof: "100 paying firms, and the check sends us customers without cold calls.",
  },
  {
    name: "Across Germany",
    when: "2028",
    goal: "Reach every region with local setup and every state's funding.",
    items: [
      "Funding check for each state's programme, not only Bavaria",
      "Setup partners: local IT firms that install and support our agents",
      "More trades: roofers, heating engineers, car workshops, cleaning firms",
      "Agents that learn each firm's own templates, prices and wording",
    ],
    proof: "1,000 firms across Germany, with setup done mostly by partners.",
  },
  {
    name: "Beyond Germany",
    when: "From 2029",
    goal: "Take what works for German craft firms to their neighbours, then further.",
    items: [
      "Austria and Switzerland first: same language, similar trades",
      "Then English-speaking markets, with the check and agents in English",
      "Local funding guides and data rules for each country",
    ],
    proof: "The first firms outside Germany run on MeisterBlick agents.",
  },
];

const REAL = [
  "The check's questions, scoring and payback maths",
  "The website scan: it reads public sites live",
  "The demo assistant, answering from the scanned site",
  "The licence recommendation and all prices",
];
const SIMULATED = [
  "Licence requests and contact messages are not sent anywhere",
  "No payment is taken",
  "The agents are not yet connected to real inboxes or phone lines",
  "Becker Bauservice is a fictional example firm",
  "All savings are estimates from typical numbers per trade",
];

export default function RoadmapPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full">
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
          <h1 className="font-poster text-[44px] leading-[0.95] text-balance sm:text-[76px]">What comes next</h1>
          <p className="mt-5 max-w-2xl text-[19px] text-ink-2">
            You&apos;re looking at the MeisterBlick prototype. It shows the whole journey, from the free check to the licence. Here is what we build next, phase by phase.
          </p>
        </section>

        {/* The honest band */}
        <section className="bg-ink text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:gap-10 sm:px-6">
            <p className="font-poster text-[32px] leading-none text-ruler sm:w-72 sm:flex-none sm:text-[40px]">This is the prototype</p>
            <p className="max-w-2xl text-[18px] text-white/85">
              Everything you can click works, and the maths is real. What it doesn&apos;t do yet is send, charge or connect to a real office. That is what the pilot is for.
            </p>
          </div>
        </section>

        {/* Real vs simulated */}
        <section aria-labelledby="today-h" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 id="today-h" className="font-poster text-[36px] sm:text-[48px]">What works today</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-sheet p-5 sm:p-7">
              <h3 className="font-display text-[22px] font-extrabold">Working in the prototype</h3>
              <ul className="mt-4 space-y-3 text-[17px]">
                {REAL.map((t) => (
                  <li key={t} className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-go" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-dashed border-ink/40 bg-plaster p-5 sm:p-7">
              <h3 className="font-display text-[22px] font-extrabold">Shown, not live yet</h3>
              <ul className="mt-4 space-y-3 text-[17px]">
                {SIMULATED.map((t) => (
                  <li key={t} className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-later" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Phases */}
        <section aria-labelledby="phases-h" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 id="phases-h" className="font-poster text-[36px] sm:text-[48px]">Five phases</h2>
            <ol className="mt-10 space-y-6">
              {PHASES.map((p, i) => (
                <li key={p.name} className="grid gap-4 md:grid-cols-[200px_1fr] md:gap-8">
                  <div className="flex items-baseline gap-4 md:block">
                    <span className={`font-poster text-[64px] leading-none tnum ${p.now ? "text-signal" : "text-ink/30"}`}>{i + 1}</span>
                    <p className="text-[15px] font-bold text-ink-2 md:mt-2">{p.when}</p>
                  </div>
                  <div className={`rounded-2xl bg-sheet p-5 sm:p-7 ${p.now ? "relative border-2 border-ink" : "border border-line"}`}>
                    {p.now && <span className="absolute -top-3.5 left-5 rounded-full bg-ruler px-3 py-1 text-[13px] font-bold text-ink">You are here</span>}
                    <h3 className="font-display text-[26px] font-extrabold leading-tight">{p.name}</h3>
                    <p className="mt-1 text-[18px]">{p.goal}</p>
                    <ul className="mt-4 space-y-2 text-[16px]">
                      {p.items.map((t) => (
                        <li key={t} className="flex gap-3">
                          <span aria-hidden className={`mt-[9px] h-2 w-2 flex-none rounded-full ${p.now ? "bg-go" : "bg-ink/40"}`} />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 border-t border-line pt-4 text-[16px]">
                      <b>{p.now ? "Done when: " : "We know it worked when: "}</b>
                      <span className="text-ink-2">{p.proof}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-line bg-sheet">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-poster text-[32px] leading-none sm:text-[40px]">Be one of the pilot firms</h2>
              <p className="mt-3 text-[17px] text-ink-2">
                We&apos;re looking for craft firms that want to test real agents in early 2027 and tell us honestly what works.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink href="/contact?topic=pilot" variant="signal" size="lg">Apply as a pilot firm</ButtonLink>
              <ButtonLink href="/start" variant="secondary" size="lg">Try the free check</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
