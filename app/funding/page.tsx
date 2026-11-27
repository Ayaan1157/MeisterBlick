import type { Metadata } from "next";
import { ButtonLink, Footer, SiteHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Funding for your AI project | MeisterBlick",
  description: "Where the government pays part of your AI project, who qualifies, and how to apply without losing the grant.",
};

// Programme facts as published by the programmes; checked November 2026. Conditions change: always link the official source.
const PROGRAMMES = [
  {
    name: "Digitalbonus Bayern",
    who: "Bavaria, the main one for you",
    kind: "Grant",
    what: "Bavaria pays part of a digital project in a small firm, for example putting an AI agent to work in your office.",
    facts: [
      ["Who", "Small firms with a site in Bavaria: fewer than 50 full-time staff and at most €10 million turnover. Craft trades included."],
      ["How much", "Up to 50% of eligible costs. Standard: up to €7,500. Plus: up to €30,000 for especially innovative projects."],
      ["What counts", "Work by outside providers, including the software needed for the project. Buying standard software or hardware on its own does not count."],
      ["Watch out", "Monthly quotas, and when they're gone you wait for the next month. The programme runs until the end of 2027."],
    ],
    link: { href: "https://www.digitalbonus.bayern", label: "digitalbonus.bayern" },
    main: true,
  },
  {
    name: "BAFA consulting grant",
    who: "All of Germany",
    kind: "Grant",
    what: "The federal government pays part of an independent consultant's fee, for example for the process analysis before you choose your agents.",
    facts: [
      ["How much", "In western Germany including Bavaria, 50% of up to €3,500 consulting costs."],
      ["Watch out", "The current round takes applications until 31 December 2026. Check bafa.de for the follow-up rules."],
    ],
    link: { href: "https://www.bafa.de", label: "bafa.de" },
  },
  {
    name: "KfW digitalisation loan",
    who: "All of Germany",
    kind: "Low-interest loan",
    what: "Not free money, but a cheap loan for bigger digital projects, applied for through your own bank.",
    facts: [["Good for", "Larger projects you'd rather pay off over several years than all at once."]],
    link: { href: "https://www.kfw.de", label: "kfw.de" },
  },
  {
    name: "Mittelstand-Digital Zentren",
    who: "All of Germany",
    kind: "Free advice",
    what: "Government-funded, vendor-neutral centres that show small firms what AI can do, in workshops and short projects. No cost.",
    facts: [["Watch out", "The current centres are funded until the end of 2026; a new network is planned for 2027."]],
    link: { href: "https://www.mittelstand-digital.de", label: "mittelstand-digital.de" },
  },
];

const STEPS = [
  { t: "Check you qualify", d: "Site in Bavaria, fewer than 50 staff, at most €10 million turnover. Outside Bavaria, start with the BAFA consulting grant and your state's own programme." },
  { t: "Plan the project first", d: "Do the free process check and get a written offer that lists the one-off work (process analysis, setup) separately from the yearly licence. That split is what the application needs." },
  { t: "Apply before you sign anything", d: "Apply online at digitalbonus.bayern with your ELSTER business account, at the start of a monthly quota. You file it yourself: a provider may not use your account." },
  { t: "Start once the receipt is confirmed", d: "As soon as you get the confirmation that your application arrived, you may place the order. Signing earlier counts as an early start and loses the grant." },
  { t: "Finish, send proof, get paid", d: "After the project, send the invoices and a short report. The district government checks them and pays the grant." },
];

