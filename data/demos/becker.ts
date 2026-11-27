import type { Lead, Picks, Profile } from "@/lib/types";

// Fictional demo business (persona: Thomas Becker, 52). Not a real company.
export const lead: Lead = {
  industry: "painter",
  companyName: "Becker Bauservice",
  teamSize: "10-49",
  website: "becker-bauservice.example",
  bavaria: true,
  weekText:
    "Crews get briefed at 6:30, then I'm on sites until 3. The phone rings all day and I can't pick up with a roller in my hand. Office until 5:30, and then quotes at the kitchen table from 8 to 10. Extra work on site gets forgotten and never billed. We paid €80 a month for an app nobody used.",
  pains: ["quotes", "calls", "billing", "whatsapp"],
  tools: ["Excel", "Word", "WhatsApp", "Trade software"],
  budget: 1,
  worry: "cost",
};

export const siteText = `TITLE: Becker Bauservice | Painter & building services in Lower Franconia
H: Painting & decorating since 1961
Third-generation family business from Lower Franconia. 14 people: 10 tradespeople, 2 apprentices, office.
H: Our services
Interior painting and wallpapering. Facade painting and facade cleaning. Plaster and drywall repairs. Mould remediation. Floor coatings for garages and cellars. Maintenance contracts for property managers (stairwells, flats between tenants).
H: Areas we serve
Schweinfurt city and district, Bad Kissingen, Haßfurt, Kitzingen and Gerolzhofen. Up to about 40 km from Schweinfurt. Further away only for larger jobs.
H: Opening hours
Office: Monday to Friday, 3:00 pm to 5:30 pm. Crews on site Monday to Friday 7:30 am to 3:00 pm. No weekend work, except emergencies for property managers.
H: Request a quote
A viewing is free. We usually come within one week. You can also send photos of the rooms by WhatsApp or email and we give you a first price range. Quotes are sent within a few days after the viewing.
H: FAQ
Do I have to move furniture? Please clear small items. We move and cover large furniture.
How long does one room take? Usually 1 to 2 days including preparation.
Can you paint facades in winter? Facades from April to October, interiors all year.
How do I pay? By invoice, payable within 14 days. No deposit for jobs under €5,000.
Do you give a warranty? Yes, the legal warranty of 5 years for building work.
Do you work for tenants? Yes, with permission of the landlord or property manager.
H: Contact
Phone 09721 000000 (demo number). WhatsApp to the same number. Email info@becker-bauservice.example`;

export const profile: Profile = {
  name: "Becker Bauservice",
  industry: "Painter & building services",
  services: ["Interior painting & wallpaper", "Facades", "Plaster & drywall repairs", "Mould remediation", "Maintenance for property managers"],
  customerChannels: ["Phone", "WhatsApp", "Email", "Website"],
  painPoints: ["Quotes written in the evening", "Missed calls on site", "Unbilled extra work"],
  followUpQuestions: [],
  areas: "Schweinfurt and up to 40 km around",
};

export const answers: Record<string, string> = {
  quotesPerWeek: "4–8",
  quoteHours: "1 hour",
  missedCalls: "2–4",
  unbilled: "About €500",
  webVisitors: "100–1,000",
  hourlyRate: "€55",
};

export const picks: Picks = {
  source: "cached",
  candidates: [
    { id: "quote-photo-voice", title: "Quote drafts from site photos and voice notes", description: "You write 4–8 quotes a week at the kitchen table. Take photos at the viewing, speak the measurements into your phone, and get a draft in your own Word template the same afternoon. You check it and send it, before 8 pm.", hoursPerMonth: 19 },
    { id: "phone-ai-answer", title: "Callback assistant for missed calls on site", description: "You miss 2–4 calls a day while you're on a ladder. An assistant answers as \"Becker Bauservice\", notes name, address and job, and sends it to your WhatsApp. You call back at 3 pm, with every lead in one list.", hoursPerMonth: 9, extraValuePerMonth: 600 },
    { id: "extra-work-voice-log", title: "Extra work logged by voice, billed on Friday", description: "About €500 of extra work a month never gets billed. Crew leads say \"customer wants the hallway ceiling too\" into the phone with a photo. Your office assistant turns it into invoice items every Friday.", hoursPerMonth: 5, extraValuePerMonth: 500 },
    { id: "appointment-booking", title: "Online booking for viewings", description: "Homeowners pick a free viewing slot from your calendar instead of calling you back three times.", hoursPerMonth: 3 },
    { id: "review-requests", title: "Google review request after every final invoice", description: "60% of your customers are homeowners who find you on Google. A short thank-you with a review link goes out with each final invoice.", hoursPerMonth: 1, extraValuePerMonth: 200 },
    { id: "crew-planning-board", title: "Crew planning board instead of the 6:30 phone round", description: "One board for 3 crews: who, which site, which material. Everyone checks it on the phone.", hoursPerMonth: 6 },
  ],
  notWorthIt: [
    { id: "painting-robot", reason: "At 14 people, working mostly in occupied homes and small sites, the robot would stand still most of the year. Payback well over 10 years." },
    { id: "custom-ai-scheduling", reason: "Your calendar plus a simple planning board does 80% of it for €50 a month. A custom AI planner costs €20,000 and needs months to set up." },
  ],
  pilot: {
    id: "phone-ai-answer",
    why: "It's live in one afternoon, your crews change nothing, and it starts catching jobs on day one. Quote drafts come next, in week 3, once you trust the numbers.",
    plan: [
      "Day 1: Forward calls you don't answer within 20 seconds to the assistant. Give it your opening hours, services and areas served.",
      "Day 2–7: Read each call summary in WhatsApp at 3 pm and call back. Mark which calls became viewings.",
      "Day 8–13: Fix any wrong answers. Add the 5 questions callers ask most.",
      "Day 14: Count: missed calls, callbacks, viewings booked. Keep it or cancel (monthly contract).",
    ],
    metric: "Zero unanswered calls, and every caller called back the same day.",
  },
};
