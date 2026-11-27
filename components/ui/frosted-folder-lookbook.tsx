"use client"

import * as React from "react"

/* Frosted Folder Lookbook, adapted for MeisterBlick as the "results file".
   A translucent document folder lies on a dark workshop table with the company's name on the cover.
   It turns toward the pointer, a sheen crosses the plastic and the clips catch the light. Hovering lifts
   the sheets inside. Opening it pulls the binder clip off, swings the cover round its spine and slides
   4–6 feedback sheets out over the table: the top use cases, the first pilot and what's not worth it.
   Closing puts it all back.

   MeisterBlick changes to the original component:
   - sheets are feedback cards (verdict band, title, number, note) instead of photos; up to 6 sheets
   - 5–6 sheets lay out in two rows of three on wide screens, three rows of two on phones
   - smoky graphite plastic with a signal-orange edge on a graphite table; site fonts
   - a sheet with an `href` jumps to that section of the page when the file is open
   - the chrome wordmark widens to fit longer words such as "MeisterBlick" */

export type FolderSheetKind = "now" | "later" | "no" | "pilot"

export type FolderSheet = {
  kind: FolderSheetKind
  /** Small label at the right of the band, e.g. "No. 1". */
  code?: string
  title: string
  /** One or two short sentences. */
  note?: string
  /** Headline figure, e.g. "≈ €840". */
  big?: string
  /** Line under the headline figure, e.g. "per month · ≈ 12 h". */
  bigNote?: string
  /** Bottom line, e.g. "Pays back in 3 months". */
  foot?: string
  /** Where the sheet leads when picked from the open file: an in-page anchor ("#pilot") or a page URL. */
  href?: string
}

export type FrostedFolderLookbookProps = {
  /** Cover title, set in spaced capitals: the company name. */
  title?: string
  subtitle?: string
  /** Third cover line, e.g. the score and the date. */
  line?: string
  /** Small line at the bottom-left of the cover. */
  footer?: string
  /** Liquid chrome wordmark at the bottom-right of the cover. */
  wordmark?: string
  /** The sheets inside; the first six are used. */
  sheets?: FolderSheet[]
  openLabel?: string
  closeLabel?: string
  /** Plastic colour. */
  tint?: string
  /** Sheet paper colour. */
  paper?: string
  /** Stage colour. */
  background?: string
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  height?: string
  className?: string
}

const KIND_LABEL: Record<FolderSheetKind, string> = {
  now: "Do it now",
  later: "Later",
  no: "Not worth it",
  pilot: "First pilot",
}

const DEFAULT_SHEETS: FolderSheet[] = [
  { kind: "now", code: "No. 1", title: "Online booking for site visits", big: "≈ €610", bigNote: "per month · ≈ 8 h", foot: "Pays back in 1 month" },
  { kind: "now", code: "No. 2", title: "Quote drafts from your notes", big: "≈ €1,120", bigNote: "per month · ≈ 16 h", foot: "Pays back in 2 months" },
  { kind: "later", code: "No. 3", title: "Callback assistant for missed calls", big: "≈ €690", bigNote: "per month · ≈ 6 h", foot: "Pays back in 9 months" },
  { kind: "pilot", code: "2 weeks", title: "Quote drafts from your notes", note: "Low risk, live within days, and you see the time saved on the first quote." },
  { kind: "no", code: "Skip", title: "Painting robot", note: "Too few large flat walls for 14 people; it would stand still most weeks.", foot: "Payback: over 10 years" },
]

// #region geometry
/* Pure layout and motion maths: no DOM. The scene is a flat lay seen from above, so nothing "falls":
   things slide on the table, swing on the spine and settle on springs. step() advances the springs,
   pose() turns their state into positions. */
const ASPECT = 0.75
const SPINE = 0.07
const HINT_H = 30
const PRINT_RATIO = 1.36
const MAX_SHEETS = 6
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/* Blank pages that stay in the folder: centre offset, size (fractions of the folder) and angle. */
const PAPER = [
  { dx: 0.05, dy: -0.04, w: 0.9, h: 0.955, r: -1.6 },
  { dx: 0.062, dy: 0.004, w: 0.94, h: 0.93, r: 1.1 },
  { dx: 0.055, dy: 0.036, w: 0.86, h: 0.96, r: -0.5 },
]
/* The sheets on top of them: sideways offset (of the folder width) and angle of each in the stack. */
const STACK = [
  { dx: -0.02, r: -2.2 },
  { dx: 0.025, r: 1.4 },
  { dx: -0.01, r: -0.8 },
  { dx: 0.015, r: 0.6 },
  { dx: -0.018, r: 1.8 },
  { dx: 0.02, r: -1.2 },
]
const SPREAD_R = [-3, 1.6, -1.4, 2.8, -2, 1.2]

