"use client";
import { useMemo, useState } from "react";
import { AnswerFlow } from "@/components/AnswerFlow";
import HelixRibbonHero from "@/components/ui/helix-ribbon-hero";
import { answerCovers, ribbonCards } from "@/lib/heroCards";
import { rank, USE_CASES } from "@/lib/scoring";
import { demoState } from "@/lib/store";

/** The folded ruler, large, as the mark beside the headline. */
function RulerMark() {
  const ticks = (x: number, len: number) =>
    Array.from({ length: 19 }, (_, i) => (
      <line key={i} x1={x} x2={x + (i % 5 === 0 ? 9 : 5)} y1={i * 6 + 2} y2={i * 6 + 2} stroke="#1e2328" strokeWidth={i % 5 === 0 ? 1.6 : 1} />
    )).slice(0, len);
  return (
    <svg viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="80" height="100" fill="#1e2328" />
      <g transform="rotate(-16 40 100)">
        <rect x="22" y="-8" width="16" height="120" fill="#d3dee8" />
        <g transform="translate(0 -6)">{ticks(22, 19)}</g>
      </g>
      <g transform="rotate(16 40 100)">
        <rect x="42" y="-8" width="16" height="120" fill="#d3dee8" />
        <g transform="translate(0 -6)">{ticks(42, 19)}</g>
      </g>
      <circle cx="40" cy="96" r="3" fill="#1e2328" />
    </svg>
  );
}

export function HomeHero() {
  const { projects, covers } = useMemo(() => {
    const s = demoState("becker", true);
    const r = rank(s.picks!, s.assumptions, s.lead!, s.budget);
    return { projects: ribbonCards(), covers: answerCovers(r, s.picks!, (a) => `/results?example=becker${a}`) };
  }, []);
  const [shown, setShown] = useState(false);

  return (
    <HelixRibbonHero
      greeting="Where AI"
      name="pays off"
      mark={<RulerMark />}
      projects={projects}
      finale={<AnswerFlow covers={covers} label="Becker Bauservice, painters, 14 people: six answers" active={shown} />}
      onFinale={setShown}
      brand="MeisterBlick"
      links={[
        { label: "Try it", href: "#quick" },
        { label: "How it works", href: "#how" },
        { label: "Example", href: "#example" },
        { label: "Pricing", href: "#pricing" },
      ]}
      cta={{ label: "Start free check", href: "/start" }}
      count={`( ${USE_CASES.length} tools checked )`}
      bio="An honest AI check for craft businesses. Ten minutes, one number in euros, and a straight answer where it doesn't pay."
      scrollHint="Scroll: one painter's answers"
      screens={3}
    />
  );
}
