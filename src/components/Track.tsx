'use client'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

/** Recovery stages drawn above the track, left to right. Files are in public/img/track. */
/** Alt texts are in i18n.ts (track.figures), in the same order. */
const FIGURES = [
  { src: '/img/track/t1.png', h: 290 },
  { src: '/img/track/t2.png', h: 290 },
  { src: '/img/track/t3.png', h: 290 },
  { src: '/img/track/t4.png', h: 290 },
  { src: '/img/track/t5.png', h: 290 },
  { src: '/img/track/t6.png', h: 262 },
  { src: '/img/track/t7.png', h: 226 },
]
const STEP = 290 // px between stations
const FIRST = 240

export default function Track({
  heading,
  intro,
  stations,
  t,
  rtl = false,
}: {
  heading: string
  intro: string
  stations: SiteData['experiences']
  t: Dict
  /** Arabic: the track runs from right to left */
  rtl?: boolean
}) {
  const section = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const width = FIRST + stations.length * STEP + 260

  useEffect(() => {
    // small screens scroll the track by hand: in Arabic start at its right end
    const vp = rail.current?.parentElement
    if (rtl && vp) vp.scrollLeft = vp.scrollWidth
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const r = rail.current!
      const distance = () => r.scrollWidth - window.innerWidth + 40
      // English moves the rail left; Arabic starts at its right end and moves it right
      const move = rtl
        ? gsap.fromTo(r, { x: () => -distance() }, { x: 0, ease: 'none' })
        : gsap.to(r, { x: () => -distance(), ease: 'none' })
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        animation: move,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          r.style.setProperty('--progress', String(self.progress))
          // light up the stations the viewer has passed
          const x = Number(gsap.getProperty(r, 'x'))
          const w = window.innerWidth
          r.querySelectorAll<HTMLElement>('.station').forEach((s) => {
            const lit = rtl ? x + s.offsetLeft + s.offsetWidth > w * 0.38 : x + s.offsetLeft < w * 0.62
            s.classList.toggle('is-lit', lit)
          })
        },
      })
      // each recovery figure steps in as it reaches the screen
      const figs = gsap.utils.toArray<HTMLElement>('.track__fig', r)
      const tweens = figs.map((f) =>
        gsap.from(f, {
          autoAlpha: 0,
          y: 40,
          scale: 0.92,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: f,
            containerAnimation: move,
            start: rtl ? 'right 8%' : 'left 92%',
            end: rtl ? 'right 40%' : 'left 60%',
            scrub: true,
          },
        }),
      )
      return () => {
        st.kill()
        tweens.forEach((t) => t.scrollTrigger?.kill())
      }
    })
    return () => mm.revert()
  }, [stations.length, rtl])

  return (
    <section id="track" ref={section} className="track sec--dark" aria-label={t.track.label}>
      <div className="wrap track__head" data-reveal>
        <h2 className="h-section">{heading}</h2>
        <p className="sec-head__intro on-dark">{intro}</p>
      </div>
      <div className="track__viewport" dir="ltr">
        <div ref={rail} className="track__rail" style={{ width }}>
          {FIGURES.map((f, i) => (
            <img
              key={f.src}
              className="track__fig"
              src={f.src}
              alt={t.track.figures[i] || ''}
              style={{ [rtl ? 'right' : 'left']: 150 + (i * (width - 520)) / (FIGURES.length - 1), height: f.h, top: 300 - f.h }}
            />
          ))}
          <div className="track__lane" aria-hidden="true">
            <span className="track__lane-fill" />
          </div>
          <ol className="track__stations">
            {stations.map((s, i) => (
              <li
                key={s.id}
                className={`station ${s.current ? 'is-current' : ''}`}
                style={{ [rtl ? 'right' : 'left']: FIRST + i * STEP }}
                dir="auto"
              >
                <span className={`station__step ${i % 2 ? 'is-low' : ''} ${i >= stations.length - 3 ? 'is-boot' : ''}`} aria-hidden="true" />
                <span className="station__logo">
                  {s.logo ? <img src={s.logo.url} alt={s.logo.alt} /> : <em>{t.track.logo}</em>}
                </span>
                <span className="station__years">{s.years}</span>
                <strong className="station__place">{s.place}</strong>
                <span className="station__role">{s.role}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
