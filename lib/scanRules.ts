// Rule-based website scan: works with no API key, so the scan never fails on stage.
import { INDUSTRY_LABELS, rulePicks } from "./fallback";
import { USE_CASES, byId } from "./scoring";
import type { Finding, Industry, Lead, Opportunity, Picks, Sample, ScanResult, SiteSignals, TeamSize } from "./types";

const INDUSTRY_WORDS: Record<Exclude<Industry, "other">, RegExp> = {
  painter: /\b(maler|malerbetrieb|anstrich|fassade|tapez|lackier|painter|painting|decorat|wallpaper|facade)/g,
  electrician: /\b(elektro|elektriker|electric|wiring|photovoltai|solar|e-check|wallbox)/g,
  plumber: /\b(sanitär|sanitaer|heizung|plumb|heating|bathroom|bad\b|boiler|wärmepumpe|heat pump|installateur)/g,
  carpentry: /\b(schreiner|tischler|zimmerei|zimmerer|carpent|joiner|furniture|möbel|kitchen fitting|holz|timber|woodwork)/g,
  bakery: /\b(bäcker|baecker|bakery|backwaren|brötchen|konditor|patisserie|bread|cakes?|torten|rolls)\b/g,
};

export function detectIndustry(text: string): Industry {
  const t = text.toLowerCase();
  let best: Industry = "other";
  let top = 0;
  for (const [k, re] of Object.entries(INDUSTRY_WORDS)) {
    const n = (t.match(re) || []).length;
    if (n > top) { top = n; best = k as Industry; }
  }
  return best;
}

const PAIN_WORDS: [string, RegExp][] = [
  ["calls", /phone|call|ring|anruf|telefon|miss(ed)? |reach us|voicemail|answering/],
  ["quotes", /quote|quotation|offer|angebot|estimate|kostenvoranschlag|pricing jobs/],
  ["scheduling", /schedul|appointment|termin|planning|roster|shift|calendar|booking|dispatch/],
  ["billing", /invoice|billing|bill |paid|payment|rechnung|unbilled|overdue|accounting|tax/],
  ["emails", /e-?mail|inbox|mails|correspondence/],
  ["whatsapp", /whatsapp|messages|chats/],
  ["social", /review|google|instagram|facebook|social|marketing|new customers|visibility|leads|advertis/],
  ["physical", /lifting|heavy|repetitive|cleaning|robot|manual work|packing|loading/],
];

const BAVARIA = /bayern|bavaria|franken|franconia|münchen|munich|nürnberg|nuremberg|würzburg|wuerzburg|schweinfurt|augsburg|regensburg|bamberg|ingolstadt|bad kissingen|passau|rosenheim|erlangen|fürth|bayreuth/i;

const GENERIC_HEADINGS = /^(home|start|welcome|willkommen|kontakt|contact|impressum|imprint|datenschutz|privacy|faq|menu|menü|navigation|opening hours|öffnungszeiten|areas we serve|about us|über uns|request a quote|news|aktuelles|search|suche|cookie|social|follow us|team|unser team|impressionen|galerie|gallery|referenzen|references|jobs|karriere|careers|filialen|standorte|philosophie|geschichte|history|tradition|downloads|partner|links)\b/i;

function nameFrom(text: string | undefined, host: string): string {
  const title = text?.match(/^TITLE: (.+)$/m)?.[1]?.split(/\s[|–—-]\s|\s·\s|:/)[0]?.trim();
  if (title && title.length > 2 && title.length < 60 && !/^(home|startseite|welcome)$/i.test(title)) return title;
  const base = host.split(".")[0] || "";
  return base ? base.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Your business";
}

const DEFAULT_SERVICES: Record<Industry, string[]> = {
  painter: ["Interior painting", "Facade painting", "Wallpapering"],
  electrician: ["Electrical installation", "Repairs and inspections", "Solar and wallboxes"],
  plumber: ["Heating", "Bathrooms", "Emergency repairs"],
  carpentry: ["Fitted furniture", "Doors and windows", "Workshop jobs"],
  bakery: ["Bread and rolls", "Cakes to order", "Catering"],
  other: ["Services for local customers"],
};

