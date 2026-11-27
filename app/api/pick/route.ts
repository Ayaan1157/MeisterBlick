import { NextResponse } from "next/server";
import { rulePicks } from "@/lib/fallback";
import { pickUseCases } from "@/lib/llm";
import type { ChatTurn, Lead, Profile } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { lead, profile, answers, history } = (await req.json()) as { lead: Lead; profile?: Profile; answers: Record<string, string>; history: ChatTurn[] };
  const ai = await pickUseCases(lead, profile, answers, history).catch(() => null);
  return NextResponse.json(ai ?? rulePicks(lead, answers, profile?.name));
}
