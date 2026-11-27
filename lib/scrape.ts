import * as cheerio from "cheerio";

const CAP = 12000;
const UA = "Mozilla/5.0 (compatible; MeisterBlickBot/1.0)";
const WANTED = /(about|ueber|uber|wir|team|leistung|service|angebot|kontakt|contact|faq|fragen|preise|price|oeffnung|öffnung|hours)/i;

function normalise(url: string): URL | null {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url.trim()}`);
    if (!/^https?:$/.test(u.protocol)) return null;
    // block local / private hosts (SSRF)
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|169\.254\.|\[?::1)/i.test(u.hostname) || u.hostname.endsWith(".local") || u.hostname.endsWith(".example")) return null;
    return u;
  } catch {
    return null;
  }
}

async function get(url: string, ms = 6000): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" }, signal: AbortSignal.timeout(ms), redirect: "follow" });
    if (!res.ok || !(res.headers.get("content-type") || "").includes("html")) return null;
    return (await res.text()).slice(0, 400_000);
  } catch {
    return null;
  }
}

function extract(html: string, base: URL) {
  const $ = cheerio.load(html);
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
  return { title, meta, headings, text, links: [...links] };
}

export async function scrapeSite(input: string): Promise<{ text: string; pages: number } | null> {
  const base = normalise(input);
  if (!base) return null;
  const home = await get(base.toString());
  if (!home) return null;
  const h = extract(home, base);
  let out = `TITLE: ${h.title}\n${h.meta ? `META: ${h.meta}\n` : ""}${h.headings.map((x) => `H: ${x}`).join("\n")}\n${h.text}`;
  const sub = h.links.filter((l) => l !== base.origin + base.pathname).slice(0, 5);
  const pages = await Promise.all(sub.map((l) => get(l, 5000)));
  let n = 1;
  pages.forEach((p, i) => {
    if (!p || out.length > CAP) return;
    const e = extract(p, new URL(sub[i]));
    n++;
    out += `\n\nPAGE: ${sub[i]}\n${e.headings.map((x) => `H: ${x}`).join("\n")}\n${e.text}`;
  });
  return { text: out.slice(0, CAP), pages: n };
}