const looksLikeService = (x: string, name: string) =>
  x.length >= 4 && x.length <= 60 && x.split(/\s+/).length <= 7 && !/^[-–•\s]|[-–]$/.test(x) && !/\d{4}/.test(x) &&
  !GENERIC_HEADINGS.test(x) && !/^(our|unsere?)\s+(services|leistungen|team)$|welcome|willkommen|herzlich/i.test(x) &&
  !(name && x.toLowerCase().includes(name.toLowerCase())) &&
  // slogans, questions and testimonials are headings too, but not services
  !/\?$|^H:|^(ihr|ihre|your|das sagen|was wir|warum|why|what our|kunden|customers say|wir sind|we are)\b/i.test(x) &&
  !(name && name.split(/\s+/).some((w) => w.length > 4 && x.toLowerCase().includes(w.toLowerCase())));

const SERVICE_WORDS = /arbeit|sanier|beschicht|reparatur|instal|montage|wartung|service|repair|maint|paint|wallpaper|tapez|facade|fassade|renov|boden|floor|dach|roof|bad|heiz|heat|elektr|electric|solar|tischl|möbel|furniture|küche|kitchen|torte|cake|brot|bread|bröt|catering|lackier|putz|plaster|trockenbau|drywall|schimmel|mould|mold|gestaltung|design|anstrich/i;

function servicesFrom(text: string | undefined, name: string, industry: Industry): string[] {
  const out: string[] = [];
  // the paragraph under a "services" heading usually lists them
  const m = text?.match(/^H: .*(services|leistungen|angebot|sortiment|what we do|was wir).*\n(?!H: )(.+)$/im);
  if (m) out.push(...m[2].split(/[.;•·|]|,\s(?=[A-ZÄÖÜ])/).map((x) => x.trim()).filter((x) => looksLikeService(x, name)));
  if (out.length < 3) out.push(...(text?.match(/^H: (.+)$/gm) || []).map((h) => h.slice(3).trim()).filter((h) => looksLikeService(h, name)));
  // keep only headings that name trade work; names of reviewers, slogans and menus drop out
  const work = industry === "other" ? null : INDUSTRY_WORDS[industry];
  const real = [...new Set(out)].filter((x) => SERVICE_WORDS.test(x) || (work ? new RegExp(work.source, "i").test(x) : false)).slice(0, 6);
  return real.length >= 2 ? real : DEFAULT_SERVICES[industry];
}

const clean = (x?: string) => !!x && x.length > 30 && !/([a-zäöü][A-ZÄÖÜ][a-zäöü]+){2,}/.test(x);

function summaryFrom(text: string | undefined, desc: string, name: string, industry: Industry, services: string[] = []): string {
  // The site's own description first; body text is skipped because it starts with menus and cookie banners.
  const meta = text?.match(/^META: (.+)$/m)?.[1]?.trim();
  if (clean(meta) && !/^(menu|menü|home|start)\b/i.test(meta!)) return meta!.slice(0, 220);
  const label = INDUSTRY_LABELS[industry];
  if (services.length) return `${label}. ${services.slice(0, 3).join(", ")}.`;
  if (desc.trim()) return desc.trim().split(/(?<=[.!?])\s/)[0].slice(0, 220);
  return `${name}: ${label.toLowerCase()}.`;
}

