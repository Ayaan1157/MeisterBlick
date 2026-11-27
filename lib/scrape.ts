import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import * as cheerio from "cheerio";
import type { SiteSignals } from "./types";

const CAP = 12000;
const UA = "Mozilla/5.0 (compatible; MeisterBlickBot/1.0; +https://meister-blick.vercel.app)";
const WANTED = /(about|ueber|uber|wir|team|leistung|service|angebot|kontakt|contact|faq|fragen|preise|price|oeffnung|öffnung|hours|termin|booking|referenz|projekt)/i;

/* ---------- SSRF guard: public http(s) hosts only, checked again after DNS and on every redirect ---------- */

function privateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return privateIp(v.slice(7));
  return v === "::" || v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
}

export function normalise(url: string): URL | null {
  try {
    const raw = url.trim();
    if (!raw || raw.length > 300) return null;
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
    if (u.port && !["80", "443"].includes(u.port)) return null;
    const h = u.hostname.replace(/^\[|\]$/g, "");
    if (!h.includes(".") || /\.(local|localhost|internal|example|test|invalid)$/i.test(h) || h === "localhost") return null;
    if (isIP(h) && privateIp(h)) return null;
    return u;
  } catch {
    return null;
  }
}

async function publicHost(u: URL): Promise<boolean> {
  const h = u.hostname.replace(/^\[|\]$/g, "");
  if (isIP(h)) return !privateIp(h);
  try {
    const addrs = await lookup(h, { all: true });
    return addrs.length > 0 && addrs.every((a) => !privateIp(a.address));
  } catch {
    return false;
  }
}

async function get(url: string, ms = 6000): Promise<{ html: string; url: URL } | null> {
  let cur = normalise(url);
  try {
    for (let hop = 0; cur && hop < 4; hop++) {
      if (!(await publicHost(cur))) return null;
      const res = await fetch(cur, { headers: { "user-agent": UA, accept: "text/html" }, signal: AbortSignal.timeout(ms), redirect: "manual" });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        cur = loc ? normalise(new URL(loc, cur).toString()) : null;
        continue;
      }
      if (!res.ok || !(res.headers.get("content-type") || "").includes("html")) return null;
      return { html: (await res.text()).slice(0, 400_000), url: cur };
    }
  } catch {}
  return null;
}

/* ---------- text + signals ---------- */

function extract(html: string, base: URL) {
  const $ = cheerio.load(html);
  const raw = html.toLowerCase();
  const hrefs = $("a[href]").map((_, el) => ($(el).attr("href") || "").toLowerCase()).get();
  const forms = $("form").filter((_, f) => $(f).find("textarea, input[type=email], input[name*=mail], input[name*=message]").length > 0).length;
  const lang = ($("html").attr("lang") || "").slice(0, 2).toLowerCase();
  const viewport = $('meta[name="viewport"]').length > 0;
  const images = $("img").length;

  $("script,style,noscript,svg,iframe,nav form").remove();
  const title = $("title").first().text().trim();
  const meta = $('meta[name="description"]').attr("content")?.trim() || "";
  const headings = $("h1,h2,h3").map((_, el) => $(el).text().replace(/\s+/g, " ").trim()).get().filter(Boolean).slice(0, 20);
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    try {
      const u = new URL($(el).attr("href")!, base);
      if (u.hostname === base.hostname && WANTED.test(u.pathname + " " + $(el).text())) links.add(u.origin + u.pathname);
    } catch {}
  });
  return { title, meta, headings, text, links: [...links], raw, hrefs, forms, lang, viewport, images };
}

const has = (re: RegExp, ...hay: string[]) => hay.some((h) => re.test(h));

