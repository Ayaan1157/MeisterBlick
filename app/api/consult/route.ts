import { NextResponse } from "next/server";
import { nextRuleQuestion } from "@/lib/fallback";
import { consultantTurn } from "@/lib/llm";
import type { ChatTurn, Lead, Profile } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { lead, profile, history, siteText } = (await req.json()) as { lead: Lead; profile?: Profile; history: ChatTurn[]; siteText?: string };
  const asked = history.filter((h) => h.role === "assistant" && h.key).length;
  const ai = asked < 5 ? await consultantTurn(lead, profile, history, siteText).catch(() => null) : null;
  if (ai && (ai.done || (ai.question && ai.options.length >= 2))) {
    return NextResponse.json({ done: ai.done, question: ai.question, options: ai.options.slice(0, 4), key: ai.key || `q${asked}`, source: "ai" });
  }
  const q = nextRuleQuestion(lead, history);
  return NextResponse.json(q ? { done: false, question: q.q, options: q.options, key: q.key, source: "rules" } : { done: true, source: "rules" });
}
