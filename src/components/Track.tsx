'use client'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

/**
 * The recovery walk: six green-screen clips (public/sequence/vidoes) keyed into one transparent
 * image sequence in public/sequence/track. It stays in the middle of the screen and plays
 * with the scroll while the track moves under it. See README to rebuild it.
 */
const WALK_FRAMES = 290
// the last clip (the kick) starts here; from then on the whole lane is lit
const LAST_CLIP_AT = 240 / (WALK_FRAMES - 1)
const WALK_PATH = (i: number) => `/sequence/track/${String(i + 1).padStart(4, '0')}.webp`
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
  const walk = useRef<HTMLCanvasElement>(null)
  const width = FIRST + stations.length * STEP + 260

  // the walk: load the frames once the section is near, draw the frame for a progress (0 → 1)
  const frames = useRef<HTMLImageElement[]>([])
  const progress = useRef(0)
  const draw = (p: number) => {
    progress.current = p
    const c = walk.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    let i = Math.round(gsap.utils.clamp(0, 1, p) * (WALK_FRAMES - 1))
    // nearest earlier frame that has loaded
    const ready = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0
    while (i > 0 && !ready(frames.current[i])) i--
    const img = frames.current[i]
    if (!ready(img)) return
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(img, 0, 0, c.width, c.height)
  }

  useEffect(() => {
    const c = walk.current
    if (!c) return
    const load = () => {
      if (frames.current.length) return
      const still = prefersReducedMotion()
      for (let i = 0; i < WALK_FRAMES; i++) {
        // with reduced motion only the last frame is shown, so only it is loaded
        if (still && i < WALK_FRAMES - 1) continue
        const img = new Image()
        img.onload = () => draw(progress.current)
        img.src = WALK_PATH(i)
        frames.current[i] = img
      }
    }
    const io = new IntersectionObserver(
      (e) => {
        if (!e[0].isIntersecting) return
        load()
        io.disconnect()
      },
      { rootMargin: '1200px 0px' },
    )
    io.observe(c)
    return () => io.disconnect()
    // draw only touches refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // small screens scroll the track by hand: in Arabic start at its right end
    const vp = rail.current?.parentElement
    if (rtl && vp) vp.scrollLeft = vp.scrollWidth
    if (prefersReducedMotion()) {
      draw(1)
      return
    }
    // hand-scrolled track (small screens): the walk follows the horizontal scroll
    const onSwipe = () => {
      if (!vp || window.matchMedia('(min-width: 900px)').matches) return
      const max = vp.scrollWidth - vp.clientWidth
      const p = max > 0 ? Math.abs(vp.scrollLeft) / max : 0
      draw(rtl ? 1 - p : p)
    }
    vp?.addEventListener('scroll', onSwipe, { passive: true })
    onSwipe()
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const r = rail.current!
      const distance = () => r.scrollWidth - window.innerWidth + 40
      // English moves the rail left; Arabic starts at its right end and moves it right
      // the walk reads the tween's own progress, so it follows the scrub smoothing
      // (`this` is the tween: fromTo already calls this while it is being created, before `move` exists)
      const onUpdate = function (this: gsap.core.Tween) {
        draw(this.progress())
      }
      const move = rtl
        ? gsap.fromTo(r, { x: () => -distance() }, { x: 0, ease: 'none', onUpdate })
        : gsap.to(r, { x: () => -distance(), ease: 'none', onUpdate })
      // Stations and figures appear once they pass a "light line". The line moves from
      // 62% of the screen to 92% during the scroll, so the last station is reached at the end
      // on any screen width.
      const light = (p: number) => {
        r.style.setProperty('--progress', String(p))
        const x = Number(gsap.getProperty(r, 'x'))
        const w = window.innerWidth
        const line = w * (0.62 + 0.3 * p)
        // the lane highlight ends at the footprint of the last station that has appeared
        let fill = 0
        r.querySelectorAll<HTMLElement>('.station').forEach((s) => {
          const lit = rtl ? x + s.offsetLeft + s.offsetWidth > w - line : x + s.offsetLeft < line
          s.classList.toggle('is-lit', lit)
          const step = s.querySelector<HTMLElement>('.station__step')
          if (!lit || !step) return
          const left = s.offsetLeft + step.offsetLeft
          fill = Math.max(fill, rtl ? r.offsetWidth - left : left + step.offsetWidth)
        })
        if (p >= LAST_CLIP_AT) fill = r.offsetWidth
        r.style.setProperty('--fill', `${fill}px`)
      }
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        animation: move,
        invalidateOnRefresh: true,
        onUpdate: (self) => light(self.progress),
      })
      section.current!.classList.add('is-animated')
      light(st.progress)
      draw(move.progress())
      return () => {
        st.kill()
        section.current?.classList.remove('is-animated')
      }
    })
    return () => {
      vp?.removeEventListener('scroll', onSwipe)
      mm.revert()
    }
    // draw only touches refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations.length, rtl])

  return (
    <section id="track" ref={section} className="track sec--dark" aria-label={t.track.label}>
      <div className="wrap track__head" data-reveal>
        <h2 className="h-section">{heading}</h2>
        <p className="sec-head__intro on-dark">{intro}</p>
      </div>
      <div className="track__stage">
        <canvas
          ref={walk}
          className="track__walk"
          width={960}
          height={512}
          role="img"
          aria-label={t.track.walk}
        />
        <div className="track__viewport" dir="ltr">
          <div ref={rail} className="track__rail" style={{ width }}>
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
                  <span
                    className={`station__step ${i % 2 ? 'is-low' : ''} ${i >= stations.length - 3 ? 'is-boot' : ''}`}
                    aria-hidden="true"
                  />
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
      </div>
    </section>
  )
}
