"use client";
import { useEffect, useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";

/** A rule that draws itself left to right as it scrolls into view. */
export function DrawLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 55%", scrub: 0.5 } },
      );
    });
    return () => mm.revert();
  }, []);

  return <div ref={ref} aria-hidden className={`origin-left ${className}`} />;
}
