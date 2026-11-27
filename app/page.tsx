import { ExampleFile } from "@/components/ExampleFile";
import { HomeHero } from "@/components/HomeHero";
import { QuickEstimate } from "@/components/QuickEstimate";
import { ButtonLink, Footer } from "@/components/ui";

const steps = [
  { t: "Tell us about the business", d: "Trade, team size, what eats your week. Two minutes, on your phone." },
  { t: "Answer five short questions", d: "“How many calls do you miss a day?” Tap an answer; no typing needed." },
  { t: "Get your answers", d: "What to do now, what can wait, what to skip, and a 2-week test plan you can start Monday." },
];

const pricing = [
  { name: "Quick Check", price: "Free", note: "", items: "Your top 3 with euros and payback, a 1-page report, your own demo assistant", cta: "Start free", href: "/start", main: true },
  { name: "Pilot Report", price: "€490", note: "one-off", items: "1-hour call, detailed pilot plan, vendor shortlist, help with the funding application", cta: "Book", href: "/checkout?plan=pilot-report" },
  { name: "Starter Build", price: "€499", note: "setup, then €49 / month", items: "A ready-made template for your trade, e.g. the callback assistant, live within a week", cta: "Book", href: "/checkout?plan=starter-build" },
  { name: "AI Coach", price: "€99", note: "per month", items: "Ongoing support, a re-check every quarter, savings tracked against real numbers", cta: "Book", href: "/checkout?plan=ai-coach" },
];

export default function Home() {
  return (
    <>
      <main>
        <HomeHero />

        {/* Ten-second estimate */}
        <section id="quick" aria-labelledby="quick-h" className="scroll-mt-4">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <h2 id="quick-h" className="font-poster text-[48px] sm:text-[72px]">Try it in ten seconds</h2>
            <p className="mt-4 max-w-xl text-[19px] text-ink-2">Move the sliders. The same rules and maths as the full check, with typical numbers for your trade.</p>
            <div className="mt-12">
              <QuickEstimate />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-h" className="scroll-mt-4 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <h2 id="how-h" className="font-poster text-[48px] sm:text-[72px]">Ten minutes, start to end</h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.t}>
                  <span className="font-poster text-[64px] text-signal tnum">{i + 1}</span>
                  <h3 className="mt-3 font-display text-[22px] font-extrabold">{s.t}</h3>
                  <p className="mt-2 text-ink-2">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Example results file */}
        <section id="example" aria-labelledby="example-h" className="scroll-mt-4 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
            <h2 id="example-h" className="font-poster text-[48px] sm:text-[72px]">What you get</h2>
            <p className="mt-4 max-w-xl text-[19px] text-ink-2">
              Thomas runs a painting business with 14 people. This is his results file. Open it, then tap a sheet for the detail.
            </p>
          </div>
          <div className="mt-12">
            <ExampleFile />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" aria-labelledby="pricing-h" className="scroll-mt-4">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <h2 id="pricing-h" className="font-poster text-[48px] sm:text-[72px]">Pricing</h2>
            <p className="mt-4 max-w-xl text-[19px] text-ink-2">Start free. Pay only when you want help doing it.</p>
            <ul className="mt-12 border-t border-ink">
              {pricing.map((p) => (
                <li key={p.name} className="grid items-center gap-x-8 gap-y-3 border-b border-line py-6 sm:grid-cols-[180px_160px_1fr_auto]">
                  <h3 className="font-display text-[22px] font-extrabold">{p.name}</h3>
                  <p>
                    <span className="font-poster text-[34px] tnum">{p.price}</span>
                    {p.note && <span className="block text-[14px] text-ink-2">{p.note}</span>}
                  </p>
                  <p className="text-ink-2">{p.items}</p>
                  <ButtonLink href={p.href} variant={p.main ? "signal" : "secondary"} className="whitespace-nowrap sm:min-w-32">{p.cta}</ButtonLink>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-[15px] text-ink-2">
              Or pay from savings: 30% of measured savings for the first 6 months, no savings, no fee. Implementation goes through vetted partners who pay us a disclosed commission. “Not worth it” earns us nothing, and we say it anyway.
            </p>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-signal">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="font-poster text-[56px] sm:text-[96px]">Ten minutes.<br />One honest number.</h2>
            <ButtonLink href="/start" size="lg">Start free check</ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
