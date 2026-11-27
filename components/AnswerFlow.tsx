"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoverFlow } from "@/components/ui/cover-flow";
import { VERDICT_COLOR, VERDICT_LABEL, type AnswerCover } from "@/lib/heroCards";

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d={dir === "left" ? "M11 3 5 9l6 6" : "M7 3l6 6-6 6"} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * One business's six answers as a cover flow: drag, swipe, use the arrows or the keyboard.
 * The caption under the stage says why, and links to the full detail.
 */
export function AnswerFlow({ covers, label, active = true }: { covers: AnswerCover[]; label: string; active?: boolean }) {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const cur = covers[index];
  const n = covers.length;
  const go = (d: number) => setIndex((i) => (i + d + n) % n);

  return (
    <div className="flex h-full min-h-0 flex-col justify-center text-ink">
      <p className="text-center text-[15px] font-bold">{label}</p>

      <div className="relative mt-3 aspect-[1.08] w-full flex-none sm:aspect-auto sm:min-h-0 sm:flex-1">
        <CoverFlow
          items={covers.map((c) => ({ title: c.title, src: c.src, alt: c.alt }))}
          index={index}
          onIndexChange={setIndex}
          onSelect={(i) => router.push(covers[i].href)}
          autoplay={active}
          interval={4}
          wheel={false}
          showCaptions={false}
          sway={0.6}
          stageColor="#1e2328"
          pageColor="transparent"
          accent="#1e2328"
          ariaLabel={label}
          style={{ width: "100%", height: "100%", minHeight: 0, aspectRatio: "auto" }}
        />
      </div>

      {cur && (
        <div className="mx-auto mt-4 grid w-full max-w-4xl items-start gap-x-6 gap-y-3 sm:grid-cols-[1fr_auto]" aria-live="polite">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className="rounded-full px-2.5 py-0.5 text-[13px] font-bold"
                style={{ background: VERDICT_COLOR[cur.kind].bg, color: VERDICT_COLOR[cur.kind].fg }}
              >
                {VERDICT_LABEL[cur.kind]}
              </span>
              <span className="font-display text-[20px] font-extrabold leading-tight sm:text-[22px]">{cur.title}</span>
            </p>
            <p className="mt-1.5 line-clamp-2 max-w-2xl text-[15px] leading-snug sm:text-[16px]">{cur.why}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Previous answer" className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink hover:bg-ink hover:text-white">
              <Arrow dir="left" />
            </button>
            <span className="w-12 text-center text-[14px] font-bold tnum">{index + 1} / {n}</span>
            <button type="button" onClick={() => go(1)} aria-label="Next answer" className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink hover:bg-ink hover:text-white">
              <Arrow dir="right" />
            </button>
            <Link href={cur.href} className="ml-2 inline-flex h-11 items-center whitespace-nowrap rounded-full bg-ink px-5 text-[15px] font-bold text-white hover:bg-black">
              See the detail
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
