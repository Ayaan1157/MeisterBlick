import Link from "next/link";
import { ButtonLink, Footer, Ruler, SiteHeader, Verdict } from "@/components/ui";

const promises = [
  { t: "Honest verdicts, including “not worth it”", d: "We show you what to skip. A painting robot for 14 people? We'll tell you plainly: no." },
  { t: "Cheapest working option first", d: "The tools you already pay for come first. Custom builds only when nothing cheaper does the job." },
  { t: "One ROI number in 10 minutes", d: "Hours and euros per month, cost after funding, payback in months. Every number is an editable estimate." },
];

const steps = [
  { t: "Describe your business", d: "Trade, team size, what eats your week. Two minutes, on your phone." },
  { t: "Short consultant chat", d: "4–5 questions like “How many calls do you miss a day?” Tap an answer, no typing needed." },
  { t: "Your top 3 and a first pilot", d: "What to do now, what to leave for later, what to skip, and a 2-week test plan." },
];

const vsChatGPT = [
  ["You need to know what to ask", "We ask you the questions. You tap answers."],
  ["A different answer every time", "Same inputs, same score. The maths runs in code, not in the AI."],
  ["Generic advice", "Benchmarks from similar businesses: trade, size, region."],
  ["Ends at a text", "Ends at a pilot plan, a vendor shortlist and funding help."],
  ["Who's behind it?", "Comes to you through people you trust: your tax advisor, bank, chamber of crafts."],
];

const pricing = [
  { name: "Free Quick Check", price: "€0", note: "", items: ["Your top 3 with ROI", "1-page pilot report (PDF)", "Your own demo assistant"], cta: "Start free", href: "/start", main: true },
  { name: "Pilot Report", price: "€490", note: "one-off", items: ["1-hour call", "Detailed pilot plan", "Vendor shortlist", "Help with the funding application"], cta: "Book Pilot Report", href: "/start" },
  { name: "Starter Build", price: "from €499", note: "setup + €49 / month", items: ["Ready-made templates for your trade", "e.g. phone and callback assistant", "Live within a week"], cta: "Ask about Starter Build", href: "/start" },
  { name: "AI Coach", price: "€99–199", note: "per month", items: ["Ongoing support", "Quarterly re-check", "ROI tracking against real numbers"], cta: "Ask about AI Coach", href: "/start" },
];

