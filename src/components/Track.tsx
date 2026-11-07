'use client'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import type { SiteData } from '@/lib/data'

/** Recovery stages drawn above the track, left to right. Files are in public/img/track. */
const FIGURES = [
  { src: '/img/track/t1.png', alt: 'The doctor pushing the patient in a wheelchair', h: 290 },
  { src: '/img/track/t2.png', alt: 'The patient walking on two crutches beside the doctor', h: 290 },
  { src: '/img/track/t3.png', alt: 'The patient walking with one crutch, the doctor talking to him', h: 290 },
  { src: '/img/track/t4.png', alt: 'The patient walking on his own with kinesio tape, the doctor just behind', h: 290 },
  { src: '/img/track/t5.png', alt: 'The doctor watching proudly as the patient walks ahead', h: 290 },
  { src: '/img/track/t6.png', alt: 'The patient running', h: 262 },
  { src: '/img/track/t7.png', alt: 'The patient kicking a football', h: 226 },
]
const STEP = 290 // px between stations
const FIRST = 240

export default function Track({
  heading,
  intro,
  stations,
}: {
  heading: string
  intro: string
  stations: SiteData['experiences']
}) {
  const section = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const width = FIRST + stations.length * STEP + 260

  useEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const r = rail.current!
      const distance = () => r.scrollWidth - window.innerWidth + 40
      const move = gsap.to(r, { x: () => -distance(), ease: 'none' })
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
          const passed = -Number(gsap.getProperty(r, 'x')) + window.innerWidth * 0.62
          r.querySelectorAll<HTMLElement>('.station').forEach((s) => {
            s.classList.toggle('is-lit', s.offsetLeft < passed)
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
          scrollTrigger: { trigger: f, containerAnimation: move, start: 'left 92%', end: 'left 60%', scrub: true },
        }),
      )
      return () => {
        st.kill()
        tweens.forEach((t) => t.scrollTrigger?.kill())
      }
    })
    return () => mm.revert()
  }, [stations.length])

  return (
    <section id="track" ref={section} className="track sec--dark" aria-label="Experience">
      <div className="wrap track__head" data-reveal>
        <h2 className="h-section">{heading}</h2>
        <p className="sec-head__intro on-dark">{intro}</p>
      </div>
      <div className="track__viewport">
        <div ref={rail} className="track__rail" style={{ width }}>
          {FIGURES.map((f, i) => (
            <img
              key={f.src}
              className="track__fig"
              src={f.src}
              alt={f.alt}
              style={{ left: 150 + (i * (width - 520)) / (FIGURES.length - 1), height: f.h, top: 300 - f.h }}
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
                style={{ left: FIRST + i * STEP }}
              >
                <span className={`station__step ${i % 2 ? 'is-low' : ''} ${i >= stations.length - 3 ? 'is-boot' : ''}`} aria-hidden="true" />
                <span className="station__logo">
                  {s.logo ? <img src={s.logo.url} alt={s.logo.alt} /> : <em>Logo</em>}
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