function findingsFrom(s: SiteSignals | null, desc: string, industry: Industry): Finding[] {
  if (!s) {
    return desc.trim()
      ? [{ label: "Working from your description", detail: "We couldn't read the website, so everything below comes from what you told us.", tone: "gap" }]
      : [];
  }
  const now = new Date().getFullYear();
  const gaps: Finding[] = [];
  const good: Finding[] = [];
  if (!s.chat) gaps.push({ label: "No answers after hours", detail: s.faq ? "You have FAQ answers, but visitors can't ask a question when the office is closed." : "Visitors can't ask a question when the office is closed. They call, or they leave.", tone: "gap" });
  if (!s.booking) gaps.push(industry === "bakery"
    ? { label: "No online pre-orders", detail: "Every cake or catering order needs a call during the busiest hours.", tone: "gap" }
    : { label: "No online booking", detail: "Every viewing or appointment needs a phone call or an email back and forth.", tone: "gap" });
  if (!s.reviews) gaps.push({ label: "No customer reviews shown", detail: "New customers check Google first. Happy customers rarely leave a review unless you ask.", tone: "gap" });
  if (!s.contactForm && !s.email) gaps.push({ label: "Phone is the only way in", detail: "Customers who can't reach you by phone have no other way to leave a request.", tone: "gap" });
  if (s.copyrightYear && s.copyrightYear < now - 2) gaps.push({ label: `Last updated around ${s.copyrightYear}`, detail: "An outdated site costs trust. Fresh project photos and posts can come from your phone.", tone: "gap" });
  if (s.mobile === false) gaps.push({ label: "Not built for phones", detail: "Most visitors arrive on a phone. A mobile layout is a cheap fix before any AI.", tone: "gap" });
  if (s.https === false) gaps.push({ label: "No secure connection", detail: "Browsers mark the site as \"not secure\". Ask your web host to switch on HTTPS; it is usually free.", tone: "gap" });
  if (s.phone) good.push({ label: "Phone number easy to find", detail: "Good. It also means calls are your main channel, and the ones you miss on site are lost.", tone: "good" });
  if (s.whatsapp) good.push({ label: "WhatsApp offered", detail: "Customers already message you, so quick replies and labels pay off fast.", tone: "good" });
  if (s.contactForm) good.push({ label: "Contact form", detail: "Requests arrive in writing, which an assistant can sort and draft replies for.", tone: "good" });
  else if (s.email) good.push({ label: "Email address listed", detail: "Requests arrive by email, which AI can sort and draft replies for.", tone: "good" });
  if (s.hours) good.push({ label: "Opening hours listed", detail: "Clear hours. Outside them, nobody answers yet.", tone: "good" });
  if (s.faq) good.push({ label: "FAQ section", detail: "Ready-made answers a website assistant can use from day one.", tone: "good" });
  if (s.quoteRequest) good.push({ label: "Quote requests invited", detail: "Quotes are part of your week, and they are one of the biggest time savers.", tone: "good" });
  if (s.gallery) good.push({ label: "Project photos", detail: "Before/after posts and site reports can reuse these photos.", tone: "good" });
  if (s.reviews) good.push({ label: "Reviews shown", detail: "Asking after every job keeps them coming without extra work.", tone: "good" });
  if (s.booking) good.push({ label: "Online booking", detail: "Already in place. Nothing to add here.", tone: "good" });
  if (s.chat) good.push({ label: "Chat on the site", detail: "You already answer online. Check it uses your own answers, not generic ones.", tone: "good" });
  return [...gaps.slice(0, 5), ...good].slice(0, 9);
}

