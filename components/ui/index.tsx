import Link from "next/link";
import type { ReactNode } from "react";

const INK = "#14302e";
const SIGNAL = "#e2ad4a";

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 font-display text-[19px] font-extrabold tracking-tight ${onDark ? "text-white" : "text-ink"}`} aria-label="MeisterBlick home">
      {/* a folded carpenter's ruler: two hinged segments */}
      <svg aria-hidden width="28" height="20" viewBox="0 0 30 22">
        <rect x="1" y="12" width="28" height="9" rx="1" fill={SIGNAL} stroke={INK} strokeWidth="1.2" />
        <rect x="1" y="2" width="20" height="9" rx="1" fill={SIGNAL} stroke={INK} strokeWidth="1.2" transform="rotate(-14 2 11)" />
        {[5, 9, 13, 17, 21, 25].map((x) => <line key={x} x1={x} x2={x} y1="12" y2={x % 2 ? 15 : 17} stroke={INK} strokeWidth="1" />)}
      </svg>
      MeisterBlick
    </Link>
  );
}

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-plaster">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {right ?? (
          <nav className="flex items-center gap-1 text-[16px]">
            <Link href="/#how" className="hidden px-3 py-2 text-ink-2 hover:text-ink sm:block">How it works</Link>
            <Link href="/#pricing" className="hidden px-3 py-2 text-ink-2 hover:text-ink sm:block">Pricing</Link>
            <Link href="/funding" className="hidden px-3 py-2 text-ink-2 hover:text-ink sm:block">Funding</Link>
            <ButtonLink href="/start" size="sm">Start free check</ButtonLink>
          </nav>
        )}
      </div>
    </header>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "signal" | "ruler";

export function ButtonLink({
  href, children, variant = "primary", size = "md", className = "", onClick,
}: {
  href: string; children: ReactNode; variant?: Variant; size?: "sm" | "md" | "lg"; className?: string; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={`${btn(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}

export function btn(variant: Variant = "primary", size: "sm" | "md" | "lg" = "md") {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "h-10 px-4 text-[15px]", md: "h-12 px-6 text-[17px]", lg: "h-14 px-8 text-[18px]" };
  const variants: Record<Variant, string> = {
    primary: "bg-ink text-white hover:bg-black",
    signal: "bg-signal text-white hover:bg-signal-dark",
    ruler: "bg-ruler text-ink hover:bg-ruler-dark",
    secondary: "bg-transparent text-ink border border-ink/30 hover:border-ink",
    ghost: "text-ink underline underline-offset-4 decoration-2 hover:decoration-signal",
  };
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

export function Verdict({ v }: { v: "now" | "later" | "no" }) {
  const m = {
    now: { t: "Do it now", c: "text-go", d: "bg-go" },
    later: { t: "Later", c: "text-later", d: "bg-later" },
    no: { t: "Not worth it", c: "text-no", d: "bg-no" },
  }[v];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-current/25 px-3 py-1 text-[15px] font-bold ${m.c}`}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${m.d}`} />
      {m.t}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-line px-3 py-1 text-[14px] font-bold text-ink-2">{children}</span>;
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
    ticks.push(<line key={i} x1={i * 10} x2={i * 10} y1={0} y2={h} stroke={INK} strokeWidth={i % 10 === 0 ? 1.6 : 1} vectorEffect="non-scaling-stroke" />);
  }
  return (
    <div className="relative overflow-x-clip pt-9" aria-label={label ?? `${value} of ${max}`} role="img">
      <div className={`relative h-14 rounded-[2px] bg-ruler ${animate ? "unfold" : ""}`}>
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {ticks}
        </svg>
        {[20, 40, 60, 80].map((j) => (
          <span key={j} aria-hidden className="absolute top-0 h-full w-px bg-ink/35" style={{ left: `${j}%` }} />
        ))}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((n) => (
          <span key={n} aria-hidden className="tnum absolute top-[26px] -translate-x-1/2 font-display text-[11px] font-bold text-ink sm:text-[13px]" style={{ left: `${n}%` }}>
            {Math.round((n / 100) * max)}
          </span>
        ))}
      </div>
      {/* pencil mark */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 transition-transform duration-700 ease-out" style={{ transform: `translateX(${pct}%)` }}>
        <div className="absolute -top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-0.5 font-display text-[15px] font-extrabold text-white tnum">
          {value}
        </div>
        <div className="absolute top-7 bottom-0 w-[3px] -translate-x-1/2 bg-ink" />
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-[15px] text-ink-2 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3">Vendor-neutral AI advice for craft businesses, from Schweinfurt. All figures are estimates.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 font-bold text-ink">
          <li><Link className="hover:text-signal-dark" href="/start">Free check</Link></li>
          <li><Link className="hover:text-signal-dark" href="/results?example=becker">Example results</Link></li>
          <li><Link className="hover:text-signal-dark" href="/#pricing">Pricing</Link></li>
          <li><Link className="hover:text-signal-dark" href="/funding">Funding</Link></li>
        </ul>
      </div>
    </footer>
  );
}
