import { NextResponse } from "next/server";
import { DEMOS } from "@/data/demos";
import { scanAnalysis } from "@/lib/llm";
import { KNOWN_IDS, ruleScan, sampleFor } from "@/lib/scanRules";
import { detectSignals, normalise, scanSite } from "@/lib/scrape";
import type { ScanResult, TeamSize } from "@/lib/types";

export const maxDuration = 60;

const SIZES: TeamSize[] = ["1-9", "10-49", "50-249"];

export async function POST(req: Request) {
  let body: { url?: unknown; description?: unknown; teamSize?: unknown; example?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send the website and a description." }, { status: 400 });
  }
  const description = typeof body.description === "string" ? body.description.slice(0, 2000) : "";
  const teamSize = SIZES.includes(body.teamSize as TeamSize) ? (body.teamSize as TeamSize) : "1-9";

  // Example: cached site of the fictional Becker Bauservice, rules only, so it is instant on stage.
  if (body.example === "becker") {
    const d = DEMOS.becker;
    const r = ruleScan({
      url: d.lead.website!, host: d.lead.website!, description: description || d.lead.weekText, teamSize: d.lead.teamSize,
      siteText: d.siteText, signals: detectSignals(d.siteText, "", [], 0, { https: true, mobile: true, pages: 5 }), pages: 5,
    });
    return NextResponse.json({ ...r, note: "Example: a fictional painter, read from a cached copy of the site." } satisfies ScanResult);
  }

  const raw = typeof body.url === "string" ? body.url.trim() : "";
  const start = normalise(raw);
  if (raw && !start) {
    return NextResponse.json({ error: "We can only scan public websites. Check the address, e.g. www.your-business.de." }, { status: 400 });
  }
  if (!start && !description.trim()) {
    return NextResponse.json({ error: "Enter a public website address like www.your-business.de, or describe your business." }, { status: 400 });
  }

  const site = start ? await scanSite(start.toString()).catch(() => null) : null;
  const host = site?.host ?? start?.hostname.replace(/^www\./, "") ?? "";
  const input = { url: start?.toString() ?? "", host, description, teamSize, siteText: site?.text, signals: site?.signals ?? null, pages: site?.pages ?? 0 };
  const rules = ruleScan(input);
  const note = site
    ? `Read ${site.pages} page${site.pages === 1 ? "" : "s"} from ${host}.`
    : start
      ? `We couldn't read ${host}${description.trim() ? ", so this is based on your description" : ""}. Some sites block automatic visitors.`
      : "No website given, so this is based on your description.";

  const ai = await scanAnalysis({ url: input.url, description, teamSize, siteText: site?.text, signals: site?.signals }).catch(() => null);
  const opps = ai?.opportunities.filter((o) => KNOWN_IDS.has(o.id)) ?? [];
  if (!ai || opps.length < 3 || !KNOWN_IDS.has(ai.pilot.id)) return NextResponse.json({ ...rules, note } satisfies ScanResult);

  const notIds = new Set(opps.map((o) => o.id));
  const result: ScanResult = {
    ...rules,
    name: ai.name || rules.name,
    industry: ai.industry,
    summary: ai.summary || rules.summary,
    services: ai.services.length ? ai.services.slice(0, 6) : rules.services,
    findings: ai.findings.length ? ai.findings.slice(0, 9) : rules.findings,
    opportunities: opps.map((o) => ({ id: o.id, evidence: o.evidence, sample: o.after ? { before: o.before, after: o.after } : sampleFor(o.id, ai.name, ai.services, ai.industry) })),
    suggestions: ai.suggestions.length ? ai.suggestions.slice(0, 4) : rules.suggestions,
    picks: {
      candidates: opps.map((o) => ({ id: o.id, title: o.title, description: o.description, hoursPerMonth: o.hoursPerMonth, extraValuePerMonth: o.extraValuePerMonth })),
      notWorthIt: ai.notWorthIt.filter((n) => KNOWN_IDS.has(n.id) && !notIds.has(n.id)),
      pilot: ai.pilot,
      source: "ai",
    },
    lead: { ...rules.lead, industry: ai.industry, companyName: ai.name || rules.name },
    note,
    source: "ai",
  };
  return NextResponse.json(result);
}
