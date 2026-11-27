"use client"

import * as React from "react"

/**
 * HelixRibbonHero, adapted for MeisterBlick from the portfolio hero by Kedhareswer.
 *
 * A flat signal-orange field. The headline lands letter by letter beside a small mark;
 * scrolling pulls its two lines apart while a ribbon of AI tool cards, bent around a
 * helix, rises through the screen and spins past ("everything you get offered"). When it
 * has gone, six answer cards for one business drop into a captioned grid.
 *
 * MeisterBlick changes to the original:
 * - separate `grid` cards (the answers) from the `projects` ribbon (the tools), captions per card
 * - `mark` slot (any React node) instead of a portrait photo
 * - site fonts (Anton via --font-poster, Archivo via --font-body) instead of a Google Fonts link;
 *   layout waits for document.fonts.ready and re-measures when fonts finish loading
 * - CTA set as a pill; nav links are page anchors; no external images or default contact data
 *
 * The section pins its stage for "screens" screen heights of scroll. "height" is the stage
 * height and must be a definite length (default 100svh). Reduced motion fades in place.
 */

export type HelixProject = {
  /** Image, about 3:2. */
  src: string
  /** Caption under the card in the closing grid (left side). */
  title: string
  /** Right side of the caption; defaults to "n/6". */
  note?: string
}

export interface HelixRibbonHeroProps {
  /** Stage height. Must be a definite length. */
  height?: string
  /** Screen heights of scroll the story takes. */
  screens?: number
  /** First line of the headline. */
  greeting?: string
  /** Second line, set under the first. */
  name?: string
  /** Small block beside the first line. */
  mark?: React.ReactNode
  /** Up to twelve ride the ribbon. */
  projects?: HelixProject[]
  /** The closing grid (up to six). Defaults to the first six projects. */
  grid?: HelixProject[]
  /** Line above the closing grid, e.g. whose answers these are. */
  gridLabel?: string
  /** Lands in place of the grid: an interactive closing scene that fills the stage under the nav. */
  finale?: React.ReactNode
  /** Called when the finale comes into view or leaves it. */
  onFinale?: (shown: boolean) => void
  brand?: string
  links?: { label: string; href: string }[]
  cta?: { label: string; href: string }
  /** Small label beside the headline. */
  count?: string
  bio?: string
  scrollHint?: string
  /** Field colour. */
  background?: string
  /** Type colour. */
  foreground?: string
  autoPlay?: boolean
  className?: string
}

// #region motion
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** 0 before a, 1 after b, linear between. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t)

/** Scroll windows of the story, 0 to 1 over the pin. */
export const PHASE = {
  bio: [0, 0.06],
  split: [0.08, 0.36],
  helix: [0.02, 0.62],
  grid: [0.53, 0.63],
  gridStagger: 0.026,
  gridScroll: [0.8, 1],
  /** reduced motion: fades in place instead */
  calmOut: [0.04, 0.2],
  calmIn: [0.42, 0.58],
  /** the finale, when given, replaces the grid */
  finale: [0.52, 0.7],
}

/** Cards per helix turn, and the turn's rise in card heights. */
export const HELIX = { perTurn: 7, slices: 4, pitch: 1.34, tiltZ: -17, tiltX: -9 }

/** Headline lines slide apart: line one right, line two left, by this fraction of the width. */
export function headline(p: number) {
  const t = easeInOut(seg(p, PHASE.split[0], PHASE.split[1]))
  return { l1: t, l2: -t, gone: t >= 1 }
}

/** Where the ribbon is: rise 0 = hidden below, 1 = gone above; spin in radians. */
export function helix(p: number) {
  const t = seg(p, PHASE.helix[0], PHASE.helix[1])
  return { rise: easeSine(t) * 0.35 + t * 0.65, spin: -0.85 * Math.PI + t * 2.1 * Math.PI, t }
}

/** Landing progress of grid card i. */
export function gridCard(p: number, i: number) {
  const a = PHASE.grid[0] + i * PHASE.gridStagger
  return easeOut(seg(p, a, a + (PHASE.grid[1] - PHASE.grid[0])))
}

