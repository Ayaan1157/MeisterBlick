import type { TeamSize } from "./types";

export const FUNDING_NOTE =
  "Estimate. Check eligibility at digitalbonus.bayern. Monthly quotas can run out.";
export const FUNDING_CAP = 10000;

export interface FundingResult {
  eligible: boolean;
  program: string;
  grant: number;
  fundedUpfront: number;
  note: string;
}

/** Digitalbonus Bayern (Standard): Bavaria + ≤249 employees, one-time costs only, capped at €10,000. */
export function fundingFor(
  upfront: number,
  opts: { bavaria: boolean; teamSize: TeamSize; rate: number },
): FundingResult {
  const eligible = opts.bavaria && ["1-9", "10-49", "50-249"].includes(opts.teamSize);
  if (!eligible) {
    return {
      eligible: false,
      program: "Funding check available",
      grant: 0,
      fundedUpfront: upfront,
      note: "Outside Bavaria: we check federal and state programmes for you.",
    };
  }
  const rate = Math.min(0.5, Math.max(0.3, opts.rate));
  const grant = Math.round(Math.min(upfront * rate, FUNDING_CAP));
  return {
    eligible: true,
    program: "Digitalbonus Bayern (Standard)",
    grant,
    fundedUpfront: upfront - grant,
    note: FUNDING_NOTE,
  };
}
