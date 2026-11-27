import type { Lead, Picks, Profile } from "@/lib/types";

// Fictional demo business. Not a real company.
export const lead: Lead = {
  industry: "bakery",
  companyName: "Bäckerei Hollerbach",
  teamSize: "10-49",
  website: "baeckerei-hollerbach.example",
  bavaria: true,
  weekText:
    "We bake from 2 am. Two shops, 12 people. Cake orders come in by phone and WhatsApp and sometimes get lost. Every evening we throw bread away, and the shift plan for both shops takes me Sunday afternoon.",
  pains: ["calls", "whatsapp", "scheduling", "physical"],
  tools: ["Excel", "WhatsApp", "Other"],
  budget: 1,
  worry: "staff",
};

export const siteText = `TITLE: Bäckerei Hollerbach | Family bakery with two shops
H: Baked fresh every night since 1978
Family bakery with two shops: Main shop at the market square and a branch at the station. Sourdough bread, rolls, cakes and seasonal pastries.
H: Opening hours
Market square: Monday to Saturday 6:00 am to 6:00 pm, Sunday 7:30 am to 11:00 am. Station branch: Monday to Friday 5:30 am to 2:00 pm. Closed on public holidays.
H: Cakes & orders
Celebration cakes and catering platters need at least 3 days' notice. Wedding cakes 4 weeks. Order in the shop, by phone or by WhatsApp. Pickup at either shop.
H: Allergens
Allergen lists are available in the shop. We can't guarantee nut-free products because we work with nuts in the same bakehouse.
H: Contact
Phone 09721 000001 (demo number). WhatsApp for orders to the same number.`;

export const profile: Profile = {
  name: "Bäckerei Hollerbach",
  industry: "Bakery",
  services: ["Bread & rolls", "Celebration cakes", "Catering platters", "Seasonal pastries"],
  customerChannels: ["Shop counter", "Phone", "WhatsApp"],
  painPoints: ["Lost cake orders", "Bread thrown away every evening", "Shift plan for two shops"],
  followUpQuestions: [],
  areas: "Two shops: market square and station",
};

export const answers: Record<string, string> = {
  missedCalls: "2–4",
  preorders: "10–30",
  leftovers: "About €120",
  webVisitors: "Under 100",
  hourlyRate: "€40",
};

export const picks: Picks = {
  source: "cached",
  candidates: [
    { id: "bakery-order-intake", title: "One order list for phone and WhatsApp cake orders", description: "10–30 pre-orders a week arrive by phone and WhatsApp. They land in one list with pickup date and shop, so nothing gets lost between 2 am and closing.", hoursPerMonth: 8, extraValuePerMonth: 300 },
    { id: "bakery-shift-planning", title: "Shift plan for both shops in one app", description: "Your Sunday afternoon goes back to you. Staff swap shifts themselves; you approve with one tap.", hoursPerMonth: 5 },
    { id: "bakery-forecast", title: "Bake-to-forecast for your top products", description: "About €120 goes in the bin every evening. A forecast from your till data, weekday and weather tells you how much to bake.", hoursPerMonth: 4, extraValuePerMonth: 780 },
    { id: "whatsapp-business", title: "WhatsApp Business with quick replies", description: "Ready-made answers for opening hours, cake lead times and allergens.", hoursPerMonth: 4 },
    { id: "review-requests", title: "Review link on receipts", description: "A QR code on the receipt for a Google review.", hoursPerMonth: 1, extraValuePerMonth: 150 },
  ],
  notWorthIt: [
    { id: "bakery-tray-cobot", reason: "With 2 shops and a changing range, the robot arm would idle most of the night. Check again above roughly 2,000 trays a week." },
    { id: "website-faq-assistant", reason: "Your website gets around 20 visitors a month. A chatbot would answer almost nobody. Put your phone number and order times at the top instead." },
  ],
  pilot: {
    id: "bakery-order-intake",
    why: "Lost cake orders cost you money and goodwill. This is live in a day and your shop staff only learn one list.",
    plan: [
      "Day 1: Connect the WhatsApp number and phone assistant to one shared order list.",
      "Day 2–7: Every pre-order goes through the list only. No paper slips.",
      "Day 8–14: Check every order against pickups. Count lost or doubled orders.",
    ],
    metric: "Zero lost or doubled orders in 2 weeks.",
  },
};
