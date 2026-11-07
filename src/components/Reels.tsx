'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SectionGradient from './SectionGradient'
import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

export default function Reels({
  heading,
  intro,
  reels,
  instagram,
  followers,
  t,
}: {
  heading: string
  intro: string
  reels: SiteData['reels']
  instagram: string
  followers: string
  t: Dict
}) {
  const tags = useMemo(() => Array.from(new Set(reels.map((r) => r.tag).filter(Boolean))), [reels])
  const [tag, setTag] = useState<string>('') // '' = all
  const list = tag ? reels.filter((r) => r.tag === tag) : reels

  const track = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const updateEdges = useCallback(() => {
    const el = track.current
    if (!el) return
    // in Arabic (rtl) scrollLeft runs from 0 down to negative numbers
    const pos = Math.abs(el.scrollLeft)
    setEdge({ start: pos < 4, end: pos + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    el.scrollTo({ left: 0 })
    updateEdges()
    const ro = new ResizeObserver(updateEdges)
    ro.observe(el)
    return () => ro.disconnect()
  }, [tag, updateEdges])

  const step = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.reel')
    const amount = card ? card.offsetWidth + 22 : el.clientWidth * 0.8
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rtl = getComputedStyle(el).direction === 'rtl'
    el.scrollBy({ left: dir * amount * (rtl ? -1 : 1), behavior: reduce ? 'auto' : 'smooth' })
  }

  // mouse drag to scroll; a drag doesn't open the reel
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !track.current) return
    drag.current = { down: true, x: e.clientX, left: track.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.down || !track.current) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 5) {
      if (!d.moved) track.current.classList.add('is-dragging')
      d.moved = true
    }
    if (d.moved) track.current.scrollLeft = d.left - dx
  }
  const endDrag = () => {
    drag.current.down = false
    track.current?.classList.remove('is-dragging')
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <section id="reels" className="reels sec">
      <SectionGradient />
      <div className="wrap rel">
        <div className="sec-head" data-reveal>
          <div>
            <h2 className="h-section">{heading}</h2>
            {intro && <p className="sec-head__intro">{intro}</p>}
          </div>
          <div className="reels__controls">
            <div className="filters" role="group" aria-label={t.reels.filter}>
              {['', ...tags].map((x) => (
                <button key={x || 'all'} type="button" className="chip chip--sm" aria-pressed={x === tag} onClick={() => setTag(x)}>
                  {x || t.reels.all}
                </button>
              ))}
            </div>
            <div className="reels__arrows">
              <button type="button" className="reels__arrow" aria-label={t.reels.prev} disabled={edge.start} onClick={() => step(-1)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="reels__arrow" aria-label={t.reels.next} disabled={edge.end} onClick={() => step(1)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={track}
        className="reels__track"
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {list.map((r, i) => (
          <a
            key={`${tag}-${r.id}`}
            className="reel anim-in"
            style={{ animationDelay: `${i * 60}ms` }}
            href={r.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="reel__frame">
              {r.cover ? <img src={r.cover.url} alt="" loading="lazy" draggable={false} /> : <span className="reel__empty" />}
              {r.tag && <span className="reel__tag">{r.tag}</span>}
              <span className="reel__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
              </span>
              {r.views && <span className="reel__views">▶ {r.views} {t.reels.views}</span>}
            </span>
            <span className="reel__title" dir={r.dir}>{r.title}</span>
          </a>
        ))}
        {instagram && (
          <a className="reel reel--more anim-in" href={instagram} target="_blank" rel="noreferrer">
            <span className="reel__frame reel__frame--more">
              <strong>{t.reels.more}</strong>
              {followers && <span>{followers}</span>}
            </span>
          </a>
        )}
      </div>
    </section>
  )
}
