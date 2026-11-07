'use client'
import { useMemo, useState } from 'react'
import Grainient from './Grainient'
import type { SiteData } from '@/lib/data'

export default function Reels({
  heading,
  intro,
  reels,
  instagram,
  followers,
}: {
  heading: string
  intro: string
  reels: SiteData['reels']
  instagram: string
  followers: string
}) {
  const tags = useMemo(() => Array.from(new Set(reels.map((r) => r.tag).filter(Boolean))), [reels])
  const [tag, setTag] = useState<string>('All')
  const list = tag === 'All' ? reels : reels.filter((r) => r.tag === tag)

  return (
    <section id="reels" className="reels sec">
      <Grainient variant="a" />
      <div className="wrap rel">
        <div className="sec-head" data-reveal>
          <div>
            <h2 className="h-section">{heading}</h2>
            {intro && <p className="sec-head__intro">{intro}</p>}
          </div>
          <div className="filters" role="group" aria-label="Filter reels">
            {['All', ...tags].map((t) => (
              <button key={t} type="button" className="chip chip--sm" aria-pressed={t === tag} onClick={() => setTag(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="reels__grid">
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
                {r.cover ? <img src={r.cover.url} alt="" loading="lazy" /> : <span className="reel__empty" />}
                {r.tag && <span className="reel__tag">{r.tag}</span>}
                <span className="reel__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                </span>
                {r.views && <span className="reel__views">▶ {r.views} views</span>}
              </span>
              <span className="reel__title" dir={r.dir}>{r.title}</span>
            </a>
          ))}
          {instagram && (
            <a className="reel reel--more anim-in" href={instagram} target="_blank" rel="noreferrer">
              <span className="reel__frame reel__frame--more">
                <strong>More on Instagram</strong>
                {followers && <span>{followers}</span>}
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
