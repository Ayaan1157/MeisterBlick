"use client";
import { useMemo, useState } from "react";
import { AnswerFlow } from "@/components/AnswerFlow";
import HelixRibbonHero from "@/components/ui/helix-ribbon-hero";
import { answerCovers, ribbonCards } from "@/lib/heroCards";
import { rank } from "@/lib/scoring";
import { demoState } from "@/lib/store";

/**
 * The MeisterBlick mark, large: the folded carpenter's ruler from the logo.
 * Same shapes as the header logo, scaled ×2.5 into the 80×100 tile; the top segment unfolds once.
 */
function RulerMark() {
  const k = 2.5, ox = 2.5, oy = 26; // logo units → tile units
  const X = (x: number) => Math.round((ox + x * k) * 100) / 100;
  const Y = (y: number) => Math.round((oy + y * k) * 100) / 100;
  const hinge = `${X(2)}px ${Y(11)}px`;
  return (
    <svg viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="80" height="100" fill="#14302e" />
      <rect x={X(1)} y={Y(12)} width={28 * k} height={9 * k} rx={k} fill="#e2ad4a" stroke="#14302e" strokeWidth={1.2 * k} />
      {[5, 9, 13, 17, 21, 25].map((x, i) => (
        <line key={x} x1={X(x)} x2={X(x)} y1={Y(12)} y2={Y(i % 2 ? 17 : 15)} stroke="#14302e" strokeWidth={k} />
      ))}
      <g transform={`rotate(-14 ${X(2)} ${Y(11)})`}>
        <g className="ruler-fold" style={{ transformOrigin: hinge }}>
          <rect x={X(1)} y={Y(2)} width={20 * k} height={9 * k} rx={k} fill="#e2ad4a" stroke="#14302e" strokeWidth={1.2 * k} />
        </g>
      </g>
      {/* the hinge rivet that holds the two segments */}
      <circle cx={X(2.4)} cy={Y(11.4)} r={1.5 * k} fill="#e2ad4a" stroke="#14302e" strokeWidth={1.2 * k} />
      <circle cx={X(2.4)} cy={Y(11.4)} r={0.5 * k} fill="#14302e" />
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
        { label: "Funding", href: "/funding" },
        { label: "Roadmap", href: "/roadmap" },
        { label: "Contact", href: "/contact" },
      ]}
      cta={{ label: "Start free check", href: "/start" }}
      bio="Your craft stays human. Your paperwork goes to AI. Quotes, invoices, emails and calls, handled by agents we set up for you."
      scrollHint="Scroll: one painter's answers"
      screens={3}
    />
  );
}
