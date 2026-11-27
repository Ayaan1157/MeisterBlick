"use client";
import Link from "next/link";
import { useState } from "react";
import { Footer, SiteHeader, btn } from "@/components/ui";
import { COMPANY, CONTACT_TOPICS, OFFICES, WORLDWIDE } from "@/lib/company";

const STORE = "meisterblick:contact-requests";
const field = "mt-1 w-full rounded-lg border-2 border-ink/20 bg-sheet px-3 text-[17px] focus:border-signal focus:outline-none";

type Msg = { name: string; company: string; email: string; phone: string; topic: string; message: string };

export default function ContactPage() {
  const [m, setM] = useState<Msg>({ name: "", company: "", email: "", phone: "", topic: CONTACT_TOPICS[0], message: "" });
  const [sent, setSent] = useState<Msg | null>(null);
  const set = (k: keyof Msg, v: string) => setM((x) => ({ ...x, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Demo only: nothing leaves the browser.
    try {
      const prev = JSON.parse(localStorage.getItem(STORE) || "[]");
      localStorage.setItem(STORE, JSON.stringify([...prev, { ...m, at: new Date().toISOString() }]));
    } catch {}
    setSent(m);
  }

  return (
    <>
      <SiteHeader />
      <main className="w-full">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
          <h1 className="font-poster text-[44px] leading-[0.95] text-balance sm:text-[76px]">Talk to a person</h1>
          <p className="mt-5 max-w-2xl text-[19px] text-ink-2">
            {COMPANY.tagline} Tell us what eats your week and we&apos;ll call you back within one working day, in {COMPANY.languages}.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          {/* Form */}
          <div className="rounded-2xl border border-line bg-sheet p-5 sm:p-7">
            {sent ? (
              <div className="rise" role="status">
                <p className="font-display text-[24px] font-extrabold leading-tight text-go">Thanks, {sent.name}. We&apos;ll be in touch within one working day.</p>
                <p className="mt-2 text-[17px] text-ink-2">Topic: {sent.topic}. Demo: nothing was sent.</p>
                <div className="mt-5 flex flex-wrap gap-4 font-bold">
                  <Link href="/start" className="text-signal underline underline-offset-4">Do the free process check meanwhile</Link>
                  <button type="button" onClick={() => setSent(null)} className="underline underline-offset-4">Send another message</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h2 className="font-display text-[22px] font-extrabold">Send us a message</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="block text-[15px] font-bold">Your name</label>
                    <input id="c-name" required autoComplete="name" value={m.name} onChange={(e) => set("name", e.target.value)} className={`${field} h-12`} />
                  </div>
                  <div>
                    <label htmlFor="c-company" className="block text-[15px] font-bold">Company <span className="font-normal text-ink-2">(optional)</span></label>
                    <input id="c-company" autoComplete="organization" value={m.company} onChange={(e) => set("company", e.target.value)} className={`${field} h-12`} />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="block text-[15px] font-bold">Email</label>
                    <input id="c-email" type="email" required autoComplete="email" value={m.email} onChange={(e) => set("email", e.target.value)} className={`${field} h-12`} />
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="block text-[15px] font-bold">Phone <span className="font-normal text-ink-2">(optional)</span></label>
                    <input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" value={m.phone} onChange={(e) => set("phone", e.target.value)} className={`${field} h-12`} />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-topic" className="block text-[15px] font-bold">What is it about?</label>
                  <select id="c-topic" value={m.topic} onChange={(e) => set("topic", e.target.value)} className={`${field} h-12`}>
                    {CONTACT_TOPICS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="c-msg" className="block text-[15px] font-bold">Your message</label>
                  <textarea id="c-msg" required rows={5} value={m.message} onChange={(e) => set("message", e.target.value)}
                    placeholder="e.g. We're 12 painters and quotes eat my evenings."
                    className={`${field} py-2.5 leading-relaxed`} />
                </div>
                <button type="submit" className={`${btn("signal", "lg")} w-full sm:w-auto`}>Send message</button>
                <p className="text-[14px] text-ink-2">Demo form: nothing is sent.</p>
              </form>
            )}
          </div>

          {/* Addresses */}
          <div>
            <h2 className="font-poster text-[36px] sm:text-[44px]">Where we are</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {OFFICES.map((o) => (
                <li key={o.city} className="grid gap-2 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <p>
                    <span className="block font-display text-[21px] font-extrabold">{o.city}</span>
                    <span className="text-[14px] font-bold text-ink-2">{o.role}</span>
                  </p>
                  <div>
                    <address className="not-italic text-[17px] leading-snug">
                      {o.lines.map((l) => <span key={l} className="block">{l}</span>)}
                    </address>
                    <p className="mt-1.5 text-[15px] text-ink-2">{o.note}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-ink p-5 text-white sm:p-6">
              <p className="font-poster text-[28px] leading-none text-ruler">{WORLDWIDE.title}</p>
              <p className="mt-3 text-[17px] text-white/85">{WORLDWIDE.text}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
