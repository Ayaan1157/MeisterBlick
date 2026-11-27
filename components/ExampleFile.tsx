"use client";
import { useMemo } from "react";
import { FrostedFolderLookbook } from "@/components/ui/frosted-folder-lookbook";
import { buildSheets } from "@/lib/folderSheets";
import { rank } from "@/lib/scoring";
import { demoState } from "@/lib/store";

/** Homepage preview: the results file of the fictional painter Becker Bauservice. */
export function ExampleFile() {
  const { name, score, sheets } = useMemo(() => {
    const s = demoState("becker", true);
    const r = rank(s.picks!, s.assumptions, s.lead!, s.budget);
    return {
      name: s.profile?.name || s.lead!.companyName || "Becker Bauservice",
      score: r.checkScore,
      // on the homepage a sheet opens the full example results at that section
      sheets: buildSheets(r, s.picks!, (anchor) => `/results?example=becker${anchor}`),
    };
  }, []);

  return (
    <FrostedFolderLookbook
      title={name}
      subtitle="AI Check results · example"
      line={`Score ${score} / 100 · Lower Franconia`}
      footer="Estimates only"
      wordmark="MeisterBlick"
      sheets={sheets}
      height="clamp(700px, 92svh, 780px)"
    />
  );
}
