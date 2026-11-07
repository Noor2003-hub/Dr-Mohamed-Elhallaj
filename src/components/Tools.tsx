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
  const n = tools.length
  const pad = (v: number) => String(v).padStart(2, '0')

  useEffect(() => {
    if (prefersReducedMotion() || n < 2) return
    const cards = gsap.utils.toArray<HTMLElement>('.tool-card', stack.current)
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      gsap.set(cards.slice(1), { yPercent: 115 })
      // Text switches only once the incoming card is fully in place. Read the timeline's own
      // progress (not the scroll's) so the scrub lag is respected.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => setActive(Math.min(n - 1, Math.floor(tl.progress() * (n - 1) + 0.01))),
      })
      for (let i = 1; i < n; i++) {
        tl.to(cards[i], { yPercent: 0, duration: 1 }, i - 1)
        for (let j = 0; j < i; j++) {
          const depth = i - j
          tl.to(
            cards[j],
            {
              y: -Math.min(depth, 3) * 26,
              scale: 1 - Math.min(depth, 3) * 0.045,
              duration: 1,
            },
            i - 1,
          )
        }
      }
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: () => `+=${(n - 1) * window.innerHeight * 0.75}`,
        pin: true,
        scrub: 0.6,
        animation: tl,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.15, max: 0.4 }, ease: 'power1.inOut' },
      })
      return () => st.kill()
    })
    return () => mm.revert()
  }, [n])

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
                <span>{pad(i + 1)}</span>
                {x.shortName}
                {i === active && <i aria-hidden="true" />}
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