const roadmap = [
  { t: "Problem-to-Solution Engine", d: "Start with the problem, not the product.", built: true },
  { t: "AI + Robot Matchmaker", d: "AI, software, robots, hybrids or humans, across vendors.", built: true },
  { t: "Smart Investment Selector", d: "Buy, rent, lease or subscribe.", built: true, href: "/invest" },
  { t: "Automation ROI Score", d: "One honest number before you invest.", built: true },
  { t: "Test-before-you-scale Lab", d: "Real pilots with success criteria before long-term commitment.", built: false },
  { t: "ROI Tracking", d: "Actual savings after implementation, not vendor promises.", built: false },
  { t: "Human-Readiness & Skills Map", d: "Training and roles needed so people actually use it.", built: false },
  { t: "Automation Lifecycle Monitor", d: "Flags tools to upgrade, replace or drop.", built: false },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div className="rise">
            <h1 className="font-display text-[40px] font-extrabold leading-[1.05] sm:text-[56px]">
              We don&apos;t tell you what AI can do. We tell you where it pays off for you. And where it doesn&apos;t.
            </h1>
            <p className="mt-5 max-w-xl text-[20px] text-ink-2">
              One ROI number in 10 minutes, and one concrete first step. Made for craft businesses, not IT departments.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/start" size="lg">Start free Quick Check (10 min)</ButtonLink>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[16px]">
              <span className="text-ink-2">Try an example:</span>
              <Link href="/start?example=becker" className="rounded-full border-2 border-ink/20 bg-sheet px-4 py-2 font-bold hover:border-blue">Painter, 14 people</Link>
              <Link href="/start?example=bakery" className="rounded-full border-2 border-ink/20 bg-sheet px-4 py-2 font-bold hover:border-blue">Bakery, 2 shops</Link>
            </div>
          </div>

          <div className="rise [animation-delay:120ms]">
            <figure className="rounded-xl border border-line bg-sheet p-5 shadow-[0_1px_0_rgba(30,42,51,0.08)]">
              <blockquote className="font-display text-[26px] font-bold leading-tight">
                “Tell me where AI saves me my evenings. Then I&apos;ll listen.”
              </blockquote>
              <figcaption className="mt-2 text-[16px] text-ink-2">Thomas, 52, painting business, 14 people, Lower Franconia</figcaption>
            </figure>
            <div className="squared mt-4 rounded-xl border border-line p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-bold">His AI Check Score</p>
                <p className="text-[14px] text-ink-2">example, estimates</p>
              </div>
              <Ruler value={67} label="AI Check Score 67 of 100" />
              <p className="mt-4 font-display text-[22px] font-extrabold leading-snug">≈ 33 hours and €2,100 a month he could win back</p>
              <ul className="mt-4 space-y-2.5 text-[16px]">
                <li className="flex flex-wrap items-center justify-between gap-2"><span>Quote drafts from photos + voice notes</span><Verdict v="now" /></li>
                <li className="flex flex-wrap items-center justify-between gap-2"><span>Callback assistant for missed calls</span><Verdict v="now" /></li>
                <li className="flex flex-wrap items-center justify-between gap-2"><span className="text-ink-2">Wall-painting robot</span><Verdict v="no" /></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Promises */}
        <section className="border-y border-line bg-sheet">
          <div className="mx-auto grid max-w-6xl gap-px bg-line px-0 sm:grid-cols-3">
            {promises.map((p) => (
              <div key={p.t} className="bg-sheet px-4 py-8 sm:px-6">
                <h2 className="font-display text-[22px] font-extrabold leading-tight">{p.t}</h2>
                <p className="mt-2 text-ink-2">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-[34px] font-extrabold">How it works</h2>
          <p className="mt-2 max-w-2xl text-ink-2">Fits into a full workday. No tech knowledge needed.</p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.t} className="relative border-t-4 border-ink pt-4">
                <span className="font-display text-[44px] font-black leading-none text-ruler-dark tnum">{i + 1}</span>
                <h3 className="mt-2 font-display text-[22px] font-extrabold">{s.t}</h3>
                <p className="mt-1 text-ink-2">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Why not ChatGPT */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-[34px] font-extrabold">Why not just ChatGPT?</h2>
            <p className="mt-2 max-w-2xl text-white/75">Thomas tried. He didn&apos;t know what to ask. That&apos;s not his fault.</p>
            <div className="mt-8 overflow-hidden rounded-xl border border-white/15">
              <div className="grid grid-cols-2 bg-white/5 text-[15px] font-bold text-white/70">
                <div className="px-4 py-3">Just ChatGPT</div>
                <div className="border-l border-white/15 px-4 py-3 text-ruler">MeisterBlick</div>
              </div>
              {vsChatGPT.map(([a, b]) => (
                <div key={a} className="grid grid-cols-2 border-t border-white/15 text-[16px] sm:text-[18px]">
                  <div className="px-4 py-4 text-white/70">{a}</div>
                  <div className="border-l border-white/15 px-4 py-4">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-[30px] font-extrabold leading-tight">Coming to you through your tax advisor, bank and chamber of crafts</h2>
          <p className="mt-2 max-w-2xl text-ink-2">Business owners trust people they already know. So we come through them. Planned partners, talks in progress:</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Tax advisors", "Savings & co-op banks", "Chamber of crafts", "Trade guilds"].map((p) => (
              <div key={p} className="rounded-lg border-2 border-dashed border-ink/25 px-4 py-5 text-center">
                <p className="font-bold">{p}</p>
                <p className="text-[14px] text-ink-2">planned partner</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-line bg-sheet">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-[34px] font-extrabold">Pricing</h2>
            <p className="mt-2 max-w-2xl text-ink-2">A cost you understand up front. Start free; pay only when you want help doing it.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pricing.map((p) => (
                <div key={p.name} className={`flex flex-col rounded-xl p-5 ${p.main ? "bg-ink text-white" : "border border-line bg-plaster/50"}`}>
                  <h3 className="font-display text-[20px] font-extrabold">{p.name}</h3>
                  <p className="mt-3 font-display text-[34px] font-black leading-none tnum">{p.price}</p>
                  <p className={`mt-1 text-[15px] ${p.main ? "text-white/70" : "text-ink-2"}`}>{p.note || " "}</p>
                  <ul className={`mt-4 flex-1 space-y-1.5 text-[16px] ${p.main ? "text-white/90" : ""}`}>
                    {p.items.map((i) => <li key={i}>– {i}</li>)}
                  </ul>
                  <ButtonLink href={p.href} variant={p.main ? "primary" : "secondary"} className={`mt-5 w-full ${p.main ? "!bg-ruler !text-ink !shadow-none hover:!bg-ruler-dark" : ""}`}>{p.cta}</ButtonLink>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border-2 border-go/40 bg-go-bg p-5">
              <p className="font-bold text-go">Option: Pay from savings</p>
              <p className="mt-1">30% of measured savings for the first 6 months, for proven use cases. No savings, no fee.</p>
            </div>
            <p className="mt-4 text-[15px] text-ink-2">Implementation goes through vetted partners. We earn a commission from them and tell you exactly how much. Our verdicts don&apos;t change because of it; “not worth it” earns us nothing, and we say it anyway.</p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-[34px] font-extrabold">What&apos;s built, what&apos;s coming next</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((r) => {
              const inner = (
                <>
                  <p className={`text-[14px] font-bold ${r.built ? "text-go" : "text-ink-2"}`}>{r.built ? "✅\u00a0 Built now" : "Coming next"}</p>
                  <h3 className="mt-1 font-display text-[19px] font-extrabold leading-tight">{r.t}</h3>
                  <p className="mt-1 text-[16px] text-ink-2">{r.d}</p>
                </>
              );
              const cls = `block rounded-xl p-4 ${r.built ? "border-2 border-ink bg-sheet" : "border border-dashed border-ink/30"}`;
              return r.href ? <Link key={r.t} href={r.href} className={`${cls} hover:border-blue`}>{inner}<span className="mt-2 inline-block font-bold text-blue underline underline-offset-4">Open it</span></Link> : <div key={r.t} className={cls}>{inner}</div>;
            })}
          </div>
        </section>

        {/* Moat */}
        <section className="border-t border-line bg-sheet">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-[34px] font-extrabold">Why this is hard to copy</h2>
              <p className="mt-4 text-[20px]">
                A competitor can build a chatbot. It&apos;s much harder to build verified knowledge of which automation works for which process, in which company, under which conditions, at what cost.
              </p>
            </div>
            <ol className="relative space-y-3" aria-label="Data flywheel">
              {["More customers", "More verified outcome data: ROI, failures, costs, reliability", "Smarter matching", "Better recommendations"].map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-lg border border-line bg-plaster/60 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ruler font-display font-black tnum">{i + 1}</span>
                  <span className="font-bold">{s}</span>
                </li>
              ))}
              <li className="pl-14 text-ink-2">…which brings more customers. The loop gets stronger with every check.</li>
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-[34px] font-extrabold">Ten minutes. One honest number.</h2>
          <div className="mt-6 flex justify-center">
            <ButtonLink href="/start" size="lg">Start free Quick Check (10 min)</ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