export default function FundingPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full">
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
          <h1 className="font-poster text-[44px] leading-[0.95] text-balance sm:text-[76px]">Let the state pay part of it</h1>
          <p className="mt-5 max-w-2xl text-[19px] text-ink-2">
            Small craft firms can get part of an AI project funded. Here is who pays, what counts, and the one mistake that loses the grant.
          </p>
          <p className="mt-3 text-[14px] text-ink-2">Checked November 2026. Programmes change; the official pages linked below always have the final word.</p>
        </section>

        {/* The one rule */}
        <section className="bg-ink text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:gap-10 sm:px-6">
            <p className="font-poster text-[32px] leading-none text-ruler sm:w-72 sm:flex-none sm:text-[40px]">Apply first, sign second</p>
            <p className="max-w-2xl text-[18px] text-white/85">
              A grant is lost once you have placed an order or signed a contract before applying. Plan with us, apply, wait for the receipt confirmation, then sign. We time your licence start around it.
            </p>
          </div>
        </section>

        {/* Programmes */}
        <section aria-labelledby="prog-h" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 id="prog-h" className="font-poster text-[36px] sm:text-[48px]">Where the money comes from</h2>
          <ul className="mt-10 grid gap-5 lg:grid-cols-2">
            {PROGRAMMES.map((p) => (
              <li key={p.name} className={`flex flex-col rounded-2xl bg-sheet p-5 sm:p-7 ${p.main ? "border-2 border-ink lg:col-span-2" : "border border-line"}`}>
                <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold">
                  <span className={`rounded-full px-3 py-1 ${p.main ? "bg-ruler text-ink" : "border border-line text-ink-2"}`}>{p.kind}</span>
                  <span className="text-ink-2">{p.who}</span>
                </p>
                <h3 className="mt-3 font-display text-[26px] font-extrabold leading-tight">{p.name}</h3>
                <p className="mt-2 max-w-2xl text-[17px]">{p.what}</p>
                <dl className={`mt-5 divide-y divide-line border-y border-line text-[16px] ${p.main ? "lg:grid lg:grid-cols-2 lg:gap-x-8 lg:divide-y-0" : ""}`}>
                  {p.facts.map(([k, v]) => (
                    <div key={k} className={`grid gap-1 py-3 sm:grid-cols-[110px_1fr] sm:gap-4 ${p.main ? "lg:border-b lg:border-line" : ""}`}>
                      <dt className="font-bold">{k}</dt>
                      <dd className="text-ink-2">{v}</dd>
                    </div>
                  ))}
                </dl>
                <a href={p.link.href} target="_blank" rel="noopener noreferrer" className="mt-5 self-start font-bold underline decoration-2 underline-offset-4 hover:decoration-signal">
                  Official page: {p.link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-[15px] text-ink-2">
            Not in Bavaria? Most states run their own programmes. The federal funding database lists them all:{" "}
            <a href="https://www.foerderdatenbank.de" target="_blank" rel="noopener noreferrer" className="font-bold text-ink underline underline-offset-4">foerderdatenbank.de</a>.
          </p>
        </section>

        {/* What counts with us */}
        <section aria-labelledby="us-h" className="border-y border-line bg-sheet">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
            <h2 id="us-h" className="font-poster text-[36px] sm:text-[48px]">What counts with MeisterBlick</h2>
            <ul className="space-y-4 text-[17px]">
              <li className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-go" /><span><b>Likely to count:</b> the process analysis, setting up your agents and connecting them to your office, as work by an outside provider.</span></li>
              <li className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-later" /><span><b>Usually doesn&apos;t count:</b> the yearly licence on its own, because the programme doesn&apos;t fund buying standard software.</span></li>
              <li className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-signal" /><span><b>What we do:</b> write the offer so the eligible part is clear, and give you the project description for the form. You file the application yourself, and the district government decides. We don&apos;t promise an amount.</span></li>
            </ul>
          </div>
        </section>

        {/* Steps */}
        <section aria-labelledby="steps-h" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 id="steps-h" className="font-poster text-[36px] sm:text-[48px]">How to get it, step by step</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-5 md:gap-0">
            {STEPS.map((s, i) => (
              <li key={s.t} className="md:border-l-2 md:border-ink md:pl-5 md:pr-6">
                <span className="font-poster text-[56px] leading-none text-signal tnum">{i + 1}</span>
                <h3 className="mt-2 font-display text-[20px] font-extrabold leading-tight">{s.t}</h3>
                <p className="mt-2 text-[16px] text-ink-2">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href="/start" variant="signal" size="lg">Start the free process check</ButtonLink>
            <ButtonLink href="/#pricing" variant="secondary" size="lg">See the licences</ButtonLink>
          </div>
          <p className="mt-4 text-[14px] text-ink-2">This page explains public programmes in plain words. It is not legal or tax advice.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