/** Why this tool fits, pointing at something real on the site or in the description. */
function evidenceFor(id: string, s: SiteSignals | null, desc: string, pains: Set<string>, industry: Industry): string {
  const d = desc.toLowerCase();
  const said = (re: RegExp) => re.test(d);
  switch (id) {
    case "phone-ai-answer":
      if (said(/miss|can.?t (pick|answer)|phone|call|ring/)) return "You said the phone is a problem. Missed calls usually go to the next company on Google.";
      if (s?.phone && !s.chat) return `Your site sends customers to the phone${s.hours ? ", and only during set hours" : ""}. Calls you miss on site are jobs lost.`;
      break;
    case "voicemail-transcribe":
      if (s?.phone || said(/phone|call|voicemail/)) return "The cheapest first step for calls: voicemails arrive as text, so you read them between jobs.";
      break;
    case "website-faq-assistant":
      if (s && !s.chat) return s.faq ? "No chat on your site, but you already have FAQ answers it can use from day one." : "No chat on your site. Visitors in the evening can't ask anything, so they call or leave.";
      break;
    case "appointment-booking":
      if (s && !s.booking) return industry === "bakery" ? "No way to pre-order online. Customers have to call in the morning rush." : "No way to book a viewing online. Every appointment is a call or an email chain.";
      break;
    case "review-requests":
      if (s && !s.reviews) return "We found no customer reviews on your site. A text after each job asks for one automatically.";
      if (s?.reviews) return "You show reviews already. Asking after every job keeps new ones coming.";
      break;
    case "quote-photo-voice":
      if (said(/quote|offer|angebot|estimate/)) return "You mentioned quotes. They usually eat evenings; drafts from site photos cut that roughly in half.";
      if (s?.quoteRequest) return "Your site invites quote requests, so quotes are a big part of your week.";
      break;
    case "quote-text-blocks":
      if (said(/quote|offer|angebot/) || s?.quoteRequest) return "Free with the software you have: reusable text blocks so no quote starts from a blank page.";
      break;
    case "quote-followup":
      if (said(/quote|offer|angebot/) || s?.quoteRequest) return "Open quotes that nobody chases are lost work. A friendly reminder goes out by itself after 7 days.";
      break;
    case "whatsapp-business":
      if (s?.whatsapp) return "You already offer WhatsApp. Quick replies and labels stop it turning into chaos.";
      break;
    case "email-drafts":
      if (s?.email || s?.contactForm) return "Requests reach you by email and form. AI drafts the reply; you check and send.";
      break;
    case "social-posts":
      if (s?.gallery) return "You show project photos. Before/after posts can come straight from your phone.";
      break;
    case "invoice-reminders":
      if (said(/invoice|paid|payment|late|rechnung/)) return "You mentioned late payments. Reminders go out by themselves, politely, on day 7 and day 14.";
      break;
    case "extra-work-voice-log":
      if (said(/invoice|bill|extra work|unbilled|rechnung/)) return "You mentioned billing. Extra work said into the phone on site ends up on the invoice instead of being forgotten.";
      break;
    case "bakery-order-intake":
      if (s?.phone || s?.whatsapp) return "Orders come in by phone and WhatsApp. An assistant takes them in one list.";
      break;
  }
  const uc = byId(id);
  const pain = uc?.pains.find((p) => pains.has(p));
  return pain ? `Fits what you described: ${uc!.description.charAt(0).toLowerCase()}${uc!.description.slice(1)}` : uc?.description ?? "";
}

