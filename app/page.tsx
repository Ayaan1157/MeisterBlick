import { ClosingBand } from "@/components/ClosingBand";
import { ExampleFile } from "@/components/ExampleFile";
import { HomeHero } from "@/components/HomeHero";
import { HowItWorks } from "@/components/HowItWorks";
import { DrawLine } from "@/components/motion/DrawLine";
import { OpeningBand } from "@/components/motion/OpeningBand";
import { ScrollHeading } from "@/components/motion/ScrollHeading";
import { QuickEstimate } from "@/components/QuickEstimate";
import { ButtonLink, Footer } from "@/components/ui";

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
            <ScrollHeading id="quick-h" className="font-poster text-[40px] sm:text-[60px]">Try it in ten seconds</ScrollHeading>
            <p className="mt-4 max-w-xl text-[19px] text-ink-2">Move the sliders. The same rules and maths as the full check, with typical numbers for your trade.</p>
            <div className="mt-12">
              <QuickEstimate />
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Example results file */}
        <section id="example" aria-labelledby="example-h" className="scroll-mt-4 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
            <ScrollHeading id="example-h" className="font-poster text-[40px] sm:text-[60px]">What you get</ScrollHeading>
            <p className="mt-4 max-w-xl text-[19px] text-ink-2">
              Thomas runs a painting business with 14 people. This is his results file. Open it, then tap a sheet for the detail.
            </p>
          </div>
          <div className="mt-12">
            <OpeningBand settle=".ffl-rig">
              <ExampleFile />
            </OpeningBand>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" aria-labelledby="pricing-h" className="scroll-mt-4">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <ScrollHeading id="pricing-h" className="font-poster text-[40px] sm:text-[60px]">Pricing</ScrollHeading>
            <p className="mt-4 max-w-xl text-[19px] text-ink-2">Start free. Pay only when you want help doing it.</p>
            <DrawLine className="mt-12 h-px bg-ink" />
            <ul>
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

        <ClosingBand />
      </main>
      <Footer />
    </>
  );
}
