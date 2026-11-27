import { NextResponse } from "next/server";
import { demoChat } from "@/lib/llm";
import { ruleDemoAnswer } from "@/lib/demoAnswer";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { siteText, companyName, history } = (await req.json()) as { siteText: string; companyName: string; history: { role: "user" | "assistant"; text: string }[] };
  const ai = await demoChat(siteText, companyName, history).catch(() => null);
  if (ai) return NextResponse.json({ ...ai, source: "ai" });
  const last = [...history].reverse().find((h) => h.role === "user")?.text ?? "";
  return NextResponse.json({ ...ruleDemoAnswer(siteText, last), source: "rules" });
}
