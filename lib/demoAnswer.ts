// Rule-based, site-grounded answers for the demo assistant (works without an API key).
const STOP = new Set("a an the is are do does did you your we our i me my to of in on for and or can could would will what when where how which who it this that with at be by from have has any there please".split(" "));

const SYNONYMS: Record<string, string[]> = {
  open: ["hours", "opening", "office"],
  hours: ["opening", "open", "office"],
  when: ["hours", "opening"],
  price: ["quote", "cost", "range"],
  cost: ["quote", "price", "pay"],
  quote: ["viewing", "quote", "price"],
  offer: ["quote"],
  estimate: ["quote"],
  area: ["areas", "serve", "km"],
  come: ["areas", "serve"],
  far: ["km", "areas"],
  weekend: ["weekend", "saturday", "sunday"],
  saturday: ["weekend", "saturday"],
  sunday: ["weekend", "sunday"],
  pay: ["invoice", "payable", "deposit"],
  payment: ["invoice", "payable", "deposit"],
  order: ["orders", "order", "notice"],
  cake: ["cakes", "cake"],
  allergy: ["allergen", "allergens", "nuts"],
  gluten: ["allergen", "allergens"],
  facade: ["facade", "facades"],
  winter: ["winter", "facades", "interiors"],
  furniture: ["furniture"],
  warranty: ["warranty"],
  phone: ["phone", "contact"],
  call: ["phone", "contact"],
  contact: ["phone", "email", "whatsapp"],
};

const words = (s: string) => s.toLowerCase().replace(/[^a-zäöüß0-9€ ]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));

export function ruleDemoAnswer(siteText: string, question: string) {
  const q = words(question);
  const expanded = new Set(q.flatMap((w) => [w, w.replace(/s$/, ""), ...(SYNONYMS[w] || SYNONYMS[w.replace(/s$/, "")] || [])]));
  const lines = siteText.split("\n").filter((l) => !l.startsWith("TITLE:"));
  // Sentences with their heading as context
  const sents: { text: string; head: string }[] = [];
  let head = "";
  for (const l of lines) {
    if (l.startsWith("H: ")) { head = l.slice(3); continue; }
    l.split(/(?<=[.?!])\s+(?=[A-ZÄÖÜ])/).forEach((s) => s.trim() && sents.push({ text: s.trim(), head }));
  }
  const scored = sents.map((s, i) => {
    const w = new Set(words(s.text + " " + s.head));
    let score = 0;
    expanded.forEach((e) => { if (w.has(e) || [...w].some((x) => x.length > 4 && x.startsWith(e) && e.length > 3)) score += q.includes(e) ? 2 : 1; });
    return { ...s, score, i };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const isQuote = /quote|price|cost|offer|estimate|angebot|how much/i.test(question);
  const asksPrice = /price|cost|how much|€|euro/i.test(question);
  if (asksPrice && !/€\s?\d|\d\s?€/.test(siteText.replace(/jobs under €[\d,]+/gi, ""))) {
    const how = sents.filter((s) => /quote|order/i.test(s.head)).slice(0, 2).map((s) => s.text).join(" ");
    return {
      answer: `There are no fixed prices on our website, because every job is different, so I won't guess a number. ${how}`.trim(),
      answeredFromSite: true,
      offerCallback: true,
    };
  }
  if (!best || best.score < 2) {
    return {
      answer: "I can't find that on our website, so I don't want to guess. Leave your name and number and we'll call you back.",
      answeredFromSite: false,
      offerCallback: true,
    };
  }
  // the best sentence, plus its neighbour if it is a question/answer pair (FAQ)
  const picked = [best];
  const next = sents[best.i + 1];
  if (best.text.endsWith("?") && next) picked.push({ ...next, score: 0, i: best.i + 1 });
  else {
    const second = scored.find((s) => s.i !== best.i && s.head === best.head && s.score >= best.score - 1);
    if (second) picked.push(second);
  }
  const answer = picked.sort((a, b) => a.i - b.i).map((p) => p.text).filter((t) => !t.endsWith("?")).join(" ");
  return { answer: answer || best.text, answeredFromSite: true, offerCallback: isQuote };
}