export function gridScroll(p: number) {
  return easeInOut(seg(p, PHASE.gridScroll[0], PHASE.gridScroll[1]))
}

/** Autoplay: play forward, hold on the grid, rewind, rest on the hero, repeat. */
export const AUTO = { play: 10000, hold: 2400, rewind: 3400, rest: 1600 }
export function autoProgress(ms: number) {
  const cycle = AUTO.play + AUTO.hold + AUTO.rewind + AUTO.rest
  const m = ((ms % cycle) + cycle) % cycle
  if (m < AUTO.play) return easeSine(m / AUTO.play)
  if (m < AUTO.play + AUTO.hold) return 1
  if (m < AUTO.play + AUTO.hold + AUTO.rewind) return 1 - easeSine((m - AUTO.play - AUTO.hold) / AUTO.rewind)
  return 0
}
// #endregion

const CSS = [
  ".hrh-root{position:relative;width:100%;isolation:isolate}",
  ".hrh-root img{max-width:none;display:block}",
  ".hrh-stage{position:sticky;top:0;overflow:hidden;color:var(--hrh-fg);background:var(--hrh-bg);--hrh-g:clamp(16px,2.2vw,32px);font-family:var(--font-body),ui-sans-serif,system-ui,sans-serif}",
  ".hrh-view{position:absolute;inset:0;perspective-origin:50% 50%}",
  ".hrh-scene{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}",
  ".hrh-screw,.hrh-group{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d}",
  ".hrh-slice{position:absolute;left:0;top:0;transform-origin:0 0;background-repeat:no-repeat;backface-visibility:hidden}",
  ".hrh-line{position:absolute;left:0;top:0;white-space:nowrap;font-family:var(--font-poster),Impact,'Arial Narrow',sans-serif;font-weight:400;line-height:1;letter-spacing:-0.005em;text-transform:uppercase}",
  ".hrh-ch{display:inline-block}",
  ".hrh-port{position:absolute;left:0;top:0;overflow:hidden;background:var(--hrh-fg)}",
  ".hrh-port>*{width:100%;height:100%;display:block}",
  ".hrh-root:not([data-ready=true]) .hrh-view,.hrh-root:not([data-ready=true]) .hrh-count,.hrh-root:not([data-ready=true]) .hrh-fade{visibility:hidden}",
  ".hrh-root[data-ready=true] .hrh-ch{animation:hrh-rise .7s cubic-bezier(.2,.75,.2,1) both}",
  ".hrh-root[data-ready=true] .hrh-port{animation:hrh-port .8s cubic-bezier(.2,.75,.2,1) .32s both}",
  ".hrh-root[data-ready=true] .hrh-fade{animation:hrh-fade .7s ease-out .55s both}",
  ".hrh-nav{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;align-items:center;justify-content:space-between;padding:var(--hrh-g);padding-top:calc(var(--hrh-g) * .6);padding-bottom:calc(var(--hrh-g) * .6);background:var(--hrh-bg);font-size:15px;font-weight:700;line-height:1}",
  ".hrh-nav a{color:inherit;text-decoration:none}",
  ".hrh-nav a:hover{text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:2px}",
  ".hrh-brand{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:800;letter-spacing:-.01em}",
  ".hrh-links{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:1.6em;white-space:nowrap}",
  ".hrh-nav a.hrh-cta{display:inline-flex;align-items:center;height:42px;padding:0 20px;border-radius:999px;background:var(--hrh-fg);color:var(--hrh-bg)}",
  ".hrh-nav a.hrh-cta:hover{text-decoration:none;opacity:.88}",
  ".hrh-nav a:focus-visible{outline:3px solid var(--hrh-fg);outline-offset:3px;border-radius:6px}",
  ".hrh-foot{position:absolute;left:0;right:0;bottom:0;z-index:4;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:var(--hrh-g)}",
  ".hrh-bio{margin:0;max-width:26em;font-size:clamp(16px,1.35vw,20px);font-weight:600;line-height:1.3;letter-spacing:-0.005em}",
  ".hrh-hint{font-size:14px;font-weight:700;line-height:1;white-space:nowrap}",
  ".hrh-count{position:absolute;left:0;top:0;z-index:3;font-size:15px;font-weight:700;line-height:1;white-space:nowrap}",
  ".hrh-grid{position:absolute;inset:0;z-index:5;pointer-events:none}",
  ".hrh-finale{position:absolute;left:0;right:0;bottom:0;top:calc(var(--hrh-g) + 58px);z-index:6;padding:0 var(--hrh-g) var(--hrh-g);pointer-events:none;transform-origin:50% 100%;will-change:transform,opacity}",
  ".hrh-glabel{position:absolute;left:0;top:0;z-index:5;margin:0;font-size:clamp(15px,1.3vw,19px);font-weight:700;line-height:1.2;pointer-events:none}",
  ".hrh-card{position:absolute;left:0;top:0;opacity:0}",
  ".hrh-card-img{position:relative;overflow:hidden;background:#fff;box-shadow:0 18px 40px -24px rgba(21,25,28,.55)}",
  ".hrh-card-img img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}",
  ".hrh-cap{display:flex;justify-content:space-between;padding-top:10px;font-size:13px;font-weight:700;line-height:1}",
  "@keyframes hrh-rise{from{transform:translateY(60%);filter:blur(12px);opacity:0}60%{opacity:1}to{transform:none;filter:blur(0);opacity:1}}",
  "@keyframes hrh-port{from{clip-path:inset(0 0 100% 0);filter:blur(8px)}to{clip-path:inset(0 0 0 0);filter:blur(0)}}",
  "@keyframes hrh-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}",
  "@media (max-width:719px){.hrh-links{display:none}.hrh-nav a.hrh-cta{height:38px;padding:0 16px;font-size:14px}.hrh-foot{flex-direction:column;align-items:flex-start;gap:14px;padding-bottom:calc(var(--hrh-g) + 8px)}.hrh-bio{max-width:22em}}",
  "@media (prefers-reduced-motion:reduce){.hrh-root[data-ready=true] .hrh-ch,.hrh-root[data-ready=true] .hrh-port,.hrh-root[data-ready=true] .hrh-fade{animation:none}}",
].join("\n")

