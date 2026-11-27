// Cards for the homepage helix: drawn as SVG so they stay sharp, load nothing from elsewhere
// and match the theme. Image SVGs can't use the page's web fonts, so they use system faces.
import { USE_CASES, byId, eur, months, type Results } from "./scoring";
import type { Picks } from "./types";

export type HeroCard = { src: string; title: string; note?: string };

const INK = "#15191c";
const INK2 = "#575e64";
const LINE = "#dcddd8";
const SIGNAL = "#ff5b14";
const VERDICT = {
  now: { label: "DO IT NOW", fg: "#ffffff", bg: "#1d7348" },
  later: { label: "LATER", fg: "#ffffff", bg: "#8a5f00" },
  no: { label: "NOT WORTH IT", fg: "#ffffff", bg: "#b3261e" },
  pilot: { label: "FIRST PILOT", fg: SIGNAL, bg: INK },
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

/** A tool from the library, as it is sold to you: type, name, price. */
function toolCard(name: string, type: string, price: string) {
  const lines = wrap(name, 22, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
<rect width="600" height="400" fill="#ffffff"/>
<rect x="40" y="40" width="14" height="14" fill="${SIGNAL}"/>
<text x="66" y="53" font-family="${FONT}" font-weight="700" font-size="17" letter-spacing="2" fill="${INK2}">${esc(type.toUpperCase())}</text>
${title(lines, 128, 44)}
<line x1="40" y1="322" x2="560" y2="322" stroke="${LINE}" stroke-width="2"/>
<text x="40" y="362" font-family="${FONT}" font-weight="700" font-size="24" fill="${INK}">${esc(price)}</text>
</svg>`;
  return uri(svg);
}

/** One of the answers for a business: verdict band, name, figure, payback. */
function verdictCard(kind: keyof typeof VERDICT, name: string, big: string, small: string) {
  const v = VERDICT[kind];
  const lines = wrap(name, 24, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
<rect width="600" height="400" fill="#ffffff"/>
<rect width="600" height="64" fill="${v.bg}"/>
<text x="40" y="42" font-family="${FONT}" font-weight="700" font-size="21" letter-spacing="2.5" fill="${v.fg}">${v.label}</text>
${title(lines, 128, 40)}
<text x="40" y="300" font-family="${FONT}" font-weight="800" font-size="64" fill="${INK}" letter-spacing="-1.5">${esc(big)}</text>
<text x="40" y="350" font-family="${FONT}" font-weight="600" font-size="23" fill="${INK2}">${esc(small)}</text>
</svg>`;
  return uri(svg);
}

const RIBBON_IDS = [
  "custom-ai-scheduling", "painting-robot", "website-faq-assistant", "phone-ai-answer", "social-posts", "palletizer",
  "quote-photo-voice", "email-drafts", "site-report", "floor-cleaning-robot", "review-requests", "crew-planning-board",
];

function priceLine(id: string) {
  const u = byId(id)!;
  const up = u.upfrontCost[1];
  const mo = u.monthlyCost[1];
  if (up >= 5000) return `up to ${eur(up)} up front`;
  if (mo > 0) return `up to ${eur(mo)} a month`;
  return up > 0 ? `up to ${eur(up)} once` : "free with tools you have";
}

/** Twelve tools from the library: everything a craft business gets offered. */
export function ribbonCards(): HeroCard[] {
  return RIBBON_IDS.map((id) => USE_CASES.find((u) => u.id === id)!)
    .filter(Boolean)
    .map((u) => ({ src: toolCard(u.title, u.type, priceLine(u.id)), title: u.title }));
}

/** The six answers for one business: top 3, the first pilot, and what to skip. */
export function answerCards(results: Results, picks: Picks): HeroCard[] {
  const cards: HeroCard[] = results.top.map((e) => ({
    src: verdictCard(e.verdict === "now" ? "now" : "later", e.title, `≈ ${eur(e.euroMonth)}/mo`, `Payback: ${months(e.paybackMonths)}`),
    title: `≈ ${e.hours} h a month back`,
  }));
  const pilot = results.top.find((t) => t.id === picks.pilot.id);
  if (pilot) cards.push({ src: verdictCard("pilot", pilot.title, `${pilot.hours} h/mo`, "low risk, live within days"), title: "Start here, test for 2 weeks" });
  for (const e of results.notWorth) {
    cards.push({ src: verdictCard("no", e.uc.title, `${eur(e.upfront)}`, `up front · payback ${months(e.paybackMonths)}`), title: "Skip it, for now" });
  }
  return cards.slice(0, 6);
}
