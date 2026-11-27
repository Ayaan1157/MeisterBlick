"use client";
import { useEffect, useRef } from "react";
import { ScrollHeading } from "@/components/motion/ScrollHeading";
import { gsap, MOTION_OK } from "@/lib/gsap";

// The check takes ten minutes; each step owns its share of the ruler.
const STEPS = [
  { from: 0, to: 2, t: "Tell us about the business", d: "Trade, team size, what eats your week. On your phone, no tech words." },
  { from: 2, to: 5, t: "Answer five short questions", d: "“How many calls do you miss a day?” Tap an answer; no typing needed." },
  { from: 5, to: 10, t: "Get your answers", d: "What to do now, what can wait, what to skip, and a 2-week test plan you can start Monday." },
];
const MINUTES = 10;

function RulerTicks() {
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 56" aria-hidden>
      {Array.from({ length: MINUTES * 4 + 1 }, (_, i) => {
        const x = (i / (MINUTES * 4)) * 1000;
        const major = i % 4 === 0;
        return <line key={i} x1={x} x2={x} y1={0} y2={major ? 22 : i % 2 === 0 ? 14 : 9} stroke="#14302e" strokeWidth={major ? 2.4 : 1.2} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

/**
 * "Ten minutes, start to end": on wide screens the section pins and a folding ruler
 * unfolds minute by minute as you scroll, lighting each step when its minutes arrive.
 * On phones the ruler unfolds without pinning. Static under reduced motion.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const bar = ruler.current;
    const marker = pin.current;
    const out = readout.current;
    if (!el || !bar || !marker || !out) return;
    const steps = gsap.utils.toArray<HTMLElement>(el.querySelectorAll("[data-step]"));
    const setMinute = (p: number) => {
      out.textContent = `${Math.min(MINUTES, Math.round(p * MINUTES))} min`;
      // the pill slides from right of the edge to left of it, so it never leaves the ruler
      out.style.transform = `translateX(${(-p * 100).toFixed(1)}%)`;
    };

    const mm = gsap.matchMedia();
    mm.add(
      { wide: `(min-width: 768px) and ${MOTION_OK}`, narrow: `(max-width: 767px) and ${MOTION_OK}` },
      (ctx) => {
        const { wide } = ctx.conditions as { wide: boolean };
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: wide
            ? { trigger: el, start: "top top", end: "+=160%", pin: true, scrub: 0.6, onUpdate: (s) => setMinute(s.progress) }
            : { trigger: bar, start: "top 85%", end: "top 25%", scrub: 0.6, onUpdate: (s) => setMinute(s.progress) },
        });
        gsap.set(marker, { opacity: 1 });
        tl.fromTo(bar, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: MINUTES }, 0);
        tl.fromTo(marker, { x: 0 }, { x: () => bar.offsetWidth, duration: MINUTES }, 0);
        if (wide) {
          steps.forEach((s, i) => {
            tl.fromTo(s, { opacity: 0.18, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, STEPS[i].from + 0.15);
          });
          tl.to({}, { duration: 0.6 });
        }
        setMinute(0);
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="how" aria-labelledby="how-h" className="scroll-mt-4 overflow-hidden border-t border-line bg-plaster">
      <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 md:py-16">
        <ScrollHeading id="how-h" className="font-poster text-[40px] sm:text-[60px]">Ten minutes, start to end</ScrollHeading>

        <div className="relative mt-14 md:mt-16">
          {/* the ruler; the readout pin rides its unfolding edge */}
          <div className="relative h-14">
            <div className="absolute inset-0 rounded-[3px] border border-dashed border-ink/20" aria-hidden />
            <div ref={ruler} className="absolute inset-0 overflow-hidden rounded-[3px] bg-ruler">
              <RulerTicks />
              <div className="absolute inset-x-1 bottom-1.5 h-4 text-[12px] font-bold leading-4 tnum" aria-hidden>
                {Array.from({ length: MINUTES + 1 }, (_, i) => (
                  <span key={i} className="absolute top-0" style={{ left: `${(i / MINUTES) * 100}%`, transform: `translateX(${i === 0 ? 0 : i === MINUTES ? -100 : -50}%)` }}>{i}</span>
                ))}
              </div>
            </div>
            <div ref={pin} className="pointer-events-none absolute -top-9 left-0 h-[calc(100%+36px)] w-0 opacity-0" aria-hidden>
              <span ref={readout} className="absolute left-0 top-0 w-16 rounded-full bg-ink py-0.5 text-center text-[13px] font-bold text-white tnum">0 min</span>
              <span className="absolute left-[-1px] top-6 h-[calc(100%-24px)] w-[2px] bg-ink" />
            </div>
          </div>

          <ol className="mt-10 grid gap-10 md:grid-cols-[2fr_3fr_5fr] md:gap-0">
            {STEPS.map((s, i) => (
              <li key={s.t} data-step className="md:border-l-2 md:border-ink md:pl-5 md:pr-8">
                <p className="flex items-baseline gap-3">
                  <span className="font-poster text-[56px] leading-none text-signal tnum">{i + 1}</span>
                  <span className="text-[14px] font-bold text-ink-2 tnum">{s.from}–{s.to} min</span>
                </p>
                <h3 className="mt-3 font-display text-[22px] font-extrabold">{s.t}</h3>
                <p className="mt-2 max-w-sm text-ink-2">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