function layoutFor(W: number, H: number, n: number) {
  const compact = W < 700
  const g = compact ? 16 : W < 1100 ? 40 : 56
  const vp = compact ? 18 : 28
  // the folder sits midway between the top of the stage and the hint under it
  const cy = (H - vp - HINT_H) / 2
  const areaH = cy * 2 - vp * 2
  // wide stages fit the open spread and the set-aside clip beside it; on phones the opened cover hangs off the left edge
  const fh = Math.max(120, Math.round(compact ? Math.min(areaH / 1.14, (W - g * 2) / 1.1 / ASPECT) : Math.min(areaH / 1.3, H * 0.66, (W / 2 - g) / 1.23 / ASPECT)))
  const fw = Math.round(fh * ASPECT)
  const closed = { x: W / 2 - fw / 2, y: cy - fh / 2 }
  // sheets keep one size, in the folder and on the table; 5–6 sheets go in rows of three (two on phones)
  const cols = compact ? 2 : n > 4 ? 3 : Math.max(1, n)
  const rows = Math.ceil(Math.max(1, n) / cols)
  const gap = Math.max(12, Math.round(fw * 0.06))
  // a turned sheet is wider than its box: keep the turned corners inside the gutter too
  const turn = Math.sin(((compact ? 1.5 : 3) * Math.PI) / 180) * (PRINT_RATIO / 2)
  const spreadH = H - vp * 2 - HINT_H - gap * (rows - 1)
  const pw = Math.floor(Math.min((W - g * 2 - gap * (cols - 1)) / (cols + turn * 2), fw * 0.66, spreadH / rows / PRINT_RATIO))
  const ph = Math.round(pw * PRINT_RATIO)
  const cards = []
  for (let i = 0; i < n; i++) {
    const c = i % cols
    const r = Math.floor(i / cols)
    const inRow = Math.min(cols, n - r * cols)
    cards.push({
      x: W / 2 + (c - (inRow - 1) / 2) * (pw + gap),
      y: cy + (r - (rows - 1) / 2) * (ph + gap),
      r: compact ? SPREAD_R[i % SPREAD_R.length] * 0.5 : SPREAD_R[i % SPREAD_R.length],
    })
  }
  // binder clip: where its jaw sits on the folder edge, and where it comes to rest on the table once pulled off
  const bcW = fw * (compact ? 0.24 : 0.27)
  const jaw = { x: closed.x + fw - (bcW * 8) / 120, y: closed.y + fh * 0.415 }
  const hintTop = H - vp - HINT_H
  const rest = compact
    ? { x: W / 2 + fw * 0.3, y: closed.y + fh + (hintTop - closed.y - fh) * 0.52, r: -16 }
    : { x: jaw.x + fw * 0.43 + bcW * 0.92, y: closed.y + fh * 0.97, r: 18 }
  const via = compact ? { x: jaw.x + bcW * 0.55, y: jaw.y + (rest.y - jaw.y) * 0.35 } : { x: jaw.x + (rest.x - jaw.x) * 0.85, y: jaw.y }
  return { W, H, compact, g, vp, cy, fw, fh, closed, pw, ph, gap, cards, n, bcW, jaw, rest, via }
}

type Layout = ReturnType<typeof layoutFor>
type Motion = { cover: number; vc: number; clip: number; vk: number; prints: number[]; vp: number[] }

function restState(n: number, open: boolean): Motion {
  const v = open ? 1 : 0
  return { cover: v, vc: 0, clip: v, vk: 0, prints: Array.from({ length: n }, () => v), vp: Array.from({ length: n }, () => 0) }
}

/* Advance the springs by ms. Order comes from conditions, not from a clock:
   opening: the clip comes off, then the cover swings and lands, then sheets leave from the top of the stack;
   closing: sheets go home from the bottom of the stack, then the cover swings shut, then the clip goes back on.
   Returns true once everything is at rest. */
function step(S: Motion, open: boolean, ms: number) {
  const n = S.prints.length
  let left = Math.min(ms, 100) / 1000
  while (left > 1e-6) {
    const dt = Math.min(left, 0.008)
    left -= dt
    // clip: critically damped slide
    const clipTo = open || S.cover > 0.02 ? 1 : 0
    S.vk += ((clipTo - S.clip) * 110 - S.vk * 19) * dt
    S.clip += S.vk * dt
    // cover: swings on the spine toward a point just past the table, so it lands with speed and bounces once or twice
    let home = true
    for (let i = 0; i < n; i++) if (S.prints[i] > 0.06) home = false
    const coverTo = open ? (S.clip > 0.4 || S.cover > 0.001 ? 1.07 : -0.07) : home ? -0.07 : 1.07
    S.vc += ((coverTo - S.cover) * 22 - S.vc * 5.4) * dt
    S.cover += S.vc * dt
    if (S.cover > 1) {
      S.cover = 1
      S.vc = S.vc > 0.3 ? -S.vc * 0.3 : 0
    } else if (S.cover < 0) {
      S.cover = 0
      S.vc = S.vc < -0.3 ? -S.vc * 0.24 : 0
    }
    // sheets: each waits for its neighbour to get going, then slides out on a slightly springy pull
    for (let i = 0; i < n; i++) {
      const p = S.prints[i]
      const to = open
        ? (S.cover > 0.56 && (i === n - 1 || S.prints[i + 1] > 0.2)) || p > 0.02
          ? 1
          : 0
        : i === 0 || S.prints[i - 1] < 0.8 || p < 0.98
          ? 0
          : 1
      S.vp[i] += ((to - p) * 90 - S.vp[i] * 15.5) * dt
      S.prints[i] = p + S.vp[i] * dt
    }
  }
  const goal = open ? 1 : 0
  let still = Math.abs(S.clip - goal) < 0.002 && Math.abs(S.vk) < 0.02 && S.cover === goal && S.vc === 0
  for (let i = 0; i < n; i++) if (Math.abs(S.prints[i] - goal) > 0.002 || Math.abs(S.vp[i]) > 0.02) still = false
  if (still) {
    S.clip = goal
    S.vk = 0
    for (let i = 0; i < n; i++) {
      S.prints[i] = goal
      S.vp[i] = 0
    }
  }
  return still
}

