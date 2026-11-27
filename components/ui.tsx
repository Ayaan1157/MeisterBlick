import Link from "next/link";
import type { ReactNode } from "react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink">
      <span aria-hidden className="inline-flex h-7 w-11 items-center justify-center rounded-[3px] bg-ruler text-[13px] font-black text-ink shadow-[inset_0_-3px_0_rgba(0,0,0,0.12)]">
        AI
      </span>
      Check
    </Link>
  );
}

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="no-print border-b border-line/80 bg-plaster/90 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {right ?? (
          <nav className="flex items-center gap-1 text-[16px]">
            <Link href="/#pricing" className="hidden rounded-md px-3 py-2 text-ink-2 hover:text-ink sm:block">Pricing</Link>
            <Link href="/#how" className="hidden rounded-md px-3 py-2 text-ink-2 hover:text-ink sm:block">How it works</Link>
            <ButtonLink href="/start" size="sm">Start Quick Check</ButtonLink>
          </nav>
        )}
      </div>
    </header>
  );
}

export function ButtonLink({
  href, children, variant = "primary", size = "md", className = "", onClick,
}: {
  href: string; children: ReactNode; variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg"; className?: string; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={`${btn(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}

export function btn(variant: "primary" | "secondary" | "ghost" = "primary", size: "sm" | "md" | "lg" = "md") {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "h-10 px-4 text-[16px]", md: "h-12 px-5 text-[17px]", lg: "h-14 px-7 text-[19px]" };
  const variants = {
    primary: "bg-blue text-white hover:bg-blue-dark shadow-[0_2px_0_#183559]",
    secondary: "bg-sheet text-ink border-2 border-ink/80 hover:bg-plaster",
    ghost: "text-blue hover:bg-blue/5 underline underline-offset-4 decoration-2",
  };
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

export function Verdict({ v }: { v: "now" | "later" | "no" }) {
  const m = {
    now: { t: "Do it now", i: "✅", c: "bg-go-bg text-go border-go/30" },
    later: { t: "Later", i: "⏳", c: "bg-later-bg text-later border-later/30" },
    no: { t: "Not worth it", i: "❌", c: "bg-no-bg text-no border-no/30" },
  }[v];
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[15px] font-bold ${m.c}`}>
      <span aria-hidden>{m.i}</span>
      {m.t}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-md bg-plaster px-2 py-1 text-[14px] font-bold text-ink-2">{children}</span>;
}

export function Estimate({ className = "" }: { className?: string }) {
  return <span className={`text-[13px] text-ink-2 ${className}`}>estimate</span>;
}

/** The folding ruler. One bold element; it measures the result. */
export function Ruler({ value, max = 100, label, animate = true }: { value: number; max?: number; label?: string; animate?: boolean }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const ticks = [];
  for (let i = 0; i <= 100; i++) {
    const h = i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10;
    ticks.push(<line key={i} x1={i * 10} x2={i * 10} y1={0} y2={h} stroke="#1e2a33" strokeWidth={i % 10 === 0 ? 1.6 : 1} vectorEffect="non-scaling-stroke" />);
  }
  return (
    <div className="relative overflow-x-clip pt-9" aria-label={label ?? `${value} of ${max}`} role="img">
      <div className={`relative h-14 rounded-[3px] bg-ruler shadow-[inset_0_-4px_0_rgba(0,0,0,0.10),0_1px_0_rgba(0,0,0,0.2)] ${animate ? "unfold" : ""}`}>
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {ticks}
        </svg>
        {[20, 40, 60, 80].map((j) => (
          <span key={j} aria-hidden className="absolute top-0 h-full w-px bg-ink/30" style={{ left: `${j}%` }}>
            <span className="absolute bottom-[3px] -left-[3px] h-[6px] w-[6px] rounded-full bg-ruler-dark ring-1 ring-ink/30" />
          </span>
        ))}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((n) => (
          <span key={n} aria-hidden className="tnum absolute top-[26px] -translate-x-1/2 font-display text-[11px] font-bold text-ink/80 sm:text-[13px]" style={{ left: `${n}%` }}>
            {Math.round((n / 100) * max)}
          </span>
        ))}
      </div>
      {/* pencil mark */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 transition-transform duration-700 ease-out" style={{ transform: `translateX(${pct}%)` }}>
        <div className="absolute -top-0 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-0.5 font-display text-[15px] font-extrabold text-white tnum">
          {value}
        </div>
        <div className="absolute top-7 bottom-0 w-[3px] -translate-x-1/2 bg-ink" />
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-line bg-sheet">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-[16px] text-ink-2 sm:grid-cols-3 sm:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs">Honest, vendor-neutral AI advice for craft businesses. Built in Schweinfurt.</p>
        </div>
        <div>
          <p className="font-bold text-ink">Good to know</p>
          <p className="mt-2">All figures are estimates. Funding is checked case by case. Implementation through vetted partners; we earn a disclosed commission.</p>
        </div>
        <div>
          <p className="font-bold text-ink">Try it</p>
          <ul className="mt-2 space-y-1">
            <li><Link className="underline underline-offset-4" href="/start">Free Quick Check</Link></li>
            <li><Link className="underline underline-offset-4" href="/start?example=becker">Example: painter, 14 people</Link></li>
            <li><Link className="underline underline-offset-4" href="/invest">Smart Investment Selector</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
