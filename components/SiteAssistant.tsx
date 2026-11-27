"use client";
import { useEffect, useRef, useState } from "react";
import { btn } from "@/components/ui";
import { ruleDemoAnswer } from "@/lib/demoAnswer";

type Msg = { role: "user" | "assistant"; text: string; callback?: boolean };
export type CallbackRequest = { name: string; phone: string; request: string };

/**
 * A website assistant that answers only from the given site text.
 * Uses Claude through /api/demo-chat when available, the site-grounded rules otherwise.
 */
export function SiteAssistant({
  siteText, company, suggestions, rulesOnly = false, onCallback, className = "h-[620px]",
}: {
  siteText: string;
  company: string;
  suggestions: string[];
  rulesOnly?: boolean;
  onCallback?: (r: CallbackRequest) => void;
  className?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<CallbackRequest>({ name: "", phone: "", request: "" });
  const [sent, setSent] = useState<CallbackRequest | null>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs([{ role: "assistant", text: `Hello! I'm the assistant of ${company}. Ask me about our services, areas, opening hours or how to get a quote.` }]);
    setSent(null);
  }, [company, siteText]);
  // scroll inside the widget only, never the page
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, sent]);

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    const history = [...msgs, { role: "user" as const, text: q }];
    setMsgs(history);
    setText("");
    setBusy(true);
    let r: { answer: string; offerCallback: boolean };
    const wait = new Promise((res) => setTimeout(res, 600));
    if (rulesOnly) {
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
    <div className={`flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-sheet shadow-[0_12px_30px_-12px_rgba(20,48,46,0.35)] ${className}`}>
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate font-bold">{company}</p>
          <p className="text-[13px] text-white/70">Automated assistant · answers from our website</p>
        </div>
        <span className="h-2.5 w-2.5 flex-none rounded-full bg-ruler" aria-hidden />
      </div>
      <div ref={list} className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4" aria-live="polite" data-lenis-prevent>
        {msgs.map((m, i) => (
          <div key={i} className={`rise flex ${m.role === "user" ? "justify-end" : ""}`}>
            <p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[16px] ${m.role === "user" ? "rounded-br-sm bg-signal text-white" : "rounded-bl-sm bg-plaster"}`}>{m.text}</p>
          </div>
        ))}
        {busy && <p className="text-[15px] text-ink-2">Typing…</p>}
        {showForm && (
          <form className="rise space-y-2 rounded-xl border-2 border-signal/40 p-3" onSubmit={(e) => { e.preventDefault(); if (form.name && form.phone) { setSent(form); onCallback?.(form); } }}>
            <p className="font-bold">Request a callback</p>
            <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-lg border-2 border-ink/20 px-3 text-[16px] focus:border-signal focus:outline-none" aria-label="Your name" />
            <input required placeholder="Phone number" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 w-full rounded-lg border-2 border-ink/20 px-3 text-[16px] focus:border-signal focus:outline-none" aria-label="Phone number" />
            <textarea placeholder="What is it about?" rows={2} value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} className="w-full rounded-lg border-2 border-ink/20 p-2 text-[16px] focus:border-signal focus:outline-none" aria-label="Your request" />
            <button className={`${btn("primary", "sm")} w-full`}>Request callback</button>
          </form>
        )}
        {sent && (
          <div className="rise rounded-xl bg-go-bg p-3 text-[16px]">
            <p className="font-bold text-go">Thanks, {sent.name}. We&apos;ll call you back today.</p>
          </div>
        )}
      </div>
      <div className="border-t border-line p-3">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => ask(s)} className="shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-[14px] font-bold hover:border-signal">{s}</button>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question" aria-label="Ask a question" className="h-11 min-w-0 flex-1 rounded-lg border-2 border-ink/20 px-3 text-[16px] focus:border-signal focus:outline-none" />
          <button className={btn("primary", "sm")} disabled={busy || !text.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}

/** What the owner sees on their phone when the assistant takes a callback request. */
export function WhatsAppNote({ company, sent }: { company: string; sent: CallbackRequest }) {
  const [time, setTime] = useState("");
  useEffect(() => setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })), []);
  return (
    <div className="rise rounded-2xl rounded-tl-sm bg-[#dcf3d0] p-4 text-[16px] shadow-sm">
      <p className="font-bold">New callback request ({company})</p>
      <p>👤 {sent.name} · 📞 {sent.phone}</p>
      <p>📝 {sent.request || "General question"}</p>
      <p className="mt-1 text-[13px] text-ink-2">via website assistant{time ? ` · ${time}` : ""}</p>
    </div>
  );
}