/** A concrete before/after of what this tool would produce for this business. */
export function sampleFor(id: string, name: string, services: string[], industry: Industry): Sample {
  const job = (services[0] || (industry === "bakery" ? "a birthday cake" : "a job")).toLowerCase();
  const S: Record<string, Sample> = {
    "phone-ai-answer": {
      before: "Missed call, 10:42, unknown number. No voicemail. You see it at 4 pm, call back, and they have booked someone else.",
      after: `WhatsApp from your assistant, 10:43: "New request for ${name}. Mrs Keller, 0171 555 0192. Wants a price for ${job}, ground floor flat. Prefers a call after 4 pm."`,
    },
    "voicemail-transcribe": {
      before: "Seven voicemails to listen through in the van at the end of the day.",
      after: `Email at 10:44: "Voicemail from Mr Brandt: wants ${job} next month, asks if you work Saturdays. Call back on 0931 555 210."`,
    },
    "website-faq-assistant": {
      before: "21:30, a visitor reads your site, has one question, finds no answer, and closes the tab.",
      after: `Visitor: "Do you also do ${job}?"\nAssistant: "Yes, ${name} does ${job}. Leave your number and we'll call you back tomorrow morning."`,
    },
    "appointment-booking": {
      before: "Four emails and two calls to agree on a time for one viewing.",
      after: `The customer picks a free slot on your site: "Viewing, Tue 16:00. Confirmation and reminder sent." It lands in your calendar.`,
    },
    "review-requests": {
      before: "A happy customer says thanks on the doorstep, and you never hear from them again.",
      after: `Text the day after: "Thanks for choosing ${name}! Would you leave us a short Google review? It helps a small business a lot. [link]"`,
    },
    "quote-photo-voice": {
      before: "Evenings at the kitchen table, typing quotes from notes and photos.",
      after: `Draft in your template, 2 minutes after the viewing:\n1. ${services[0] || "Main work"}: 42 m², 2 coats — €1,260\n2. Protect floors and furniture — €140\n3. Clean-up and disposal — €90\nYou check, adjust and send.`,
    },
    "quote-text-blocks": {
      before: "Typing the same descriptions into every quote.",
      after: `Pick "${services[0] || "standard job"}" from your text blocks; the description, scope and terms fill in. You add measurements and prices.`,
    },
    "quote-followup": {
      before: "Quotes sent, then silence. Nobody has time to chase.",
      after: `Automatic email after 7 days: "Hello Mr Hofmann, did our quote for ${job} arrive safely? Any questions, just reply. ${name}"`,
    },
    "whatsapp-business": {
      before: "Forty unread WhatsApp chats, private and work mixed.",
      after: `Label "New request", quick reply /price: "Thanks! Send 2–3 photos and the room size, and we'll give you a first price range today."`,
    },
    "email-drafts": {
      before: "Customer emails pile up until Sunday.",
      after: `Draft ready to send: "Dear Ms Wagner, thanks for your request about ${job}. We can view it next week; does Tuesday or Thursday afternoon suit you?"`,
    },
    "invoice-reminders": {
      before: "Overdue invoices noticed weeks later, chased by phone.",
      after: `Day 14 after due date, sent automatically: "Friendly reminder: invoice 2026-118 (€1,480) is still open. Already paid? Then please ignore this."`,
    },
    "extra-work-voice-log": {
      before: "The customer asks for the hallway too; nobody writes it down; it never gets billed.",
      after: `Voice note from site: "Hallway ceiling extra, about 12 m²". Friday's invoice gets a new line: "Additional work: hallway ceiling, 12 m² — €216".`,
    },
    "social-posts": {
      before: "Great project photos sit on the crew's phones.",
      after: `Post ready from two photos: "Before and after: ${job} in Schweinfurt, done in 3 days by our team. Planning something similar? Message us."`,
    },
    "site-report": {
      before: "Reports typed up in the office from memory and blurry photos.",
      after: "Report from 6 site photos: \"Day 2: walls primed, 1st coat done, window frames masked. Next: 2nd coat Thursday.\" Sent to the client as PDF.",
    },
    "crew-planning-board": {
      before: "Who is where tomorrow? Sorted in a WhatsApp group at 9 pm.",
      after: "Shared board: each crew sees tomorrow's site, address, materials and contact on their phone. Changes notify only the people affected.",
    },
    "receipt-capture": {
      before: "A shoebox of fuel and material receipts for your tax advisor.",
      after: "Photo of the receipt at the till: amount, date and supplier read in, filed for DATEV automatically.",
    },
    "bakery-order-intake": {
      before: "Cake orders on sticky notes from phone calls during the morning rush.",
      after: "Order list, sorted by pickup day: \"Sat 10:00, birthday cake, 20 slices, chocolate, name: Lena. Phone 0171 555 0133. Paid: no.\"",
    },
    "bakery-forecast": {
      before: "Baking the same amount every Monday, and throwing a crate away.",
      after: "Tomorrow's plan: 15% fewer rolls (rain forecast, school holidays), 10% more pretzels (market day).",
    },
  };
  const uc = byId(id);
  return S[id] ?? { before: "Done by hand, after hours.", after: uc?.description ?? "" };
}

const FIRST_Q: Record<Industry, string> = {
  painter: "Do you paint facades too?",
  electrician: "Do you install wallboxes?",
  plumber: "Can you come quickly if my heating fails?",
  carpentry: "Do you build fitted wardrobes?",
  bakery: "Can I pre-order a cake for Saturday?",
  other: "What do you offer?",
};

