'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

/** Stacked cards: the section pins and each scroll step slides the next tool card over the last. */
export default function Tools({ heading, tools, t: dict }: { heading: string; tools: SiteData['tools']; t: Dict }) {
  const section = useRef<HTMLElement>(null)
  const stack = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  // scroll position (px) where each card rests, set while the pinned layout is active
  const stops = useRef<number[] | null>(null)
  const n = tools.length
  const pad = (v: number) => String(v).padStart(2, '0')

  useEffect(() => {
    if (prefersReducedMotion() || n < 2) return
    const cards = gsap.utils.toArray<HTMLElement>('.tool-card', stack.current)
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      gsap.set(cards.slice(1), { yPercent: 115 })
      // Timeline: hold · slide · hold · slide · … · hold. A slide lasts 1, a hold HOLD.
      // While a card is held the section stays pinned, so there is time to read it.
      const HOLD = 0.8
      const STEP = 1 + HOLD
      const slideStart = (i: number) => HOLD + (i - 1) * STEP
      const total = (n - 1) * STEP + HOLD
      // Text switches only once the incoming card is fully in place. Read the timeline's own
      // time (not the scroll's) so the scrub lag is respected.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => setActive(Math.min(n - 1, Math.floor((tl.time() + 0.01) / STEP))),
      })
      for (let i = 1; i < n; i++) {
        tl.to(cards[i], { yPercent: 0, duration: 1 }, slideStart(i))
        for (let j = 0; j < i; j++) {
          const depth = i - j
          tl.to(
            cards[j],
            {
              y: -Math.min(depth, 3) * 26,
              scale: 1 - Math.min(depth, 3) * 0.045,
              duration: 1,
            },
            slideStart(i),
          )
        }
      }
      tl.set({}, {}, total) // the last hold
      // each card rests at the middle of its hold when the scroll stops
      const rest = cards.map((_, k) => (k === 0 ? 0 : k === n - 1 ? 1 : (k * STEP + HOLD / 2) / total))
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: () => `+=${total * window.innerHeight * 0.5}`,
        pin: true,
        scrub: 0.6,
        animation: tl,
        snap: { snapTo: rest, duration: { min: 0.15, max: 0.4 }, ease: 'power1.inOut' },
      })
      stops.current = rest.map((r) => st.start + r * (st.end - st.start))
      return () => {
        stops.current = null
        st.kill()
      }
    })
    return () => mm.revert()
  }, [n])

  /** Clicking a tool in the list scrolls to the point where its card rests. */
  const goTo = (i: number) => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number | HTMLElement, o?: object) => void } }).lenis
    const y = stops.current?.[i]
    if (y === undefined) {
      // no pinned stack (phone or reduced motion): just show it
      setActive(i)
      const card = stack.current?.children[i] as HTMLElement | undefined
      if (card && window.matchMedia('(max-width: 899px)').matches) {
        if (lenis) lenis.scrollTo(card, { offset: -80 })
        else card.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
      }
      return
    }
    if (lenis) lenis.scrollTo(y, { duration: 0.6 + Math.abs(i - active) * 0.25 })
    else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const t = tools[active]
  return (
    <section id="tools" ref={section} className="tools sec sec--dark">
      <div className="wrap tools__grid">
        <div className="tools__left">
          <span className="eyebrow">{dict.tools.eyebrow}</span>
          <h2 className="h-section">
            {/* last word in the accent colour: "What he treats with." */}
            {heading.slice(0, heading.trimEnd().lastIndexOf(' ') + 1)}
            <span className="accent">{heading.trimEnd().slice(heading.trimEnd().lastIndexOf(' ') + 1)}</span>
          </h2>
          <ol className="tools__index">
            {tools.map((x, i) => (
              <li key={x.id} className={i === active ? 'is-active' : ''}>
                <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => goTo(i)}>
                  <span>{pad(i + 1)}</span>
                  {x.shortName}
                  {i === active && <i aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="tools__right">
          <div className="tools__meta">
            <span className="tools__count">
              {pad(active + 1)} <span>/ {pad(n)}</span>
            </span>
            <span className="tools__bar">
              <span style={{ width: `${((active + 1) / n) * 100}%` }} />
            </span>
            <span key={`tag${active}`} className="tools__tag anim-in">{t.tag}</span>
          </div>
          <h3 key={`t${active}`} className="tools__title anim-in">{t.title}</h3>
          <div ref={stack} className="tools__stack">
            {tools.map((x, i) => (
              <article key={x.id} className="tool-card" style={{ zIndex: i + 1 }} aria-hidden={i !== active}>
                {x.image && <img src={x.image.url} alt={x.image.alt} loading="eager" />}
                <p className="tool-card__mobile-text">
                  <strong>{x.title}</strong>
                  {x.description}
                </p>
              </article>
            ))}
          </div>
          <p key={`d${active}`} className="tools__desc anim-in">{t.description}</p>
        </div>
      </div>
    </section>
  )
}
