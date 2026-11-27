// Company details shown on the contact page and in the footer. Change them here only.
// NOTE: the office addresses below are placeholders for the demo. Replace them with your real ones before launch.

export const COMPANY = {
  name: "MeisterBlick",
  tagline: "Made in Germany, working worldwide.",
  languages: "English and German",
};

export interface Office {
  city: string;
  role: string;
  lines: string[]; // address lines
  note: string;
}

export const OFFICES: Office[] = [
  { city: "Schweinfurt", role: "Headquarters", lines: ["Hauptstraße 12", "97421 Schweinfurt", "Germany"], note: "Where MeisterBlick started, close to the trades we work for." },
  { city: "Munich", role: "Office", lines: ["Landsberger Straße 110", "80339 München", "Germany"], note: "Setup team for southern Germany and Austria." },
  { city: "Berlin", role: "Office", lines: ["Friedrichstraße 68", "10117 Berlin", "Germany"], note: "Agent development and partner support." },
];

export const WORLDWIDE = {
  title: "Worldwide",
  text: "Setup and support run remotely, so we work with firms anywhere: video calls in English or German, in your time zone.",
};

export const CONTACT_TOPICS = ["Free process check", "Licence and pricing", "Funding help", "Become a pilot firm", "Support for my agents", "Something else"];
