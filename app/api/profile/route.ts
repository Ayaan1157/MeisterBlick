import { NextResponse } from "next/server";
import { ruleProfile } from "@/lib/fallback";
import { profileFromLead } from "@/lib/llm";
import { scrapeSite } from "@/lib/scrape";
import type { Lead } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { lead } = (await req.json()) as { lead: Lead };
  let siteText: string | undefined;
  let note = "";
  if (lead.website?.trim()) {
    const s = await scrapeSite(lead.website).catch(() => null);
    if (s) {
      siteText = s.text;
      note = `Read ${s.pages} page${s.pages === 1 ? "" : "s"} from ${lead.website}.`;
    } else {
      note = `Couldn't read ${lead.website}. No problem, we'll work from your answers.`;
    }
  }
  const ai = await profileFromLead(lead, siteText).catch(() => null);
  const profile = ai ?? ruleProfile(lead, siteText);
  if (lead.companyName?.trim() && (!ai || !profile.name)) profile.name = lead.companyName.trim();
  return NextResponse.json({ profile, siteText, note, source: ai ? "ai" : "rules" });
}