/* lift: 0..1, how far a hover has raised the sheets inside the closed folder. */
function pose(L: Layout, S: Motion, lift: number) {
  const angle = clamp01(S.cover) * 180
  const cos = Math.cos((angle * Math.PI) / 180)
  // the camera keeps the whole folder centred as the cover unfolds to the left; on phones the back cover stays put
  const leftEdge = L.compact ? 0 : Math.min(0, SPINE * L.fw + (1 - SPINE) * L.fw * cos)
  const bx = L.W / 2 - (leftEdge + L.fw) / 2
  const by = L.closed.y
  const prints = []
  for (let i = 0; i < L.n; i++) {
    const k = STACK[i % STACK.length]
    const p = S.prints[i]
    const pc = clamp01(p)
    const hx = bx + L.fw * (0.535 + k.dx)
    const hy = by + L.fh * (0.04 + i * 0.012) + L.ph / 2 - lift * (1 - clamp01(S.cover * 6)) * (0.06 + 0.012 * i) * L.fh
    const c = L.cards[i]
    // a sliding sheet swings a little against its direction of travel and straightens as it stops
    const swing = Math.max(-5, Math.min(5, S.vp[i] * 1.5)) * (c.x < hx ? 1 : -1)
    prints.push({
      x: hx + (c.x - hx) * p,
      y: hy + (c.y - hy) * p,
      r: k.r + (c.r - k.r) * p + swing * Math.sin(pc * Math.PI),
      p,
    })
  }
  // clip: along a curve from the jaw position to its resting place, turning as it goes
  const u = Math.max(0, Math.min(1.02, S.clip))
  const jx = (1 - u) * (1 - u) * L.jaw.x + 2 * (1 - u) * u * L.via.x + u * u * L.rest.x
  const jy = (1 - u) * (1 - u) * L.jaw.y + 2 * (1 - u) * u * L.via.y + u * u * L.rest.y
  return {
    bx,
    by,
    angle,
    // the cover is edge-on at 90deg: its printed face and the sheet order change there, where neither shows
    front: angle < 90,
    // glare as the plastic swings through the light
    flash: Math.sin((angle * Math.PI) / 180) * 0.2,
    clip: { x: jx, y: jy, r: L.rest.r * u },
    prints,
  }
}
// #endregion

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")"

