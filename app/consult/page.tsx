"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, btn } from "@/components/ui";
import { DEMOS, type DemoId } from "@/data/demos";
import { nextRuleQuestion, parseNum, questionPlan, rulePicks } from "@/lib/fallback";
import { useCheckState } from "@/lib/store";
import type { ChatTurn, CheckState, Picks } from "@/lib/types";

const MAX_Q = 5;
const BUILD_STEPS = [
  "Checking 24 use cases against your business",
  "Estimating hours from your answers",
  "Checking Digitalbonus Bayern funding",
  "Sorting cheapest working option first",
  "Writing down what's not worth it",
];

type Next = { done: boolean; question?: string; options?: string[]; key?: string };

async function fetchNext(s: CheckState, history: ChatTurn[]): Promise<Next> {
  const asked = history.filter((h) => h.role === "assistant" && h.key).length;
  if (asked >= MAX_Q) return { done: true };
  const rule = () => {
    const q = nextRuleQuestion(s.lead!, history);
    return q ? { done: false, question: q.q, options: q.options, key: q.key } : { done: true };
  };
  if (s.demoMode) return rule();
  try {
    const res = await fetch("/api/consult", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ lead: s.lead, profile: s.profile, history, siteText: s.siteText?.slice(0, 4000) }),
    });
    if (!res.ok) throw new Error();
    const j = (await res.json()) as Next;
    if (!j.done && !j.question) throw new Error();
    return j;
  } catch {
    return rule();
  }
}

export default function ConsultPage() {
  const router = useRouter();
  const { state, update } = useCheckState();
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [building, setBuilding] = useState(-1);
  const [text, setText] = useState("");
  const started = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state || started.current) return;
    if (!state.lead) { router.replace("/start"); return; }
    started.current = true;
    const hello: ChatTurn = {
      role: "assistant",
      text: `Thanks${state.profile?.name && state.profile.name !== "Your business" ? `, ${state.profile.name}` : ""}. I have a few short questions so the numbers fit your business. Tap an answer or type your own.`,
    };
    const h = [hello];
    setHistory(h);
    ask(h);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [history, thinking, building]);

  async function ask(h: ChatTurn[]) {
    setThinking(true);
    const [next] = await Promise.all([fetchNext(state!, h), new Promise((r) => setTimeout(r, 450))]);
    setThinking(false);
    if (next.done) return build(h);
    const turn: ChatTurn = { role: "assistant", text: next.question!, options: next.options, key: next.key };
    const nh = [...h, turn];
    setHistory(nh);
  }

  async function answer(a: string) {
    const last = [...history].reverse().find((t) => t.role === "assistant");
    const nh: ChatTurn[] = [...history, { role: "user", text: a, key: last?.key }];
    setHistory(nh);
    setText("");
    if (last?.key) update((s) => ({ answers: { ...s.answers, [last.key!]: a } }));
    await ask(nh);
  }

  async function build(h: ChatTurn[]) {
    const s = state!;
    const answers: Record<string, string> = { ...s.answers };
    h.forEach((t, i) => { if (t.role === "user" && t.key) answers[t.key] = t.text; else if (t.role === "user" && h[i - 1]?.key) answers[h[i - 1].key!] = t.text; });
    setHistory([...h, { role: "assistant", text: "Thanks, that's all I need. Building your plan…" }]);
    setBuilding(0);
    const tick = setInterval(() => setBuilding((b) => Math.min(BUILD_STEPS.length, b + 1)), 520);

    let picks: Picks;
    const ex = s.exampleId as DemoId | undefined;
    const sameAsCached = ex && Object.entries(DEMOS[ex].answers).every(([k, v]) => !answers[k] || answers[k] === v);
    const minWait = new Promise((r) => setTimeout(r, BUILD_STEPS.length * 520 + 300));
    if (s.demoMode && ex && sameAsCached) {
      picks = DEMOS[ex].picks;
    } else if (s.demoMode) {
      picks = rulePicks(s.lead!, answers, s.profile?.name);
    } else {
      try {
        const res = await fetch("/api/pick", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ lead: s.lead, profile: s.profile, history: h, answers }),
        });
        if (!res.ok) throw new Error();
        picks = await res.json();
      } catch {
        picks = rulePicks(s.lead!, answers, s.profile?.name);
      }
    }
    await minWait;
    clearInterval(tick);
    const rate = parseNum("hourlyRate", answers.hourlyRate);
    update((st) => ({ picks, answers, history: h, assumptions: { ...st.assumptions, hourlyRate: rate ?? st.assumptions.hourlyRate, overrides: {} } }));
    router.push("/results");
  }

  const planned = state?.lead ? Math.min(MAX_Q, questionPlan(state.lead).length) : MAX_Q;
  const answered = history.filter((t) => t.role === "user").length;
  const progress = building >= 0 ? 100 : Math.round((answered / planned) * 100);
  const last = history[history.length - 1];
  const suggested = state?.demoMode && last?.key ? state.answers[last.key] : undefined;

  return (
    <>
      <SiteHeader right={<span className="text-[15px] text-ink-2">Step 2 of 3 · short chat</span>} />
      <div className="sticky top-16 z-20 h-2 bg-line no-print" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progress">
        <div className="h-full origin-left bg-ruler transition-transform duration-500" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-40 pt-6 sm:px-6">
        <ol className="space-y-4" aria-live="polite">
          {history.map((t, i) => (
            <li key={i} className={`rise flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[18px] ${t.role === "user" ? "rounded-br-sm bg-blue text-white" : "rounded-bl-sm border border-line bg-sheet"}`}>
                {t.text}
              </div>
            </li>
          ))}
          {thinking && (
            <li className="flex"><div className="rounded-2xl rounded-bl-sm border border-line bg-sheet px-4 py-4" aria-label="Consultant is typing">
              <span className="dot inline-block h-2 w-2 rounded-full bg-ink" /> <span className="dot inline-block h-2 w-2 rounded-full bg-ink [animation-delay:.2s]" /> <span className="dot inline-block h-2 w-2 rounded-full bg-ink [animation-delay:.4s]" />
            </div></li>
          )}
          {building >= 0 && (
            <li className="rise squared rounded-xl border border-line p-4">
              <ul className="space-y-2">
                {BUILD_STEPS.map((s, i) => (
                  <li key={s} className={`flex items-center gap-3 transition-opacity duration-300 ${i < building ? "opacity-100" : i === building ? "opacity-70" : "opacity-25"}`}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-black ${i < building ? "bg-go text-white" : "bg-line"}`}>{i < building ? "✓" : ""}</span>
                    <span className="font-bold">{s}</span>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ol>
        <div ref={bottom} />
      </main>

      {!thinking && building < 0 && last?.role === "assistant" && last.options && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-plaster/95 backdrop-blur no-print">
          <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {last.options.map((o) => (
                <button key={o} onClick={() => answer(o)}
                  className={`rise min-h-12 rounded-full border-2 bg-sheet px-4 py-2 text-[17px] font-bold transition-transform hover:border-blue active:scale-[0.96] ${suggested === o ? "border-blue ring-4 ring-blue/15" : "border-ink/20"}`}>
                  {o}
                </button>
              ))}
            </div>
            <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) answer(text.trim()); }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Or type your answer" aria-label="Your answer"
                className="h-12 flex-1 rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[18px] focus:border-blue focus:outline-none" />
              <button className={btn("primary", "md")} disabled={!text.trim()}>Send</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
