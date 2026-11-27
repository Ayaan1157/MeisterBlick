"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, SplitText } from "@/lib/gsap";

/**
 * A poster headline whose letters rise out of their line as it scrolls into view.
 * Scrubbed, so scrolling back lowers them again. Plain text under reduced motion.
 */
export function ScrollHeading({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const split = SplitText.create(el, {
        type: "lines,chars",
        mask: "lines",
        linesClass: "sh-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 105,
            ease: "none",
            stagger: 0.035,
            scrollTrigger: { trigger: el, start: "top 94%", end: "top 58%", scrub: 0.5 },
          }),
      });
      return () => split.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <h2 ref={ref} id={id} className={className}>
      {children}
    </h2>
  );
}
