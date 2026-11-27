import { ClosingBand } from "@/components/ClosingBand";
import { ExampleFile } from "@/components/ExampleFile";
import { HomeHero } from "@/components/HomeHero";
import { HowItWorks } from "@/components/HowItWorks";
import { DrawLine } from "@/components/motion/DrawLine";
import { OpeningBand } from "@/components/motion/OpeningBand";
import { ScrollHeading } from "@/components/motion/ScrollHeading";
import { QuickEstimate } from "@/components/QuickEstimate";
import { LicenceNote } from "@/components/LicenceNote";
import { PricingCards } from "@/components/Pricing";
import { Footer } from "@/components/ui";
import { EXAMPLE_LICENCE } from "@/lib/pricing";

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
          <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
            <LicenceNote rec={EXAMPLE_LICENCE} className="max-w-xl" />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" aria-labelledby="pricing-h" className="scroll-mt-4">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <ScrollHeading id="pricing-h" className="font-poster text-[40px] text-balance sm:text-[60px]">One yearly licence. Agents included. Setup by us.</ScrollHeading>
            <DrawLine className="mt-12 h-px bg-ink" />
            <PricingCards />
          </div>
        </section>

        <ClosingBand />
      </main>
      <Footer />
    </>
  );
}