const px = (v: number) => v.toFixed(2) + "px"

function prefersReduced() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const EMPTY: HelixProject[] = []

export default function HelixRibbonHero({
  height = "100svh",
  screens = 4,
  greeting = "Where AI",
  name = "pays off",
  mark,
  projects = EMPTY,
  grid,
  gridLabel = "",
  finale,
  onFinale,
  brand = "MeisterBlick",
  links = [],
  cta = { label: "Start free check", href: "/start" },
  count = "",
  bio = "",
  scrollHint = "Scroll",
  background = "#ff5b14",
  foreground = "#15191c",
  autoPlay = false,
  className,
}: HelixRibbonHeroProps) {
  const rootRef = React.useRef(null as HTMLElement | null)
  const stageRef = React.useRef(null as HTMLDivElement | null)
  const viewRef = React.useRef(null as HTMLDivElement | null)
  const groupRef = React.useRef(null as HTMLDivElement | null)
  const screwRef = React.useRef(null as HTMLDivElement | null)
  const l1Ref = React.useRef(null as HTMLDivElement | null)
  const l2Ref = React.useRef(null as HTMLDivElement | null)
  const portRef = React.useRef(null as HTMLDivElement | null)
  const countRef = React.useRef(null as HTMLDivElement | null)
  const footRef = React.useRef(null as HTMLDivElement | null)
  const gridRef = React.useRef(null as HTMLDivElement | null)
  const labelRef = React.useRef(null as HTMLParagraphElement | null)
  const finaleRef = React.useRef(null as HTMLDivElement | null)
  const onFinaleRef = React.useRef(onFinale)
  onFinaleRef.current = onFinale
  // The ribbon's lower end leaves the screen last, while the grid lands.
  const ribbon = React.useMemo(() => projects.slice(0, 12).reverse(), [projects])
  const hasFinale = finale != null
  const tiles = React.useMemo(() => (hasFinale ? EMPTY : (grid ?? projects).slice(0, 6)), [hasFinale, grid, projects])
  const [ready, setReady] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)

  // Lay out once the faces are in (or after 2.5 s without them), so the
  // headline is measured once and its intro plays once.
  React.useEffect(() => {
    setReduced(prefersReduced())
    let live = true
    const go = () => live && setReady(true)
    const fonts = typeof document !== "undefined" ? document.fonts : undefined
    const t = window.setTimeout(go, 2500)
    if (fonts) fonts.ready.catch(() => undefined).then(go)
    else go()
    return () => {
      live = false
      window.clearTimeout(t)
    }
  }, [])

  React.useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const view = viewRef.current
    const group = groupRef.current
    const screw = screwRef.current
    const l1 = l1Ref.current
    const l2 = l2Ref.current
    const port = portRef.current
    const countEl = countRef.current
    const foot = footRef.current
    const gridEl = gridRef.current
    const label = labelRef.current
    const fin = finaleRef.current
    let finShown = false
    if (!ready || !root || !stage || !view || !group || !screw || !l1 || !l2 || !port || !countEl || !foot || !gridEl) return
    const slices = Array.from(screw.children) as HTMLDivElement[]
    const cards = Array.from(gridEl.children) as HTMLDivElement[]
    const n = ribbon.length
    const S = HELIX.slices

    // ---- layout, redone on resize and when the fonts land ----
    const L = {
      W: 0, H: 0, R: 0, cw: 0, ch: 0, pitch: 0, dTheta: 0, persp: 0, zHead: 0,
      l1x: 0, l2x: 0, cols: 3, slot: [] as { x: number; y: number }[], tw: 0, th: 0, gridH: 0, top: 0, g: 0,
    }
    const layout = () => {
      const W = stage.clientWidth
      const H = stage.clientHeight
      if (!W || !H) return
      L.W = W
      L.H = H
      const mobile = W < 720
      const g = parseFloat(getComputedStyle(foot).paddingLeft) || 24
      L.g = g

      // helix
      const U = Math.max(Math.min(W, H * 1.6), H * 0.62)
      L.cw = U * 0.4
      L.ch = L.cw / 1.5
      L.dTheta = (Math.PI * 2) / HELIX.perTurn
      L.R = L.cw / L.dTheta
      L.pitch = L.ch * HELIX.pitch
      L.persp = U * 1.05
      view.style.perspective = px(L.persp)
      const sw = 2 * L.R * Math.sin(L.dTheta / S / 2)
      const dy = (L.pitch * (L.dTheta / S)) / (Math.PI * 2)
      const skew = (Math.atan2(dy, sw) * 180) / Math.PI
      // two faces per slice, both readable: the back one is turned round and
      // shows the mirror segment, so the ribbon never shows reversed text
      for (let k = 0; k < slices.length; k++) {
        const back = k % 2
        const i = Math.floor(k / (2 * S))
        const j = Math.floor(k / 2) % S
        const a = i * L.dTheta + (j + 0.5) * (L.dTheta / S)
        const y = -(L.pitch * a) / (Math.PI * 2)
        const el = slices[k]
        // 1px of overlap each side hides the anti-aliasing hairline at every seam
        el.style.width = px(sw + 2)
        el.style.height = px(L.ch)
        el.style.backgroundSize = px(sw * S) + " " + px(L.ch)
        el.style.backgroundPosition = px(1 - (back ? S - 1 - j : j) * sw) + " 0px"
        el.style.transform =
          "rotateY(" + ((a * 180) / Math.PI).toFixed(3) + "deg) translate3d(" + px(-sw / 2 - 1) + "," + px(y - L.ch / 2 + dy / 2) + "," + px(L.R) + ") skewY(" + (-skew).toFixed(3) + "deg)" + (back ? " translateX(" + px(sw + 2) + ") rotateY(180deg)" : "")
      }

      // headline: measured at 100px, then fitted. It sits a little behind the
      // ribbon's front so the near cards pass in front of it; its layout is
      // enlarged by exactly what the perspective takes away, so it renders 1:1.
      L.zHead = -L.R * 0.45
      const s = L.persp / (L.persp - L.zHead)
      l1.style.fontSize = "100px"
      l2.style.fontSize = "100px"
      const w1 = l1.offsetWidth
      const w2 = l2.offsetWidth
      // Anton's cap height and its baseline in a line-height: 1 box, as
      // fractions of the font size (measured from rendered ink).
      const cap = 0.86
      const base = 0.925
      const lead1 = l1.querySelector("[data-lead]") as HTMLElement | null
      const o2 = lead1 ? lead1.offsetWidth / 100 : 0.5
      const pw = cap * 0.8
      const gap = 0.06
      const lg = cap * 0.1
      const bw = Math.max(w1 / 100 + gap + pw, o2 + w2 / 100)
      const bh = cap * 2 + lg
      const f = Math.min((mobile ? 0.9 : 0.8) * W / bw, (mobile ? 0.36 : 0.47) * H / bh)
      const capH = cap * f
      const left = -(bw * f) / 2 + (mobile ? 0 : W * 0.015)
      const topY = H * (mobile ? -0.08 : -0.06) - (bh * f) / 2
      const place = (el: HTMLElement, x: number, capTop: number) => {
        el.style.fontSize = px(f / s)
        el.dataset.x = String(x / s)
        el.dataset.y = String((capTop - base * f + capH) / s)
      }
      place(l1, left, topY)
      place(l2, left + o2 * f, topY + capH + lg * f)
      L.l1x = left
      L.l2x = left + o2 * f
      port.style.width = px((pw * f) / s)
      port.style.height = px(capH / s)
      port.dataset.x = String((left + (w1 / 100 + gap) * f) / s)
      port.dataset.y = String(topY / s)
      // the count sits on the second line's baseline, left of it (under it on phones)
      const chH = countEl.offsetHeight
      const baseline2 = topY + capH * 2 + lg * f
      countEl.style.left = px(W / 2 + left)
      countEl.style.top = mobile ? px(H / 2 + baseline2 + 22) : px(H / 2 + baseline2 - chH)

      // grid
      const cols = mobile ? 2 : 3
      const gx = mobile ? 12 : Math.round(g * 0.9)
      const gy = mobile ? 22 : Math.round(g * 1.2)
      const navH = (stage.querySelector(".hrh-nav") as HTMLElement).offsetHeight
      L.cols = cols
      L.tw = (W - 2 * g - (cols - 1) * gx) / cols
      L.th = L.tw / 1.5
      const capRow = 24
      const rows = Math.ceil(tiles.length / cols)
      L.gridH = rows * (L.th + capRow) + (rows - 1) * gy
      // room for the label line above the grid
      L.top = navH + (mobile ? 12 : g * 0.6) + (labelRef.current ? labelRef.current.offsetHeight + 14 : 0)
      L.slot = tiles.map((_, i) => ({ x: g + (i % cols) * (L.tw + gx), y: Math.floor(i / cols) * (L.th + capRow + gy) }))
      cards.forEach((c) => {
        const img = c.firstElementChild as HTMLElement
        img.style.width = px(L.tw)
        img.style.height = px(L.th)
        c.style.width = px(L.tw)
      })
      draw(true)
    }

    // ---- per frame ----
    let cur = 0
    let goal = 0
    const shade = new Float32Array(slices.length).fill(-1)
    const draw = (force?: boolean) => {
      const p = cur
      const { W, H } = L
      if (!W) return
      const calm = reduced

      // headline + chrome
      const hd = headline(p)
      const out = calm ? 1 - seg(p, PHASE.calmOut[0], PHASE.calmOut[1]) : 1
      const shift = W * 0.95
      const z = L.zHead
      const s = L.persp / (L.persp - z)
      const setHead = (el: HTMLElement, dx: number) => {
        const x = Number(el.dataset.x) + dx / s
        const y = Number(el.dataset.y)
        el.style.transform = "translate3d(" + px(x) + "," + px(y) + "," + px(z) + ")"
        el.style.opacity = calm ? String(out) : hd.gone ? "0" : "1"
      }
      setHead(l1, calm ? 0 : hd.l1 * shift)
      setHead(port, calm ? 0 : hd.l1 * shift)
      setHead(l2, calm ? 0 : hd.l2 * shift)
      const bioT = calm ? 1 - out : seg(p, PHASE.bio[0], PHASE.bio[1])
      foot.style.opacity = String(1 - bioT)
      foot.style.transform = "translateY(" + px(bioT * 40) + ")"
      const cT = calm ? 1 - out : seg(p, PHASE.split[0], PHASE.split[0] + 0.08)
      countEl.style.opacity = String(1 - cT)
      countEl.style.transform = "translateX(" + px(-cT * 30) + ")"

      // helix
      const hx = helix(p)
      if (calm || hx.t <= 0 || hx.t >= 1) {
        group.style.visibility = "hidden"
      } else {
        group.style.visibility = "visible"
        const span = (L.pitch * ((n - 1) * L.dTheta)) / (Math.PI * 2)
        const reach = H / 2 + span / 2 + L.ch * 1.6
        const rise = reach - hx.rise * 2 * reach
        const phi = hx.spin
        const screwY = -(L.pitch * phi) / (Math.PI * 2)
        const centre = -(span / 2) + screwY
        group.style.transform =
          "translate3d(" + px(-W * 0.04) + "," + px(rise - centre) + "," + px(-L.R) + ") rotateZ(" + HELIX.tiltZ + "deg) rotateX(" + HELIX.tiltX + "deg)"
        screw.style.transform = "rotateY(" + ((phi * 180) / Math.PI).toFixed(3) + "deg) translateY(" + px(screwY) + ")"
        for (let k = 0; k < slices.length; k++) {
          const i = Math.floor(k / (2 * S))
          const j = Math.floor(k / 2) % S
          const a = i * L.dTheta + (j + 0.5) * (L.dTheta / S) + phi
          const c = k % 2 ? -Math.cos(a) : Math.cos(a)
          if (c < -0.05) continue
          const b = 0.66 + 0.34 * Math.max(0, c)
          if (force || Math.abs(b - shade[k]) > 0.015) {
            shade[k] = b
            slices[k].style.filter = "brightness(" + b.toFixed(3) + ")"
          }
        }
      }

      // finale: rises into place where the grid would land, then holds
      if (fin) {
        const t = calm ? seg(p, PHASE.calmIn[0], PHASE.calmIn[1]) : easeOut(seg(p, PHASE.finale[0], PHASE.finale[1]))
        fin.style.opacity = t.toFixed(3)
        fin.style.visibility = t > 0.001 ? "visible" : "hidden"
        fin.style.transform = calm ? "" : "translate3d(0," + px((1 - t) * H * 0.18) + ",0) scale(" + (0.94 + 0.06 * t).toFixed(4) + ")"
        const on = t > 0.6
        fin.style.pointerEvents = on ? "auto" : "none"
        if (on !== finShown) {
          finShown = on
          onFinaleRef.current?.(on)
        }
      }

      // grid
      const scrollY = gridScroll(p)
      const avail = H - L.top - L.g
      const landY = H * 0.4
      const endY = L.gridH <= avail ? L.top + (avail - L.gridH) / 2 : H - L.g - L.gridH
      const baseY = landY + (endY - landY) * scrollY
      if (label) {
        const lt = calm ? seg(p, PHASE.calmIn[0], PHASE.calmIn[1]) : gridCard(p, 0)
        label.style.opacity = String(seg(lt, 0.5, 1))
        label.style.transform = "translate(" + px(L.g) + "," + px(baseY - label.offsetHeight - 14) + ")"
      }
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i]
        const slot = L.slot[i]
        const t = calm ? seg(p, PHASE.calmIn[0], PHASE.calmIn[1]) : gridCard(p, i)
        if (t <= 0) {
          el.style.opacity = "0"
          continue
        }
        const img = el.firstElementChild as HTMLElement
        const capEl = el.lastElementChild as HTMLElement
        if (calm) {
          el.style.opacity = String(t)
          el.style.transform = "translate(" + px(slot.x) + "," + px(baseY + slot.y) + ")"
          img.style.width = px(L.tw)
          img.style.height = px(L.th)
          capEl.style.opacity = "1"
          continue
        }
        // from the top edge, where the ribbon left, larger and tipped back
        const k = 1 - t
        const grow = 1 + 0.4 * k
        const w = L.tw * grow
        const h = L.th * grow
        // each card arrives from its own side, so none crosses a landed one:
        // the first row from the left, the top and the right, later rows from below
        const row = Math.floor(i / L.cols)
        const col = i % L.cols
        const sx = slot.x - (w - L.tw) / 2
        const sy = baseY + slot.y
        let fromX = sx
        let fromY = sy
        if (row > 0) fromY = H + h * 0.1
        else if (col === 0) fromX = -w * 1.05
        else if (col === L.cols - 1) fromX = W + w * 0.05
        else fromY = -h * 1.05
        const x = sx + (fromX - sx) * k
        const y = sy + (fromY - sy) * k
        img.style.width = px(w)
        img.style.height = px(h)
        el.style.width = px(w)
        el.style.opacity = String(Math.min(1, t * 3))
        img.style.filter = k > 0.01 ? "blur(" + (k * 7).toFixed(2) + "px)" : ""
        el.style.transform = "translate(" + px(x) + "," + px(y) + ") perspective(" + px(L.persp) + ") rotateX(" + (k * 16).toFixed(2) + "deg)"
        capEl.style.opacity = String(seg(t, 0.8, 1))
      }
    }

    // ---- scroll, autoplay, loop ----
    const target = () => {
      const r = root.getBoundingClientRect()
      const run = r.height - stage.offsetHeight
      return run > 0 ? clamp01(-r.top / run) : 0
    }
    // autoplay only from the top of the scene, and never under reduced motion
    let auto = autoPlay && !reduced && target() < 0.002
    let autoT0 = -1
    const INTRO = 1400
    const stop = () => {
      if (!auto) return
      auto = false
      goal = target()
    }
    let raf = 0
    let last = performance.now()
    const start = last
    let visible = true
    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      if (auto) {
        if (now - start > INTRO) {
          if (autoT0 < 0) autoT0 = now
          goal = autoProgress(now - autoT0)
        } else goal = 0
      } else goal = target()
      if (reduced) cur = goal
      else {
        const k = 1 - Math.exp(-dt / (auto ? 40 : 110))
        cur += (goal - cur) * k
        if (Math.abs(goal - cur) < 0.00005) cur = goal
      }
      draw()
      raf = visible ? requestAnimationFrame(tick) : 0
    }
    // the loop sleeps while the scene is off screen
    const io = new IntersectionObserver((es) => {
      visible = es[es.length - 1].isIntersecting
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    })
    io.observe(root)
    const onUser = () => stop()
    const onScroll = () => {
      if (auto && Math.abs(target() - 0) > 0.002) stop()
    }
    const onFonts = () => layout()
    window.addEventListener("wheel", onUser, { passive: true })
    window.addEventListener("touchstart", onUser, { passive: true })
    window.addEventListener("keydown", onUser)
    window.addEventListener("scroll", onScroll, { passive: true })
    document.fonts?.addEventListener?.("loadingdone", onFonts)
    const ro = new ResizeObserver(() => layout())
    ro.observe(stage)
    layout()
    cur = auto ? 0 : target()
    draw(true)
    root.setAttribute("data-ready", "true")
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("wheel", onUser)
      window.removeEventListener("touchstart", onUser)
      window.removeEventListener("keydown", onUser)
      window.removeEventListener("scroll", onScroll)
      document.fonts?.removeEventListener?.("loadingdone", onFonts)
    }
  }, [ready, reduced, autoPlay, greeting, name, ribbon.length, tiles.length])

  const letters = (text: string, delay0: number) =>
    Array.from(text).map((c, i) => (
      <span key={i} className="hrh-ch" style={{ animationDelay: delay0 + i * 0.045 + "s" }}>
        {c === " " ? <span style={{ display: "inline-block", width: "0.12em" }} /> : c}
      </span>
    ))
  const firstWord = greeting.split(" ")[0]
  const restWords = greeting.slice(firstWord.length)

  return (
    <section
      ref={rootRef}
      className={"hrh-root" + (className ? " " + className : "")}
      style={{ height: "calc(" + height + " * " + (screens + 1) + ")", ["--hrh-bg" as string]: background, ["--hrh-fg" as string]: foreground }}
      aria-label={greeting + " " + name}
    >
      <style>{CSS}</style>
      <div ref={stageRef} className="hrh-stage" style={{ height, width: "100%" }}>
        <div ref={viewRef} className="hrh-view">
          <div className="hrh-scene">
            <h1 ref={l1Ref} className="hrh-line" style={{ margin: 0 }} aria-label={greeting + " " + name}>
              <span data-lead="" style={{ display: "inline-block" }}>
                {letters(firstWord + " ", 0.08)}
              </span>
              {letters(restWords.trimStart(), 0.08 + (firstWord.length + 1) * 0.045)}
            </h1>
            <div ref={portRef} className="hrh-port" aria-hidden="true">
              {mark}
            </div>
            <div ref={l2Ref} className="hrh-line" aria-hidden="true">
              {letters(name, 0.3)}
            </div>
            <div ref={groupRef} className="hrh-group" aria-hidden="true" style={{ visibility: "hidden" }}>
              <div ref={screwRef} className="hrh-screw">
                {ribbon.flatMap((pr, i) =>
                  Array.from({ length: HELIX.slices * 2 }, (_, j) => (
                    <div key={i + "-" + j} className="hrh-slice" style={{ backgroundImage: "url(" + JSON.stringify(pr.src) + ")" }} />
                  )),
                )}
              </div>
            </div>
          </div>
        </div>

        <div ref={countRef} className="hrh-count">
          <span className="hrh-fade" style={{ display: "block" }}>
            {count}
          </span>
        </div>

        {gridLabel ? (
          <p ref={labelRef} className="hrh-glabel" style={{ opacity: 0 }}>
            {gridLabel}
          </p>
        ) : null}

        {hasFinale ? (
          <div ref={finaleRef} className="hrh-finale" style={{ opacity: 0, visibility: "hidden" }}>
            {finale}
          </div>
        ) : null}

        <div ref={gridRef} className="hrh-grid">
          {tiles.map((pr, i) => (
            <div key={i} className="hrh-card">
              <div className="hrh-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pr.src} alt={pr.title} width={600} height={400} style={{ maxWidth: "none" }} draggable={false} />
              </div>
              <div className="hrh-cap" style={{ opacity: 0 }}>
                <span>{pr.title}</span>
                <span>{pr.note ?? i + 1 + "/" + tiles.length}</span>
              </div>
            </div>
          ))}
        </div>

        <div ref={footRef} className="hrh-foot">
          <p className="hrh-bio hrh-fade">{bio}</p>
          <span className="hrh-hint hrh-fade">{scrollHint}</span>
        </div>

        <nav className="hrh-nav hrh-fade" aria-label="Main">
          <a href="/" className="hrh-brand">
            <svg aria-hidden width="28" height="20" viewBox="0 0 30 22">
              <rect x="1" y="12" width="28" height="9" rx="1" fill="var(--hrh-fg)" />
              <rect x="1" y="2" width="20" height="9" rx="1" fill="var(--hrh-fg)" transform="rotate(-14 2 11)" />
              {[5, 9, 13, 17, 21, 25].map((x) => <line key={x} x1={x} x2={x} y1="12" y2={x % 2 ? 15 : 17} stroke="var(--hrh-bg)" strokeWidth="1" />)}
            </svg>
            {brand}
          </a>
          <div className="hrh-links">
            {links.map((l) => (
              <a key={l.label} href={l.href}>{l.label}</a>
            ))}
          </div>
          <a className="hrh-cta" href={cta.href}>{cta.label}</a>
        </nav>
      </div>
    </section>
  )
}
