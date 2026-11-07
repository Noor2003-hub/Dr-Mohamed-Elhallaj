'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { waLink } from '@/lib/links'
import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

/**
 * Hero → connector → About as ONE scroll-scrubbed clinic video.
 * The video is an image sequence in /public/sequence/story (0001.webp …).
 * To swap in the real Wan video: export its frames with ffmpeg into that folder
 * and update FRAME_COUNT (see README). glow.json holds the knee position per frame.
 */
const FRAME_COUNT = 160
const FRAME_PATH = (i: number) => `/sequence/story/${String(i + 1).padStart(4, '0')}.webp`

// Where each part of the story happens, as a share of the scroll (0 → 1)
const HERO_OUT = 0.14 // hero text has gone
const GLOW_OUT = 0.4 // pain glow has faded
const ABOUT_IN = 0.8 // about content starts to appear

type Glow = ([number, number, number] | null)[]

export default function Story({ site, t }: { site: SiteData['site']; t: Dict }) {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const hero = useRef<HTMLDivElement>(null)
  const heroShade = useRef<HTMLDivElement>(null)
  const about = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const [activeLine, setActiveLine] = useState(1)
  const [count, setCount] = useState(0)
  const lines = site.storyLines

  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const frames: HTMLImageElement[] = []
    let glow: Glow = []
    let target = 0 // scroll progress
    let current = 0 // smoothed progress
    let raf = 0
    let alive = true
    const reduced = prefersReducedMotion()

    fetch('/sequence/story/glow.json')
      .then((r) => r.json())
      .then((g: Glow) => (glow = g))
      .catch(() => {})

    // load the first frame first, then the rest in order
    for (let i = 0; i < FRAME_COUNT; i++) {
      const im = new Image()
      im.decoding = 'async'
      im.src = FRAME_PATH(i)
      frames[i] = im
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = cv.clientWidth * dpr
      cv.height = cv.clientHeight * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        const a = frames[i - d]
        if (a && a.complete && a.naturalWidth) return a
        const b = frames[i + d]
        if (b && b.complete && b.naturalWidth) return b
      }
      return null
    }

    const draw = (t: number) => {
      const p = current
      const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(p * (FRAME_COUNT - 1))))
      const im = nearestLoaded(idx)
      const W = cv.width
      const H = cv.height
      ctx.fillStyle = '#032D3B'
      ctx.fillRect(0, 0, W, H)
      if (!im) return
      // cover-fit; on narrow screens keep the right side (the knee) in view
      const s = Math.max(W / im.naturalWidth, H / im.naturalHeight)
      const dw = im.naturalWidth * s
      const dh = im.naturalHeight * s
      // on phones keep the knee in view first, then centre on the doctor
      const focusX = W < H ? 0.72 - 0.22 * gsap.utils.clamp(0, 1, (p - 0.3) / 0.35) : 0.5
      const dx = (W - dw) * focusX
      const dy = (H - dh) / 2
      ctx.drawImage(im, dx, dy, dw, dh)

      // pain glow on the knee: it beats from the first render until scrolling starts,
      // then holds steady and fades out with the scroll
      const g = glow[idx]
      const glowAlpha = 1 - gsap.utils.clamp(0, 1, (p - 0.18) / (GLOW_OUT - 0.18))
      if (g && glowAlpha > 0) {
        const beating = reduced ? 0 : 1 - gsap.utils.clamp(0, 1, p / 0.02)
        const wave = Math.pow(0.5 + 0.5 * Math.sin(t / 230), 2) // 0 → 1, about 1.4 s per beat
        const pulse = 1 - beating * (1 - wave)
        const x = dx + g[0] * dw
        const y = dy + g[1] * dh
        // radius follows the zoom so the glow always covers the kneecap
        const r = dh * 0.2 * g[2] * (0.78 + 0.26 * pulse)
        const a = glowAlpha * (0.3 + 0.7 * pulse)
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, `rgba(255,70,40,${0.62 * a})`)
        grad.addColorStop(0.4, `rgba(255,107,61,${0.3 * a})`)
        grad.addColorStop(0.7, 'rgba(255,107,61,0)')
        ctx.fillStyle = grad
        ctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
    }

    const loop = (t: number) => {
      if (!alive) return
      current += (target - current) * (reduced ? 1 : 0.14)
      if (Math.abs(target - current) < 0.0004) current = target
      draw(t)
      raf = requestAnimationFrame(loop)
    }
    frames[0].onload = () => draw(0)
    raf = requestAnimationFrame(loop)

    let lastLine = -1
    let counted = false
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        target = self.progress
        const p = self.progress
        // hero copy drifts up and fades
        const h = gsap.utils.clamp(0, 1, p / HERO_OUT)
        gsap.set(hero.current, { autoAlpha: 1 - h, y: -60 * h })
        gsap.set(heroShade.current, { opacity: 1 - gsap.utils.clamp(0, 1, p / 0.3) })
        gsap.set(hint.current, { autoAlpha: 1 - gsap.utils.clamp(0, 1, p / 0.04) })
        // about content
        const a = gsap.utils.clamp(0, 1, (p - ABOUT_IN) / 0.06)
        gsap.set(about.current, { autoAlpha: a, y: 40 * (1 - a) })
        if (a > 0.5 && !counted) {
          counted = true
          const o = { v: 0 }
          gsap.to(o, { v: site.years, duration: 1.4, ease: 'power2.out', onUpdate: () => setCount(Math.round(o.v)) })
        }
        if (a === 0 && counted && p < ABOUT_IN - 0.05) {
          counted = false
          setCount(0)
        }
        // story lines come into focus one by one
        if (lines.length) {
          const lp = gsap.utils.clamp(0, 0.999, (p - (ABOUT_IN + 0.04)) / (1 - ABOUT_IN - 0.06))
          const li = Math.floor(lp * lines.length)
          if (li !== lastLine) {
            lastLine = li
            setActiveLine(li)
          }
        }
      },
    })

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      st.kill()
    }
  }, [lines.length, site.years])

  return (
    <section id="top" ref={section} className="story" aria-label={t.story.label}>
      <div className="story__stage">
        <canvas ref={canvas} className="story__canvas" aria-hidden="true" />
        <div ref={heroShade} className="story__shade" aria-hidden="true" />

        <div ref={hero} className="story__hero wrap">
          <h1 className="story__name">{site.name}</h1>
          <p className="story__lines">
            {site.heroLines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <div className="story__ctas">
            <a className="btn btn--cyan" href={waLink(site.whatsapp)} target="_blank" rel="noreferrer">
              {t.story.book}
            </a>
            <a className="btn btn--ghost" href="#reels">
              {t.story.watch}
            </a>
          </div>
        </div>

        <div ref={hint} className="story__hint" aria-hidden="true">
          <span className="story__hint-dot" /> {t.story.hint}
        </div>

        <div ref={about} id="about" className="story__about wrap" style={{ visibility: 'hidden' }}>
          <div className="story__about-left">
            <h2 className="h-section h-section--sm">
              {renderHeading(site.aboutHeading)}
            </h2>
            <div className="story__story">
              {lines.map((l, i) => (
                <p key={i} className={`story__line ${i === activeLine ? 'is-active' : ''}`}>
                  {i === activeLine && <span className="corners" aria-hidden="true" />}
                  {l}
                </p>
              ))}
            </div>
          </div>
          <div className="story__about-gap" aria-hidden="true" />
          <div className="story__about-right">
            <div className="years">
              <span className="years__pin" aria-hidden="true">
                <i />
                <b />
              </span>
              <strong className="years__num">+{count}</strong>
              <span className="years__label">{site.yearsLabel}</span>
            </div>
            <p className="story__about-text">{site.aboutText}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Colours the doctor's name inside "Who is Dr. Elhallaj?" / "من هو د. الحلاج؟" */
function renderHeading(h: string) {
  const m = h.match(/^(.*?)((?:Dr|د)\.?\s?[^?؟]+)([?؟]?)$/)
  if (!m) return h
  return (
    <>
      {m[1]}
      <span className="accent">{m[2]}</span>
      {m[3]}
    </>
  )
}
