// Cards for the homepage helix: drawn as SVG so they stay sharp, load nothing from elsewhere
// and match the theme. Image SVGs can't use the page's web fonts, so they use system faces.
import { USE_CASES, byId, eur, months, type Results } from "./scoring";
import { AGENTS, AGENT_FOR_USE_CASE } from "./pricing";
import type { Picks } from "./types";

export type HeroCard = { src: string; title: string; note?: string };

const INK = "#14302e";
const INK2 = "#4f6461";
const LINE = "#dfe3dd";
const SIGNAL = "#e2ad4a";
const RULER = "#e2ad4a";
const VERDICT = {
  now: { label: "DO IT NOW", fg: "#ffffff", bg: "#1f6f5c" },
  later: { label: "LATER", fg: "#ffffff", bg: "#9a6b12" },
  no: { label: "NOT WORTH IT", fg: "#ffffff", bg: "#a3412e" },
  pilot: { label: "FIRST PILOT", fg: "#e2ad4a", bg: INK },
} as const;
const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrap(text: string, max: number, lines: number) {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  if (out.length > lines) {
    out.length = lines;
    out[lines - 1] = out[lines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return out;
}

const uri = (svg: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

function title(lines: string[], y0: number, size: number) {
  return lines
    .map((l, i) => `<text x="40" y="${y0 + i * size * 1.12}" font-family="${FONT}" font-weight="700" font-size="${size}" fill="${INK}" letter-spacing="-0.5">${esc(l)}</text>`)
    .join("");
}

/** A tool from the library: who runs it, its name, what it gives back. */
function toolCard(name: string, type: string, price: string) {
  const lines = wrap(name, 22, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
<rect width="600" height="400" fill="#ffffff"/>
<rect x="1" y="1" width="598" height="398" fill="none" stroke="${LINE}" stroke-width="2"/>
<rect x="40" y="40" width="14" height="14" fill="${SIGNAL}"/>
<text x="66" y="53" font-family="${FONT}" font-weight="700" font-size="17" letter-spacing="2" fill="${INK2}">${esc(type.toUpperCase())}</text>
${title(lines, 128, 44)}
<line x1="40" y1="322" x2="560" y2="322" stroke="${LINE}" stroke-width="2"/>
<text x="40" y="362" font-family="${FONT}" font-weight="700" font-size="24" fill="${INK}">${esc(price)}</text>
</svg>`;
  return uri(svg);
}

// Tools a firm can switch on with an agent licence, not robots or six-figure builds.
const RIBBON_IDS = [
  "quote-photo-voice", "phone-ai-answer", "invoice-reminders", "email-drafts", "website-faq-assistant", "extra-work-voice-log",
  "quote-followup", "review-requests", "voicemail-transcribe", "site-report", "social-posts", "receipt-capture",
];

/** What the tool gives back, from the library's range of hours saved. */
const savesLine = (id: string) => {
  const [a, b] = byId(id)!.hoursSaved;
  return `saves ≈ ${a}–${b} h a month`;
};

/** The agent that runs the tool, as the card's label; tools outside the agents are "AI tool". */
const kindLabel = (id: string) => {
  const a = AGENT_FOR_USE_CASE[id];
  return a ? AGENTS[a].name : "AI tool";
};

/** Twelve AI tools a craft business can put to work now, each with the agent that runs it. */
export function ribbonCards(): HeroCard[] {
  return RIBBON_IDS.map((id) => USE_CASES.find((u) => u.id === id)!)
    .filter(Boolean)
    .map((u) => ({ src: toolCard(u.title, kindLabel(u.id), savesLine(u.id)), title: u.title }));
}


/* ---------- cover flow: the six answers as square covers ---------- */

export type AnswerKind = keyof typeof VERDICT;
export type AnswerCover = {
  src: string;
  title: string;
  alt: string;
  kind: AnswerKind;
  /** Big figure and the line under it, repeated in the caption under the flow. */
  figure: string;
  line: string;
  /** One sentence on why, from the check itself. */
  why: string;
  href: string;
};

/** A square cover: verdict band, name, big figure, payback, and a ruler along the bottom edge. */
function coverSvg(kind: AnswerKind, no: string, name: string, big: string, small: string) {
  const v = VERDICT[kind];
  const lines = wrap(name, 21, 3);
  const ticks = Array.from({ length: 49 }, (_, i) => {
    const x = 6 + i * 12;
    const h = i % 5 === 0 ? 22 : 12;
    return `<line x1="${x}" y1="548" x2="${x}" y2="${548 + h}" stroke="${INK}" stroke-width="${i % 5 === 0 ? 2.4 : 1.4}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
<rect width="600" height="600" fill="#ffffff"/>
<rect width="600" height="92" fill="${v.bg}"/>
<text x="40" y="57" font-family="${FONT}" font-weight="700" font-size="23" letter-spacing="3" fill="${v.fg}">${v.label}</text>
<text x="560" y="57" text-anchor="end" font-family="${FONT}" font-weight="700" font-size="21" fill="${v.fg}" opacity="0.85">${esc(no)}</text>
${title(lines, 168, 44)}
<text x="40" y="436" font-family="${FONT}" font-weight="800" font-size="76" fill="${INK}" letter-spacing="-2">${esc(big)}</text>
<text x="40" y="486" font-family="${FONT}" font-weight="600" font-size="24" fill="${INK2}">${esc(small)}</text>
<rect y="540" width="600" height="60" fill="${RULER}"/>
${ticks}
</svg>`;
  return uri(svg);
}

/** The six answers for one business as cover-flow items: top 3, the first pilot, then what to skip. */
export function answerCovers(results: Results, picks: Picks, link: (anchor: string) => string): AnswerCover[] {
  const out: Omit<AnswerCover, "src">[] = results.top.map((e) => ({
    kind: e.verdict === "now" ? "now" : "later",
    title: e.title,
    alt: "",
    figure: `≈ ${eur(e.euroMonth)}/mo`,
    line: `Payback: ${months(e.paybackMonths)} · ≈ ${e.hours} h back`,
    why: e.description,
    href: link(`#uc-${e.id}`),
  }));
  const pilot = results.top.find((t) => t.id === picks.pilot.id);
  if (pilot) {
    out.push({
      kind: "pilot",
      title: pilot.title,
      alt: "",
      figure: `${pilot.hours} h/mo`,
      line: "Low risk, live within days",
      why: picks.pilot.why,
      href: link("#pilot"),
    });
  }
  for (const e of results.notWorth) {
    out.push({
      kind: "no",
      title: e.uc.title,
      alt: "",
      figure: eur(e.upfront),
      line: `Up front · payback ${months(e.paybackMonths)}`,
      why: e.reason,
      href: link(`#no-${e.id}`),
    });
  }
  const six = out.slice(0, 6);
  return six.map((c, i) => {
    const no = `${i + 1} / ${six.length}`;
    return {
      ...c,
      alt: `${VERDICT[c.kind].label.toLowerCase()}: ${c.title}, ${c.figure}`,
      src: coverSvg(c.kind, no, c.title, c.figure, c.line),
    };
  });
}

export const VERDICT_LABEL: Record<AnswerKind, string> = {
  now: "Do it now",
  later: "Later",
  pilot: "First pilot",
  no: "Not worth it",
};
export const VERDICT_COLOR = VERDICT;
