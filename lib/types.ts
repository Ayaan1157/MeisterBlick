export type Level = "low" | "medium" | "high";
export type UCType = "Existing tool" | "AI agent" | "Software" | "Robot" | "Hybrid";
export type Industry = "painter" | "electrician" | "plumber" | "carpentry" | "bakery" | "other";
export type TeamSize = "1-9" | "10-49" | "50-249";
export type BudgetTier = 0 | 1 | 2 | 3;
export type Worry = "cost" | "gdpr" | "staff" | "time";

export interface UseCase {
  id: string;
  title: string;
  description: string;
  function: string;
  fitsIndustries: string[]; // industry ids, "trades" or "all"
  pains: string[]; // pain chip ids this solves
  type: UCType;
  hoursSaved: [number, number];
  extraValue?: [number, number]; // € / month that is not time (missed jobs, unbilled work, less waste)
  extraValueLabel?: string;
  upfrontCost: [number, number];
  monthlyCost: [number, number];
  effort: Level;
  risk: Level;
  gdpr: string;
  readiness: string;
  tools: string[];
  notWorthItWhen: string[]; // condition codes, see fallback.ts
  notWorthItReason: string;
  pilot: { plan: string[]; metric: string };
}

export interface Lead {
  industry: Industry;
  industryOther?: string;
  companyName?: string;
  teamSize: TeamSize;
  website?: string;
  bavaria: boolean;
  weekText: string;
  pains: string[];
  tools: string[];
  budget: BudgetTier;
  worry: Worry;
}

export interface Profile {
  name: string;
  industry: string;
  services: string[];
  customerChannels: string[];
  painPoints: string[];
  followUpQuestions: string[];
  areas?: string;
}

export interface ChatTurn {
  role: "assistant" | "user";
  text: string;
  key?: string; // question key for parsing numbers
  options?: string[];
}

export interface Candidate {
  id: string;
  title: string;
  description: string;
  hoursPerMonth: number;
  extraValuePerMonth?: number;
}

export interface Picks {
  candidates: Candidate[];
  notWorthIt: { id: string; reason: string }[];
  pilot: { id: string; why: string; plan: string[]; metric: string };
  source: "ai" | "rules" | "cached";
}

export interface Override {
  hours?: number;
  upfront?: number;
  monthly?: number;
}

export interface Assumptions {
  hourlyRate: number;
  fundingRate: number; // 0.3 - 0.5
  extraCapture: number; // share of extra value we count (conservative)
  overrides: Record<string, Override>;
}

export interface CheckState {
  lead?: Lead;
  siteText?: string;
  profile?: Profile;
  history: ChatTurn[];
  answers: Record<string, string>;
  picks?: Picks;
  assumptions: Assumptions;
  budget: BudgetTier;
  demoMode: boolean;
  exampleId?: string;
}
