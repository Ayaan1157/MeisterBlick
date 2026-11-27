"use client";
import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui";
import { gsap, MOTION_OK } from "@/lib/gsap";

/** The last band, spruce with an ochre button: its two lines slide in from opposite sides as you reach it. */
export function ClosingBand() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const [a, b] = el.querySelectorAll<HTMLElement>("[data-line]");
      const scrollTrigger = { trigger: el, start: "top bottom", end: "top 30%", scrub: 0.6 };
      gsap.fromTo(a, { xPercent: -45 }, { xPercent: 0, ease: "none", scrollTrigger });
      gsap.fromTo(b, { xPercent: 45 }, { xPercent: 0, ease: "none", scrollTrigger });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="overflow-hidden bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 px-4 py-20 sm:px-6 sm:py-28">
        <h2 className="font-poster text-[44px] sm:text-[76px]">
          <span data-line className="block">Ten minutes.</span>
          <span data-line className="block">One honest number.</span>
        </h2>
        <ButtonLink href="/start" size="lg" variant="ruler">Start free check</ButtonLink>
      </div>
    </section>
  );
}
