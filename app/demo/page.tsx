"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, btn } from "@/components/ui";
import * as becker from "@/data/demos/becker";
import { ruleDemoAnswer } from "@/lib/demoAnswer";
import { useCheckState } from "@/lib/store";

type Msg = { role: "user" | "assistant"; text: string; callback?: boolean };

const SUGGEST: Record<string, string[]> = {
  bakery: ["When are you open on Sunday?", "How early do I need to order a birthday cake?", "Are your rolls nut-free?", "Do you deliver?"],
  default: ["Do you come to Bad Kissingen?", "When is your office open?", "How do I get a quote?", "What does painting a 20 m² room cost?"],
};

export default function DemoPage() {
  const { state } = useCheckState();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", request: "" });
  const [sent, setSent] = useState<typeof form | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const usingOwn = !!state?.siteText;
  const siteText = state?.siteText || becker.siteText;
  const company = (usingOwn ? state?.profile?.name : null) || (usingOwn ? state?.lead?.companyName : null) || becker.profile.name;
  const services = (usingOwn ? state?.profile?.services : becker.profile.services) ?? [];
  const domain = (usingOwn ? state?.lead?.website : becker.lead.website) || "your-website.de";
  const suggestions = state?.exampleId === "bakery" && usingOwn ? SUGGEST.bakery : SUGGEST.default;

  useEffect(() => {
    if (state && msgs.length === 0) setMsgs([{ role: "assistant", text: `Hello! I'm the assistant of ${company}. Ask me about our services, areas, opening hours or how to get a quote.` }]);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, busy, sent]);

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    const history = [...msgs, { role: "user" as const, text: q }];
    setMsgs(history);
    setText("");
    setBusy(true);
    let r: { answer: string; offerCallback: boolean };
    const wait = new Promise((res) => setTimeout(res, 600));
    if (state?.demoMode) {
      r = ruleDemoAnswer(siteText, q);
    } else {
      try {
        const res = await fetch("/api/demo-chat", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ siteText, companyName: company, history: history.filter((_, i) => i > 0).map(({ role, text }) => ({ role, text })) }),
        });
        if (!res.ok) throw new Error();
        r = await res.json();
      } catch {
        r = ruleDemoAnswer(siteText, q);
      }
    }
    await wait;
    setBusy(false);
    setMsgs((m) => [...m, { role: "assistant", text: r.answer, callback: r.offerCallback }]);
    if (r.offerCallback) setForm((f) => ({ ...f, request: f.request || q }));
  }

  const showForm = msgs.some((m) => m.callback) && !sent;

  return (
    <>
      <SiteHeader right={<Link href="/results" className="font-bold text-blue underline underline-offset-4">Back to results</Link>} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <h1 className="font-display text-[30px] font-extrabold leading-tight">Your demo assistant</h1>
        <p className="mt-1 max-w-2xl text-ink-2">
          This is how it would look on {usingOwn ? "your" : "a"} website. It answers only from {usingOwn ? "your website text" : `${company}'s website (example; you didn't enter a website)`}. If it doesn't know, it says so and takes a callback request.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* fake website */}
          <div className="overflow-hidden rounded-xl border border-line bg-sheet shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 border-b border-line bg-plaster px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-line" /><span className="h-3 w-3 rounded-full bg-line" /><span className="h-3 w-3 rounded-full bg-line" />
              <span className="ml-2 truncate rounded bg-sheet px-3 py-0.5 text-[14px] text-ink-2">{domain}</span>
            </div>
            <div className="p-6 sm:p-10">
              <p className="font-serif text-[15px] uppercase tracking-wide text-ink-2">{usingOwn ? state?.profile?.industry : becker.profile.industry}</p>
              <h2 className="mt-1 font-serif text-[36px] font-bold leading-tight">{company}</h2>
              <p className="mt-3 max-w-md text-ink-2">{(usingOwn ? state?.profile?.areas : becker.profile.areas) || ""}</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {services.slice(0, 6).map((s) => <li key={s} className="rounded border border-line px-3 py-2 text-[16px]">{s}</li>)}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
                <span className="rounded bg-ink px-4 py-2.5 font-serif text-[16px] text-white">Request a quote</span>
                <span className="font-serif text-[16px] text-ink-2">Office hours by phone. Outside them, the assistant on the right takes your request.</span>
              </div>
            </div>
          </div>

          {/* widget */}
          <div className="flex h-[620px] flex-col overflow-hidden rounded-2xl border-2 border-ink bg-sheet shadow-[0_12px_30px_-12px_rgba(30,42,51,0.35)]">
            <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
              <div>
                <p className="font-bold">{company}</p>
                <p className="text-[13px] text-white/70">Automated assistant · answers from our website</p>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-go" aria-hidden />
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={`rise flex ${m.role === "user" ? "justify-end" : ""}`}>
                  <p className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[16px] ${m.role === "user" ? "rounded-br-sm bg-blue text-white" : "rounded-bl-sm bg-plaster"}`}>{m.text}</p>
                </div>
              ))}
              {busy && <p className="text-[15px] text-ink-2">Typing…</p>}
              {showForm && (
                <form className="rise space-y-2 rounded-xl border-2 border-blue/40 p-3" onSubmit={(e) => { e.preventDefault(); if (form.name && form.phone) setSent(form); }}>
                  <p className="font-bold">Request a callback</p>
                  <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-lg border-2 border-ink/20 px-3 text-[16px] focus:border-blue focus:outline-none" aria-label="Your name" />
                  <input required placeholder="Phone number" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 w-full rounded-lg border-2 border-ink/20 px-3 text-[16px] focus:border-blue focus:outline-none" aria-label="Phone number" />
                  <textarea placeholder="What is it about?" rows={2} value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} className="w-full rounded-lg border-2 border-ink/20 p-2 text-[16px] focus:border-blue focus:outline-none" aria-label="Your request" />
                  <button className={`${btn("primary", "sm")} w-full`}>Request callback</button>
                </form>
              )}
              {sent && (
                <div className="rise rounded-xl bg-go-bg p-3 text-[16px]">
                  <p className="font-bold text-go">Thanks, {sent.name}. We&apos;ll call you back today.</p>
                </div>
              )}
              <div ref={end} />
            </div>
            <div className="border-t border-line p-3">
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-[14px] font-bold hover:border-blue">{s}</button>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question" aria-label="Ask a question" className="h-11 flex-1 rounded-lg border-2 border-ink/20 px-3 text-[16px] focus:border-blue focus:outline-none" />
                <button className={btn("primary", "sm")} disabled={busy || !text.trim()}>Send</button>
              </form>
            </div>
          </div>
        </div>

        {sent && (
          <section className="rise mt-8 max-w-xl">
            <h2 className="font-display text-[22px] font-extrabold">What the owner gets on WhatsApp, on site</h2>
            <div className="mt-3 rounded-2xl rounded-tl-sm bg-[#dcf3d0] p-4 text-[16px] shadow-sm">
              <p className="font-bold">New callback request ({company})</p>
              <p>👤 {sent.name} · 📞 {sent.phone}</p>
              <p>📝 {sent.request || "General question"}</p>
              <p className="mt-1 text-[13px] text-ink-2">via website assistant · {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <p className="mt-3 font-bold">No more missed calls: every request lands in one place.</p>
          </section>
        )}
      </main>
    </>
  );
}