const CSS =
  ".ffl-root{position:relative;overflow:hidden;width:100%;background:var(--ffl-bg);color:#f1f1ee;font-family:var(--font-body),ui-sans-serif,system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;isolation:isolate}" +
  ".ffl-root img{max-width:none}" +
  ".ffl-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(52% 46% at 50% 47%,color-mix(in srgb,var(--ffl-tint) 14%,transparent),transparent 72%)}" +
  ".ffl-rig{position:absolute;inset:0;perspective:1900px}" +
  ".ffl-shell{position:absolute;left:0;top:0;perspective:2600px;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
  ".ffl-back{position:absolute;inset:0;z-index:1;border-radius:3px 11px 11px 3px;background:linear-gradient(180deg,color-mix(in srgb,var(--ffl-tint) 46%,#15191c),#1d2226 34%,#111417 70%,color-mix(in srgb,var(--ffl-tint) 52%,#15191c));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ffl-tint) 46%,transparent),0 40px 80px -30px rgba(0,0,0,.8)}" +
  ".ffl-tab{position:absolute;z-index:1;left:100%;top:52%;width:3.6%;height:25%;margin-left:-1px;border-radius:0 7px 7px 0;background:linear-gradient(180deg,color-mix(in srgb,var(--ffl-tint) 62%,#15191c),color-mix(in srgb,var(--ffl-tint) 36%,#15191c));box-shadow:inset -1px 0 0 color-mix(in srgb,var(--ffl-tint) 70%,#fff)}" +
  ".ffl-paper{position:absolute;z-index:1;border-radius:2px;background:linear-gradient(180deg,#e8ebe4,#d9ddd4);box-shadow:0 0 0 1px rgba(20,30,40,.12),0 6px 16px -8px rgba(0,0,0,.5)}" +
  ".ffl-ruled:after{content:'';position:absolute;inset:9% 11% 12%;background:repeating-linear-gradient(180deg,transparent 0 3.2%,rgba(30,42,51,.11) 3.2% 3.5%)}" +
  ".ffl-sheet{position:absolute;left:0;top:0;z-index:2;border-radius:3px}" +
  ".ffl-sheet:focus-visible{outline:2px solid #ff5b14;outline-offset:3px}" +
  ".ffl-in{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;background:var(--ffl-paper);color:#15191c;font-size:var(--ffl-c);line-height:1.25;border-radius:3px;box-shadow:0 0 0 1px rgba(20,30,40,.16),0 10px 24px -10px rgba(0,0,0,.62);transition:transform .38s cubic-bezier(.2,.8,.2,1),box-shadow .38s}" +
  ".ffl-band{flex:none;display:flex;align-items:center;justify-content:space-between;gap:.6em;padding:.55em .85em;font-size:.82em;font-weight:700;color:#fff;white-space:nowrap}" +
  ".ffl-band[data-k='now']{background:#1d7348}.ffl-band[data-k='later']{background:#8a5f00}.ffl-band[data-k='no']{background:#b3261e}.ffl-band[data-k='pilot']{background:#ff5b14;color:#15191c}" +
  ".ffl-code{font-weight:600;opacity:.85}" +
  ".ffl-body{flex:1 1 0;min-height:0;display:flex;flex-direction:column;padding:.75em .85em .8em}" +
  ".ffl-name{flex:none;margin:0;font-family:var(--font-display),ui-sans-serif,system-ui,sans-serif;font-stretch:87.5%;font-weight:800;font-size:1.14em;line-height:1.14;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}" +
  ".ffl-note{flex:0 1 auto;min-height:0;margin:.5em 0 0;font-size:.88em;line-height:1.3;color:#575e64;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}" +
  ".ffl-note:has(+.ffl-big){-webkit-line-clamp:3}" +
  ".ffl-big{flex:none;margin:auto 0 0;padding-top:.4em;font-family:var(--font-display),ui-sans-serif,system-ui,sans-serif;font-weight:900;font-size:1.9em;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap}" +
  ".ffl-bignote{flex:none;margin:.25em 0 0;font-size:.82em;color:#575e64;white-space:nowrap}" +
  ".ffl-foot-line{flex:none;margin:.6em 0 0;padding-top:.5em;border-top:1px solid #dcddd8;font-size:.82em;font-weight:700;line-height:1.25;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}" +
  ".ffl-note+.ffl-foot-line{margin-top:auto}" +
  ".ffl-open .ffl-sheet[data-link='1']{cursor:pointer}" +
  ".ffl-open .ffl-sheet:hover .ffl-in{transform:translateY(-8px);box-shadow:0 0 0 1px rgba(20,30,40,.14),0 26px 44px -14px rgba(0,0,0,.7)}" +
  ".ffl-cover{position:absolute;z-index:3;top:0;bottom:0;right:0;border-radius:2px 11px 11px 2px;" +
  "background:linear-gradient(90deg,color-mix(in srgb,var(--ffl-tint) 30%,transparent),transparent 9%,transparent 93%,color-mix(in srgb,var(--ffl-tint) 26%,transparent))," +
  "linear-gradient(180deg,color-mix(in srgb,var(--ffl-tint) 50%,rgba(29,34,38,.5)),rgba(29,34,38,.93) 18%,rgba(17,20,23,.97) 56%,rgba(25,29,33,.93) 80%,color-mix(in srgb,var(--ffl-tint) 60%,rgba(25,29,33,.7)));" +
  "-webkit-backdrop-filter:blur(7px) saturate(1.15);backdrop-filter:blur(7px) saturate(1.15);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ffl-tint) 62%,transparent),inset 0 0 46px color-mix(in srgb,var(--ffl-tint) 20%,transparent)}" +
  ".ffl-cover:before{content:'';position:absolute;inset:0;border-radius:inherit;background-image:" + "NOISE_URL" + ";opacity:.11;mix-blend-mode:overlay;pointer-events:none}" +
  ".ffl-sheen{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(100deg,transparent 22%,rgba(255,244,236,var(--ffl-fl)) 50%,transparent 78%),radial-gradient(60% 46% at var(--ffl-lx) var(--ffl-ly),rgba(255,236,226,.22),rgba(255,236,226,.05) 46%,transparent 70%)}" +
  ".ffl-face{position:absolute;inset:0}" +
  ".ffl-head{position:absolute;left:13.5%;right:8%;top:30.5%;display:grid;row-gap:.9em;text-transform:uppercase;font-size:var(--ffl-s);letter-spacing:.3em;line-height:1.3;color:rgba(241,241,238,.86)}" +
  ".ffl-title{margin:0 0 .25em;font-size:var(--ffl-t);font-weight:600;letter-spacing:.2em;line-height:1.3;color:#ffffff;overflow-wrap:anywhere}" +
  ".ffl-head p{margin:0}" +
  ".ffl-rule{display:block;width:2.6em;height:3px;border-radius:2px;background:#ff5b14;margin-bottom:.4em}" +
  ".ffl-foot{position:absolute;left:13.5%;right:8%;bottom:4.2%;display:flex;align-items:center;justify-content:space-between;gap:6%}" +
  ".ffl-foot p{margin:0;flex:none;text-transform:uppercase;font-size:var(--ffl-s);letter-spacing:.3em;line-height:1;color:rgba(241,241,238,.8)}" +
  ".ffl-mark{flex:0 1 58%;min-width:0;height:auto;display:block;overflow:visible}" +
  ".ffl-spine{position:absolute;z-index:4;left:0;top:0;bottom:0;border-radius:3px 0 0 3px;pointer-events:none;background:linear-gradient(90deg,rgba(250,250,248,.92),rgba(214,214,210,.62) 30%,rgba(244,244,240,.74) 34%,rgba(190,190,184,.5) 63%,rgba(238,238,234,.6) 67%,rgba(160,160,154,.36));box-shadow:inset 1px 0 0 rgba(250,252,255,.8),-10px 0 26px -12px rgba(220,220,214,.35)}" +
  ".ffl-pclip{position:absolute;left:5.6%;overflow:visible;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}" +
  ".ffl-bclip{position:absolute;z-index:9;left:0;top:0;overflow:visible;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(0,0,0,.5))}" +
  ".ffl-hint{position:absolute;left:0;right:0;margin:0 auto;width:max-content;display:flex;align-items:center;gap:.8em;padding:0 16px;border:0;background:none;cursor:pointer;color:rgba(241,241,238,.78);font:inherit;font-size:14px;font-weight:700;line-height:1;letter-spacing:.14em;text-transform:uppercase;border-radius:999px;transition:color .25s}" +
  ".ffl-hint:hover{color:#fff}" +
  ".ffl-hint:focus-visible{outline:2px solid #ff5b14;outline-offset:2px}" +
  ".ffl-hint i{display:block;width:7px;height:7px;border-radius:50%;background:#ff5b14;box-shadow:0 0 10px #ff5b14}" +
  "@media (prefers-reduced-motion:reduce){.ffl-in,.ffl-hint{transition:none}.ffl-open .ffl-sheet:hover .ffl-in{transform:none}}"

