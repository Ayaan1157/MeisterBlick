"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LicenceNote } from "@/components/LicenceNote";
import { SiteAssistant } from "@/components/SiteAssistant";
import { Ruler, Verdict, btn } from "@/components/ui";
import { recommendLicence } from "@/lib/pricing";
import { DEFAULT_ASSUMPTIONS, eur, rank } from "@/lib/scoring";
import { emptyState, saveState } from "@/lib/store";
import type { ScanResult, TeamSize } from "@/lib/types";

const TEAMS: { id: TeamSize; label: string }[] = [
  { id: "1-9", label: "1–9" },
  { id: "10-49", label: "10–49" },
  { id: "50-249", label: "50–249" },
];
const STEPS = ["Reading your website", "Matching it with what you wrote", "Working out the euros"];
const field = "mt-1 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[17px] focus:border-signal focus:outline-none";

/** Website + the owner's own words → the AI features that fit, what they'd save, and a free demo. */
export function WebsiteScan() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [team, setTeam] = useState<TeamSize>("1-9");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [res, setRes] = useState<ScanResult | null>(null);
  const out = useRef<HTMLDivElement>(null);

  // on phones the answer lands below the form: bring it into view
  useEffect(() => {
    if (res && window.innerWidth < 1024) out.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [res]);

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1800);
    return () => clearInterval(t);
  }, [busy]);

  async function scan(example = false) {
    if (busy) return;
    if (!example && !url.trim() && !text.trim()) {
      setError("Enter your website, describe your business, or both.");
      return;
    }
    setError("");
    setBusy(true);
    setRes(null);
    try {
      const r = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(example ? { example: "becker" } : { url, description: text, teamSize: team }),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok || !data || data.error) setError(data?.error || "The scan didn't work this time. Try again, or just describe your business.");
      else {
        setRes(data as ScanResult);
        if (example) {
          setUrl((data as ScanResult).host);
          setText((data as ScanResult).lead.weekText);
          setTeam((data as ScanResult).lead.teamSize);
        }
      }
    } catch {
      setError("We couldn't reach the scanner. Check your connection and try again.");
    }
    setBusy(false);
  }

  const results = useMemo(
    () => (res ? rank(res.picks, { ...DEFAULT_ASSUMPTIONS, overrides: {} }, res.lead, res.lead.budget) : null),
    [res],
  );

  function openResults() {
    if (!res) return;
    saveState({ ...emptyState(), lead: res.lead, siteText: res.siteText, picks: res.picks, budget: res.lead.budget });
    router.push("/results");
  }

  return (
    <div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
        {/* The form */}
        <form
          onSubmit={(e) => { e.preventDefault(); scan(); }}
          className="space-y-5 rounded-2xl border-2 border-ink bg-sheet p-5 sm:p-7 lg:sticky lg:top-6"
          aria-busy={busy}
        >
          <div>
            <label htmlFor="scan-url" className="block text-[15px] font-bold">Your website</label>
            <input id="scan-url" type="text" inputMode="url" autoComplete="url" spellCheck={false} value={url}
              onChange={(e) => setUrl(e.target.value)} placeholder="www.your-business.de" className={`${field} h-12`} />
          </div>
          <fieldset>
            <legend className="text-[15px] font-bold">People in the team</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TEAMS.map((o) => (
                <button key={o.id} type="button" aria-pressed={team === o.id} onClick={() => setTeam(o.id)}
                  className={`h-11 rounded-full border px-4 text-[16px] font-bold transition-colors ${team === o.id ? "border-ink bg-ink text-white" : "border-ink/25 hover:border-ink"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="scan-text" className="block text-[15px] font-bold">Your company and what&apos;s going wrong</label>
            <textarea id="scan-text" rows={5} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="e.g. We're 8 electricians. I miss calls all day on site, quotes pile up at the weekend and customers pay late."
              className={`${field} py-2.5 leading-relaxed`} />
            <p className="mt-1 text-[14px] text-ink-2">In your own words. No tech words needed.</p>
          </div>
          {error && <p className="text-[15px] font-bold text-no" role="alert">{error}</p>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="submit" disabled={busy} className={`${btn("signal", "lg")} w-full sm:w-auto`}>
              {busy ? "Scanning…" : "Scan my website"}
            </button>
            <button type="button" onClick={() => scan(true)} disabled={busy}
              className="font-bold underline decoration-2 underline-offset-4 hover:decoration-signal disabled:opacity-50">
              Try the example: a painter
            </button>
          </div>
          <p className="text-[14px] text-ink-2">We read up to 6 public pages of your site. Nothing is saved on our side.</p>
        </form>

        {/* What comes back */}
        <div ref={out} aria-live="polite" className="scroll-mt-4">
          {busy ? (
            <ol className="space-y-4 rounded-2xl border border-line bg-sheet p-5 sm:p-7">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-[18px] font-bold transition-opacity ${i > step ? "opacity-35" : ""}`}>
                  <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${i < step ? "bg-go text-white" : i === step ? "bg-ruler text-ink" : "border border-ink/30"}`} aria-hidden>
                    {i < step ? "✓" : i + 1}
                  </span>
                  {s}{i === step ? "…" : ""}
                </li>
              ))}
            </ol>
          ) : res && results ? (
            <ScanSummary res={res} results={results} onOpen={openResults} />
          ) : (
            <div className="rounded-2xl border border-dashed border-ink/35 p-5 sm:p-7">
              <p className="font-display text-[22px] font-extrabold">What you get back, in about 20 seconds</p>
              <ul className="mt-4 space-y-3 text-[17px]">
                <li className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-go" />What your website does well, and where customers get stuck.</li>
                <li className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-ruler" />The AI features that fit your business, and what each saves you per month.</li>
                <li className="flex gap-3"><span aria-hidden className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-signal" />A free demo: an assistant that answers from your own website.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {res && !busy && res.siteText && (
        <div className="rise mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
          <div>
            <h3 className="font-display text-[26px] font-extrabold leading-tight">Your free demo</h3>
            <p className="mt-2 text-[17px] text-ink-2">
              An assistant for {res.name} that answers only from {res.host}. Ask it what your customers ask. When it doesn&apos;t know, it takes a callback request instead of guessing.
            </p>
            <Link href="/demo" onClick={() => saveState({ ...emptyState(), lead: res.lead, siteText: res.siteText, picks: res.picks, budget: res.lead.budget })}
              className="mt-4 inline-block font-bold underline decoration-2 underline-offset-4 hover:decoration-signal">
              Open it full size, with the WhatsApp view
            </Link>
          </div>
          <SiteAssistant siteText={res.siteText} company={res.name} suggestions={res.suggestions} className="h-[480px]" />
        </div>
      )}
    </div>
  );
}

function ScanSummary({ res, results, onOpen }: { res: ScanResult; results: ReturnType<typeof rank>; onOpen: () => void }) {
  const byId = new Map(res.opportunities.map((o) => [o.id, o]));
  const licence = recommendLicence(results.top, Math.max(0, results.totalEuro), res.lead.teamSize);
  return (
    <div className="rise rounded-2xl border border-line bg-sheet p-5 sm:p-7">
      <p className="text-[14px] text-ink-2">{res.note}</p>
      <h3 className="mt-1 font-display text-[26px] font-extrabold leading-tight">{res.name}</h3>
      {res.summary && <p className="mt-1 text-[17px]">{res.summary}</p>}

      {res.findings.length > 0 && (
        <ul className="mt-4 grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
          {res.findings.slice(0, 6).map((f) => (
            <li key={f.label} className="flex gap-2">
              <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${f.tone === "good" ? "bg-go" : "bg-later"}`} />
              <span><b>{f.label}</b> <span className="text-ink-2">{f.detail}</span></span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[15px] font-bold text-ink-2">If you put the top 3 to work</p>
        <p className="mt-1">
          <span className="font-poster text-[52px] leading-none tnum">{eur(results.totalEuro)}</span>
          <span className="ml-2 text-[17px]">a month and ≈ <b className="tnum">{Math.round(results.totalHours)} hours</b> back</span>
        </p>
        <div className="mt-2"><Ruler value={results.checkScore} label={`Score ${results.checkScore} of 100`} /></div>
      </div>

      <ul className="mt-4 divide-y divide-line border-y border-line">
        {results.top.map((e) => {
          const o = byId.get(e.id);
          return (
            <li key={e.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="font-bold">{e.title}</span>
                <span className="flex items-center gap-3"><span className="tnum text-ink-2">{eur(e.euroMonth)}/mo</span><Verdict v={e.verdict} /></span>
              </div>
              {o?.evidence && <p className="mt-1 text-[15px] text-ink-2">{o.evidence}</p>}
              {o?.sample && (
                <details className="mt-2 text-[15px]">
                  <summary className="cursor-pointer font-bold text-signal">See what it would do</summary>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <p className="rounded-lg bg-plaster p-3"><b className="block text-[13px] text-ink-2">Today</b>{o.sample.before}</p>
                    <p className="rounded-lg bg-go-bg p-3"><b className="block text-[13px] text-go">With AI</b>{o.sample.after}</p>
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ul>

      <LicenceNote rec={licence} className="mt-5" />

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" onClick={onOpen} className={btn("signal", "md")}>See the full results</button>
        <Link href="/start" className="font-bold underline decoration-2 underline-offset-4 hover:decoration-signal">Do the full check · 10 min</Link>
      </div>
      <p className="mt-3 text-[13px] text-ink-2">Estimates from typical numbers for your trade.</p>
    </div>
  );
}