/** What a visitor can do on the site. Works on raw HTML, and on plain text for cached examples. */
export function detectSignals(text: string, raw = "", hrefs: string[] = [], forms = 0, extra: Partial<SiteSignals> = {}): SiteSignals {
  const t = text.toLowerCase();
  const all = hrefs.join(" ");
  const year = Math.max(0, ...[...t.matchAll(/(?:©|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/g)].map((m) => Number(m[1])));
  return {
    phone: has(/tel:/, all) || /(\+49|\(0\d|\b0\d{2,5}[\s/-]?\d{3,})/.test(t) || /\bphone\b|telefon/.test(t),
    email: has(/mailto:/, all) || /[a-z0-9._-]+@[a-z0-9-]+\.[a-z]{2,}/.test(t) || /\bemail\b|e-mail/.test(t),
    whatsapp: has(/wa\.me|whatsapp|api\.whatsapp/, all, raw) || /whatsapp/.test(t),
    contactForm: forms > 0 || /contact form|kontaktformular/.test(t),
    booking: has(/calendly|doctolib|terminland|shore\.com|simplybook|bookingkit|timify|etermin|acuityscheduling|cal\.com/, all, raw) || /book (a|an|your) (appointment|viewing|slot)|online (buchen|booking)|termin (online )?(buchen|vereinbaren)/.test(t),
    chat: has(/tawk\.to|intercom|crisp\.chat|userlike|livechat|zendesk|hs-scripts|tidio|chatbot|smartsupp|drift\.com/, raw),
    hours: /opening hours|office hours|öffnungszeiten|geöffnet|mo(nday)?\s*[-–]\s*fr|montag bis freitag|monday to friday/.test(t),
    faq: /\bfaq\b|frequently asked|häufige fragen|haeufige fragen/.test(t) || has(/faq/, all),
    reviews: has(/provenexpert|trustpilot|google\.com\/maps|g\.page|reviews|bewertung|kundenstimmen|testimonial/, all, raw) || /reviews|bewertungen|kundenstimmen|testimonials|★/.test(t),
    prices: /€\s?\d|\d\s?€|\d+(,\d+)?\s?eur\b|price list|preisliste|preise ab|from €/.test(t),
    social: has(/instagram\.com|facebook\.com|tiktok\.com|linkedin\.com|youtube\.com/, all),
    gallery: /references|referenzen|our projects|unsere projekte|gallery|galerie|before and after|vorher.?nachher/.test(t),
    shop: has(/cart|warenkorb|shopify|woocommerce|checkout/, all, raw) || /add to cart|in den warenkorb/.test(t),
    jobs: /careers|karriere|we.?re hiring|wir suchen|stellenangebot|jobs\b|ausbildung|apprentice/.test(t),
    quoteRequest: /request a quote|free quote|get a quote|angebot anfordern|kostenvoranschlag|unverbindliches angebot|viewing is free|kostenlose besichtigung/.test(t),
    copyrightYear: year || null,
    ...extra,
  } as SiteSignals;
}

export interface SiteScan {
  text: string;
  pages: number;
  signals: SiteSignals;
  host: string;
}

export async function scanSite(input: string): Promise<SiteScan | null> {
  const start = normalise(input);
  if (!start) return null;
  const home = await get(start.toString());
  if (!home) return null;
  const base = home.url;
  const h = extract(home.html, base);
  let out = `TITLE: ${h.title}\n${h.meta ? `META: ${h.meta}\n` : ""}${h.headings.map((x) => `H: ${x}`).join("\n")}\n${h.text}`;
  let raw = h.raw, hrefs = [...h.hrefs], forms = h.forms, words = h.text.split(" ").length, images = h.images;
  const sub = h.links.filter((l) => l !== base.origin + base.pathname).slice(0, 5);
  const pages = await Promise.all(sub.map((l) => get(l, 5000)));
  let n = 1;
  pages.forEach((p, i) => {
    if (!p) return;
    const e = extract(p.html, p.url);
    n++;
    raw += e.raw.slice(0, 100_000);
    hrefs = hrefs.concat(e.hrefs);
    forms += e.forms;
    words += e.text.split(" ").length;
    images += e.images;
    if (out.length < CAP) out += `\n\nPAGE: ${sub[i]}\n${e.headings.map((x) => `H: ${x}`).join("\n")}\n${e.text}`;
  });
  const signals = detectSignals(out, raw, hrefs, forms, { https: base.protocol === "https:", mobile: h.viewport, lang: h.lang || null, words, images, pages: n });
  return { text: out.slice(0, CAP), pages: n, signals, host: base.hostname.replace(/^www\./, "") };
}

export async function scrapeSite(input: string): Promise<{ text: string; pages: number } | null> {
  const s = await scanSite(input);
  return s ? { text: s.text, pages: s.pages } : null;
}