const STYLE = CSS.replace("NOISE_URL", NOISE)

export function FrostedFolderLookbook({
  title = "Becker Malerbetrieb",
  subtitle = "AI Check results",
  line = "Score 62 / 100",
  footer = "Estimates only",
  wordmark = "MeisterBlick",
  sheets = DEFAULT_SHEETS,
  openLabel = "Open your file",
  closeLabel = "Close file",
  tint = "#ff5b14",
  paper = "#fbfbf8",
  background = "#15191c",
  defaultOpen = false,
  onOpenChange,
  height = "100svh",
  className,
}: FrostedFolderLookbookProps) {
  const list = React.useMemo(() => sheets.slice(0, MAX_SHEETS), [sheets])
  const n = list.length
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const [open, setOpen] = React.useState(defaultOpen)
  const [L, setL] = React.useState(null as Layout | null)

  const rootRef = React.useRef(null as HTMLDivElement | null)
  const shellRef = React.useRef(null as HTMLDivElement | null)
  const coverRef = React.useRef(null as HTMLDivElement | null)
  const faceRef = React.useRef(null as HTMLDivElement | null)
  const bclipRef = React.useRef(null as SVGSVGElement | null)
  const sheetRefs = React.useRef([] as (HTMLDivElement | null)[])
  const gradRef = React.useRef(null as SVGLinearGradientElement | null)
  const lightRef = React.useRef(null as SVGFEDistantLightElement | null)
  const glossRef = React.useRef(null as SVGRectElement | null)
  const m = React.useRef({
    L: null as Layout | null, S: restState(n, defaultOpen), open: defaultOpen, raf: 0, last: 0, reduced: false,
    mx: 0, my: 0, tx: 0, ty: 0, vx: 0, vy: 0, hover: 0, lift: 0, vl: 0,
  })

  const paint = React.useCallback(() => {
    const s = m.current
    const lay = s.L
    const shell = shellRef.current
    const cover = coverRef.current
    if (!lay || !shell || !cover) return
    const P = pose(lay, s.S, s.lift)
    const amp = 10 - 7.5 * (P.angle / 180)
    shell.style.transformOrigin = (lay.W / 2 - P.bx).toFixed(1) + "px " + (lay.cy - P.by).toFixed(1) + "px"
    shell.style.transform =
      "translate3d(" + P.bx.toFixed(2) + "px," + P.by.toFixed(2) + "px,0) rotateX(" + (-s.ty * amp).toFixed(3) + "deg) rotateY(" + (s.tx * amp).toFixed(3) + "deg)"
    shell.style.setProperty("--ffl-lx", (50 + s.tx * 40).toFixed(1) + "%")
    shell.style.setProperty("--ffl-ly", (38 + s.ty * 34).toFixed(1) + "%")
    shell.style.setProperty("--ffl-fl", P.flash.toFixed(3))
    cover.style.transform = "rotateY(" + (-P.angle).toFixed(2) + "deg)"
    if (faceRef.current) faceRef.current.style.opacity = P.front ? "1" : "0"
    for (let i = 0; i < P.prints.length; i++) {
      const el = sheetRefs.current[i]
      if (!el) continue
      const q = P.prints[i]
      // inside the folder the sheets sit deeper than the cover, so they slide a little against it as it tilts
      const deep = (1 - Math.max(0, Math.min(1, q.p))) * lay.fw * 0.007 * (1 + i * 0.2)
      el.style.transform =
        "translate3d(" + (q.x - lay.pw / 2 - P.bx - s.tx * deep).toFixed(2) + "px," + (q.y - lay.ph / 2 - P.by - s.ty * deep).toFixed(2) + "px,0) rotate(" + q.r.toFixed(3) + "deg)"
      el.style.zIndex = P.front ? "2" : "6"
    }
    // the clip lies on the table, not on the folder: take the folder's own travel back out
    const bc = bclipRef.current
    if (bc) bc.style.transform = "translate3d(" + (P.clip.x - lay.jaw.x - (P.bx - lay.closed.x)).toFixed(2) + "px," + (P.clip.y - lay.jaw.y).toFixed(2) + "px,0) rotate(" + P.clip.r.toFixed(2) + "deg)"
    // the metal follows the light
    if (gradRef.current) gradRef.current.setAttribute("gradientTransform", "rotate(" + (18 + s.tx * 50 + s.ty * 24).toFixed(1) + " .5 .5)")
    if (lightRef.current) lightRef.current.setAttribute("azimuth", (235 + s.tx * 70).toFixed(1))
    if (glossRef.current) glossRef.current.setAttribute("x", (86 + s.tx * 9).toFixed(1))
  }, [])

  const kick = React.useCallback(() => {
    const s = m.current
    if (s.raf) return
    s.last = 0
    const tick = () => {
      const now = performance.now()
      const dt = s.last ? Math.min(100, now - s.last) : 16
      s.last = now
      let still = true
      if (s.reduced) {
        s.S = restState(s.S.prints.length, s.open)
        s.tx = s.ty = s.vx = s.vy = s.lift = s.vl = 0
      } else {
        still = step(s.S, s.open, dt)
        // tilt and lift ride on springs too, so the folder has some weight when the pointer moves
        let left = dt / 1000
        while (left > 1e-6) {
          const h = Math.min(left, 0.008)
          left -= h
          s.vx += ((s.mx - s.tx) * 70 - s.vx * 11.5) * h
          s.tx += s.vx * h
          s.vy += ((s.my - s.ty) * 70 - s.vy * 11.5) * h
          s.ty += s.vy * h
          s.vl += ((s.hover - s.lift) * 150 - s.vl * 14) * h
          s.lift += s.vl * h
        }
        if (Math.abs(s.mx - s.tx) > 0.002 || Math.abs(s.my - s.ty) > 0.002 || Math.abs(s.vx) > 0.01 || Math.abs(s.vy) > 0.01) still = false
        if (Math.abs(s.hover - s.lift) > 0.003 || Math.abs(s.vl) > 0.01) still = false
      }
      paint()
      s.raf = still ? 0 : requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)
  }, [paint])

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    m.current.reduced = mq.matches
    const onMq = () => {
      m.current.reduced = mq.matches
      kick()
    }
    mq.addEventListener("change", onMq)
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect
      if (r.width < 10 || r.height < 10) return
      const lay = layoutFor(r.width, r.height, n)
      m.current.L = lay
      if (m.current.S.prints.length !== n) m.current.S = restState(n, m.current.open)
      setL(lay)
    })
    ro.observe(el)
    const state = m.current
    return () => {
      ro.disconnect()
      mq.removeEventListener("change", onMq)
      cancelAnimationFrame(state.raf)
      state.raf = 0
    }
  }, [n, kick])

  React.useLayoutEffect(() => {
    paint()
  }, [L, paint])

  const toggle = React.useCallback(
    (next?: boolean) => {
      const s = m.current
      const to = next === undefined ? !s.open : next
      if (to === s.open) return
      s.open = to
      if (to) s.hover = 0
      setOpen(to)
      if (onOpenChange) onOpenChange(to)
      kick()
    },
    [kick, onOpenChange],
  )

  // Escape closes it wherever the focus is
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, toggle])

  const jump = (href?: string) => {
    if (!href) return
    if (!href.startsWith("#")) {
      window.location.assign(href)
      return
    }
    const target = document.getElementById(href.slice(1))
    if (target) target.scrollIntoView({ behavior: m.current.reduced ? "auto" : "smooth", block: "start" })
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = m.current
    if (e.pointerType !== "mouse" || s.reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    s.mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
    s.my = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
    kick()
  }
  const onPointerLeave = () => {
    const s = m.current
    s.mx = s.my = 0
    s.hover = 0
    kick()
  }
  const onHover = (v: number) => (e: React.PointerEvent) => {
    const s = m.current
    if (e.pointerType !== "mouse" || s.reduced) return
    s.hover = s.open ? 0 : v
    kick()
  }

  const fw = L ? L.fw : 0
  const fh = L ? L.fh : 0
  const pw = L ? L.pw : 0
  const vars = {
    "--ffl-bg": background,
    "--ffl-tint": tint,
    "--ffl-paper": paper,
    "--ffl-t": (L ? Math.max(12, Math.min(20, fw * 0.036)) : 13).toFixed(2) + "px",
    "--ffl-s": (L ? Math.max(8, Math.min(11, fw * 0.019)) : 9).toFixed(2) + "px",
    "--ffl-c": (L ? Math.max(10.5, Math.min(15, pw * 0.072)) : 12).toFixed(2) + "px",
    "--ffl-lx": "50%",
    "--ffl-ly": "38%",
    "--ffl-fl": "0",
  } as React.CSSProperties
  const pcH = fh * 0.17
  const bcW = L ? L.bcW : 0
  // the chrome wordmark gets a wider box for longer words, so the letters are not squeezed
  const markW = Math.max(300, (wordmark?.length ?? 0) * 40)

  return (
    <div
      ref={rootRef}
      className={"ffl-root" + (open ? " ffl-open" : "") + (className ? " " + className : "")}
      style={{ ...vars, height, minHeight: height }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="ffl-glow" aria-hidden="true" />
      <div className="ffl-rig" style={{ visibility: L ? "visible" : "hidden" }}>
        <div
          ref={shellRef}
          className="ffl-shell"
          style={{ width: fw, height: fh }}
          onClick={() => toggle()}
          onPointerEnter={onHover(1)}
          onPointerLeave={onHover(0)}
        >
          <div className="ffl-back" aria-hidden="true" />
          {L && !L.compact ? <div className="ffl-tab" aria-hidden="true" /> : null}
          {PAPER.map((k, i) => (
            <div
              key={i}
              className={"ffl-paper" + (i === PAPER.length - 1 ? " ffl-ruled" : "")}
              aria-hidden="true"
              style={{
                left: ((0.5 + k.dx - k.w / 2) * 100).toFixed(2) + "%",
                top: ((0.5 + k.dy - k.h / 2) * 100).toFixed(2) + "%",
                width: (k.w * 100).toFixed(2) + "%",
                height: (k.h * 100).toFixed(2) + "%",
                transform: "rotate(" + k.r + "deg)",
              }}
            />
          ))}
          {list.map((sh, i) => {
            const link = open && !!sh.href
            return (
              <div
                key={i}
                ref={(el) => {
                  sheetRefs.current[i] = el
                }}
                className="ffl-sheet"
                style={{ width: pw, height: L ? L.ph : 0 }}
                role={link ? "link" : "group"}
                tabIndex={link ? 0 : -1}
                data-link={link ? "1" : "0"}
                aria-label={KIND_LABEL[sh.kind] + ": " + sh.title + (link ? ". Show details" : "")}
                aria-hidden={!open}
                onClick={(e) => {
                  if (!m.current.open) return
                  e.stopPropagation()
                  jump(sh.href)
                }}
                onKeyDown={(e) => {
                  if (link && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    jump(sh.href)
                  }
                }}
              >
                <div className="ffl-in">
                  <div className="ffl-band" data-k={sh.kind}>
                    <span>{KIND_LABEL[sh.kind]}</span>
                    {sh.code ? <span className="ffl-code">{sh.code}</span> : null}
                  </div>
                  <div className="ffl-body">
                    <h3 className="ffl-name">{sh.title}</h3>
                    {sh.note ? <p className="ffl-note">{sh.note}</p> : null}
                    {sh.big ? <p className="ffl-big">{sh.big}</p> : null}
                    {sh.bigNote ? <p className="ffl-bignote">{sh.bigNote}</p> : null}
                    {sh.foot ? <p className="ffl-foot-line">{sh.foot}</p> : null}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={coverRef} className="ffl-cover" style={{ left: SPINE * 100 + "%", transformOrigin: "0 50%" }}>
            <div className="ffl-sheen" aria-hidden="true" />
            <div ref={faceRef} className="ffl-face">
              <div className="ffl-head">
                <span className="ffl-rule" aria-hidden="true" />
                <h2 className="ffl-title">{title}</h2>
                {subtitle ? <p>{subtitle}</p> : null}
                {line ? <p>{line}</p> : null}
              </div>
              <div className="ffl-foot">
                {footer ? <p>{footer}</p> : <span />}
                {wordmark ? (
                  <svg className="ffl-mark" viewBox={"0 0 " + markW + " 84"} role="img" aria-label={wordmark}>
                    <defs>
                      <linearGradient id={uid + "c"} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#ffffff" />
                        <stop offset=".42" stopColor="#b9b9b4" />
                        <stop offset=".56" stopColor="#fafaf8" />
                        <stop offset="1" stopColor="#8c8c86" />
                      </linearGradient>
                      <filter id={uid + "f"} x="-8%" y="-30%" width="116%" height="160%" colorInterpolationFilters="sRGB">
                        <feTurbulence type="fractalNoise" baseFrequency="0.016 0.03" numOctaves="2" seed="4" result="n" />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale={markW > 300 ? 9 : 20} xChannelSelector="R" yChannelSelector="G" result="d" />
                        <feGaussianBlur in="d" stdDeviation="1.5" result="b" />
                        <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" result="goo" />
                        <feGaussianBlur in="goo" stdDeviation="1.6" result="h" />
                        <feSpecularLighting in="h" surfaceScale="4" specularConstant="1.25" specularExponent="18" lightingColor="#ffffff" result="s">
                          <feDistantLight ref={lightRef} azimuth="235" elevation="44" />
                        </feSpecularLighting>
                        <feComposite in="s" in2="goo" operator="in" result="sp" />
                        <feComposite in="goo" in2="sp" operator="arithmetic" k1="0" k2="0.78" k3="0.7" k4="0" />
                      </filter>
                    </defs>
                    <text
                      x={markW / 2} y="60" textAnchor="middle" textLength={markW - 30} lengthAdjust="spacingAndGlyphs"
                      fontFamily="'Arial Black','Helvetica Neue',Impact,system-ui,sans-serif" fontWeight="900" fontStyle="italic" fontSize="60"
                      fill="none" stroke={"url(#" + uid + "c)"} strokeWidth="4.6" strokeLinejoin="round" filter={"url(#" + uid + "f)"}
                    >
                      {wordmark}
                    </text>
                  </svg>
                ) : null}
              </div>
              <svg className="ffl-pclip" viewBox="0 0 24 94" width={pcH * (24 / 94)} height={pcH} style={{ top: -pcH * 0.13 }} aria-hidden="true">
                <defs>
                  <linearGradient ref={gradRef} id={uid + "p"} x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(18 .5 .5)">
                    <stop offset="0" stopColor="#8fa1a6" />
                    <stop offset=".3" stopColor="#f6fbfc" />
                    <stop offset=".5" stopColor="#7c8d92" />
                    <stop offset=".72" stopColor="#eef6f7" />
                    <stop offset="1" stopColor="#6d7d82" />
                  </linearGradient>
                </defs>
                <path d="M9 26V72a4.5 4.5 0 0 0 9 0V12a8 8 0 0 0-16 0V80a10 10 0 0 0 20 0V30" fill="none" stroke={"url(#" + uid + "p)"} strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="ffl-spine" style={{ width: SPINE * 100 + "%" }} aria-hidden="true" />
          <svg
            ref={bclipRef}
            className="ffl-bclip"
            viewBox="0 0 120 64"
            width={bcW}
            height={bcW * (64 / 120)}
            style={{ marginLeft: fw - bcW * (104 / 120), marginTop: fh * 0.415 - bcW * (32 / 120), transformOrigin: "80% 50%" }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={uid + "w"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f3f8f9" />
                <stop offset=".5" stopColor="#8b9a9f" />
                <stop offset="1" stopColor="#dfe9eb" />
              </linearGradient>
              <linearGradient id={uid + "b"} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#2c3134" />
                <stop offset=".35" stopColor="#0c0e0f" />
                <stop offset="1" stopColor="#1b1f21" />
              </linearGradient>
              <linearGradient id={uid + "g"} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset=".5" stopColor="#ffffff" stopOpacity=".5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <clipPath id={uid + "k"}>
                <path d="M76 5h30a5 5 0 0 1 5 5v44a5 5 0 0 1-5 5H76z" />
              </clipPath>
            </defs>
            <path d="M80 15C60 19 46 27 31 23.5a9 9 0 1 0 0 17C46 37 60 45 80 49" fill="none" stroke={"url(#" + uid + "w)"} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M76 5h30a5 5 0 0 1 5 5v44a5 5 0 0 1-5 5H76z" fill={"url(#" + uid + "b)"} />
            <g clipPath={"url(#" + uid + "k)"}>
              <rect ref={glossRef} x="86" y="5" width="9" height="54" fill={"url(#" + uid + "g)"} />
            </g>
            <path d="M76 5v54" stroke="#3b4246" strokeWidth="1.4" />
          </svg>
        </div>
      </div>
      <button type="button" className="ffl-hint" style={{ bottom: L ? L.vp : 18, height: HINT_H }} aria-expanded={open} onClick={() => toggle()}>
        <i aria-hidden="true" />
        {open ? closeLabel : openLabel}
      </button>
    </div>
  )
}

export default FrostedFolderLookbook
