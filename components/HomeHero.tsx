"use client";
import { useMemo, useState } from "react";
import { AnswerFlow } from "@/components/AnswerFlow";
import HelixRibbonHero from "@/components/ui/helix-ribbon-hero";
import { answerCovers, ribbonCards } from "@/lib/heroCards";
import { rank, USE_CASES } from "@/lib/scoring";
import { demoState } from "@/lib/store";

/** A payoff gauge beside the headline: the needle swings up to "pays off". */
function GaugeMark() {
  const cx = 40, cy = 68;
  // rounded so the server and the browser draw the exact same numbers
  const pt = (deg: number, r: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)].map((v) => Math.round(v * 100) / 100);
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const deg = 180 + i * 9;
    const [x1, y1] = pt(deg, 21);
    const [x2, y2] = pt(deg, i % 5 === 0 ? 31 : 26.5);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#14302e" strokeWidth={i % 5 === 0 ? 1.8 : 1} />;
  });
  const [nx, ny] = pt(318, 34);
  return (
    <svg viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="80" height="100" fill="#14302e" />
      {/* the dial: an ochre band, measured like the ruler */}
      <path d={`M ${cx - 36} ${cy} A 36 36 0 0 1 ${cx + 36} ${cy} L ${cx + 21} ${cy} A 21 21 0 0 0 ${cx - 21} ${cy} Z`} fill="#e2ad4a" />
      {ticks}
      <g className="gauge-needle" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
      </g>
      <circle cx={cx} cy={cy} r="5" fill="#e2ad4a" />
      <circle cx={cx} cy={cy} r="1.8" fill="#14302e" />
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
      mark={<GaugeMark />}
      projects={projects}
      finale={<AnswerFlow covers={covers} label="Becker Bauservice, painters, 14 people: six answers" active={shown} />}
      onFinale={setShown}
      brand="MeisterBlick"
      links={[
        { label: "Try it", href: "#quick" },
        { label: "How it works", href: "#how" },
        { label: "Example", href: "#example" },
        { label: "Pricing", href: "#pricing" },
        { label: "Funding", href: "/funding" },
      ]}
      cta={{ label: "Start free check", href: "/start" }}
      count={`( ${USE_CASES.length} tools checked )`}
      bio="An honest AI check for craft businesses. Ten minutes, one number in euros, and a straight answer where it doesn't pay."
      scrollHint="Scroll: one painter's answers"
      screens={3}
    />
  );
}
