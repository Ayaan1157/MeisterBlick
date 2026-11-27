import type { FolderSheet } from "@/components/ui/frosted-folder-lookbook";
import { eur, months, type Results } from "./scoring";
import type { Picks } from "./types";

/** The 4–6 feedback sheets in the results folder: top 3, first pilot, then what's not worth it.
 *  `link` turns a section anchor (e.g. "#pilot") into the sheet's href. */
export function buildSheets(results: Results, picks: Picks, link: (anchor: string) => string = (a) => a): FolderSheet[] {
  const pilot = picks.pilot;
  const pilotTitle =
    results.top.find((t) => t.id === pilot.id)?.title ?? picks.candidates.find((c) => c.id === pilot.id)?.title ?? "Your first pilot";
  const sheets: FolderSheet[] = [
    ...results.top.map((e, i): FolderSheet => ({
      kind: e.verdict === "now" ? "now" : "later",
      code: `No. ${i + 1}`,
      title: e.title,
      note: e.description,
      big: `≈ ${eur(e.euroMonth)}`,
      bigNote: `per month · ≈ ${e.hours} h`,
      foot: `Payback: ${months(e.paybackMonths)}`,
      href: link(`#uc-${e.id}`),
    })),
    { kind: "pilot", code: "2 weeks", title: pilotTitle, note: pilot.why, foot: `Success: ${pilot.metric}`, href: link("#pilot") },
    ...results.notWorth.map((e): FolderSheet => ({
      kind: "no",
      code: "Skip",
      title: e.uc.title,
      note: e.reason,
      foot: `Payback: ${months(e.paybackMonths)}`,
      href: link(`#no-${e.id}`),
    })),
  ];
  return sheets.slice(0, 6);
}

export const fileDate = () => new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