function suggestionsFrom(text: string | undefined, s: SiteSignals | null, industry: Industry): string[] {
  const out = [FIRST_Q[industry]];
  if (s?.hours || /hours|öffnungszeiten/i.test(text || "")) out.push(industry === "bakery" ? "When are you open on Sunday?" : "When can I reach you?");
  if (/areas|region|km|umkreis|einzugsgebiet/i.test(text || "")) out.push("Do you work in my area?");
  if (industry !== "bakery") out.push("How do I get a quote?");
  if (s?.prices) out.push("What does it cost?");
  out.push("Can someone call me back?");
  return [...new Set(out)].slice(0, 4);
}

interface ScanInput {
  url: string;
  host: string;
  description: string;
  teamSize: TeamSize;
  siteText?: string;
  signals: SiteSignals | null;
  pages: number;
}

/** Turn what we read and what the owner wrote into a lead the existing rules understand. */
export function leadFrom(inp: ScanInput, name: string, industry: Industry): Lead {
  const d = inp.description.toLowerCase();
  const pains = new Set(PAIN_WORDS.filter(([, re]) => re.test(d)).map(([k]) => k));
  const s = inp.signals;
  if (s) {
    if (s.phone && !s.chat) pains.add("calls");
    if (!s.reviews) pains.add("social");
    if (s.quoteRequest) pains.add("quotes");
    if (s.whatsapp) pains.add("whatsapp");
    if (!s.booking && pains.size < 3) pains.add("scheduling");
  }
  if (!pains.size) pains.add("calls").add("emails");
  const tools = ["Word"];
  if (s?.whatsapp || /whatsapp/.test(d)) tools.push("WhatsApp");
  if (s?.email) tools.push("Outlook / Gmail");
  return {
    industry,
    companyName: name,
    teamSize: inp.teamSize,
    website: inp.url,
    bavaria: BAVARIA.test(`${inp.siteText || ""} ${inp.description}`),
    weekText: inp.description,
    pains: [...pains],
    tools,
    budget: 1,
    worry: "cost",
  };
}

export function ruleScan(inp: ScanInput): ScanResult {
  const hay = `${inp.siteText || ""}\n${inp.description}`;
  const industry = detectIndustry(hay);
  const name = nameFrom(inp.siteText, inp.host);
  const services = servicesFrom(inp.siteText, name, industry);
  const lead = leadFrom(inp, name, industry);
  const picks: Picks = rulePicks(lead, {}, name);

  // A readable site without a chat always gets the website assistant: it is the free demo below.
  if (inp.signals && !inp.signals.chat && !picks.candidates.some((c) => c.id === "website-faq-assistant")) {
    const uc = byId("website-faq-assistant")!;
    picks.candidates.splice(Math.min(2, picks.candidates.length), 0, { id: uc.id, title: uc.title, description: uc.description, hoursPerMonth: Math.round((uc.hoursSaved[0] + uc.hoursSaved[1]) / 2), extraValuePerMonth: undefined });
    picks.candidates = picks.candidates.slice(0, 6);
    picks.notWorthIt = picks.notWorthIt.filter((n) => n.id !== "website-faq-assistant");
  }

  const pains = new Set(lead.pains);
  const opportunities: Opportunity[] = picks.candidates.map((c) => ({
    id: c.id,
    evidence: evidenceFor(c.id, inp.signals, inp.description, pains, industry),
    sample: sampleFor(c.id, name, services, industry),
  }));

  return {
    url: inp.url,
    host: inp.host,
    read: !!inp.siteText,
    pages: inp.pages,
    name,
    industry,
    summary: summaryFrom(inp.siteText, inp.description, name, industry, services),
    services,
    findings: findingsFrom(inp.signals, inp.description, industry),
    signals: inp.signals,
    opportunities,
    suggestions: suggestionsFrom(inp.siteText, inp.signals, industry),
    picks,
    lead,
    siteText: inp.siteText,
    note: "",
    source: "rules",
  };
}

export const KNOWN_IDS = new Set(USE_CASES.map((u) => u.id));
