"use client";
import { useCallback, useEffect, useState } from "react";
import { DEMOS, type DemoId } from "@/data/demos";
import { parseNum } from "./fallback";
import { DEFAULT_ASSUMPTIONS } from "./scoring";
import type { CheckState } from "./types";

const KEY = "aicheck:v1";

export const emptyState = (): CheckState => ({
  history: [],
  answers: {},
  assumptions: { ...DEFAULT_ASSUMPTIONS, overrides: {} },
  budget: 1,
  demoMode: false,
});

export function loadState(): CheckState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
  } catch {}
  return emptyState();
}

export function saveState(s: CheckState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function demoState(id: DemoId, demoMode = true): CheckState {
  const d = DEMOS[id];
  const rate = parseNum("hourlyRate", d.answers.hourlyRate) ?? 45;
  return {
    ...emptyState(),
    lead: d.lead,
    siteText: d.siteText,
    profile: d.profile,
    answers: d.answers,
    picks: d.picks,
    budget: d.lead.budget,
    assumptions: { ...DEFAULT_ASSUMPTIONS, hourlyRate: rate, overrides: {} },
    demoMode,
    exampleId: id,
  };
}

/** Reads ?demo=1 (cached data only) and ?example=becker|bakery once on load. */
function applyUrlFlags(s: CheckState): CheckState {
  if (typeof window === "undefined") return s;
  const p = new URLSearchParams(window.location.search);
  const ex = p.get("example") as DemoId | null;
  let next = s;
  if (ex && ex in DEMOS) next = demoState(ex, true);
  if (p.get("demo") === "1") {
    next = next.lead ? { ...next, demoMode: true } : demoState("becker", true);
  }
  if (p.get("demo") === "0") next = { ...next, demoMode: false };
  return next;
}

export function useCheckState() {
  const [state, setState] = useState<CheckState | null>(null);
  useEffect(() => {
    const s = applyUrlFlags(loadState());
    saveState(s);
    setState(s);
  }, []);
  const update = useCallback((patch: Partial<CheckState> | ((s: CheckState) => Partial<CheckState>)) => {
    setState((prev) => {
      const base = prev ?? loadState();
      const next = { ...base, ...(typeof patch === "function" ? patch(base) : patch) };
      saveState(next);
      return next;
    });
  }, []);
  const replace = useCallback((s: CheckState) => {
    saveState(s);
    setState(s);
  }, []);
  return { state, update, replace };
}
