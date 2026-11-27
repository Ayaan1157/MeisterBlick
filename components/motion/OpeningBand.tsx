"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

/**
 * A full-width band that opens from an inset card to the full width as it scrolls in,
 * while what sits on it (the target selector) settles from a tilt.
 */
export function OpeningBand({ children, settle }: { children: ReactNode; settle?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const scroll = { trigger: el, start: "top 98%", end: "top 20%", scrub: 0.6 };
      gsap.fromTo(
        el,
        { clipPath: "inset(0% 6% 0% 6% round 32px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: scroll },
      );
      const target = settle ? el.querySelector(settle) : null;
      if (target) {
        gsap.fromTo(
          target,
          { yPercent: 14, rotate: -5, scale: 0.9 },
          { yPercent: 0, rotate: 0, scale: 1, ease: "none", scrollTrigger: scroll },
        );
      }
    });
    return () => mm.revert();
  }, [settle]);

  return <div ref={ref}>{children}</div>;
}
