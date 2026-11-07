'use client'
import { useState } from 'react'
import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

/**
 * Tape strips drawn on the 338×600 body photos (public/img/body).
 * If the body photos are regenerated, adjust these numbers.
 * c = colour: cyan tape or skin-tone anchor tape.
 */
type Strip = { l: number; t: number; w: number; h: number; r?: number; c?: 'skin' }
const TAPES: Record<string, Strip[]> = {
  neck: [
    { l: 158, t: 101, w: 9, h: 36 },
    { l: 171, t: 101, w: 9, h: 36 },
  ],
  back: [
    { l: 153, t: 151, w: 11, h: 65 },
    { l: 174, t: 151, w: 11, h: 65 },
    { l: 136, t: 194, w: 65, h: 11, c: 'skin' },
  ],
  si: [
    { l: 141, t: 219, w: 57, h: 10, r: 25 },
    { l: 141, t: 219, w: 57, h: 10, r: -25 },
  ],
  shoulder: [
    { l: 97, t: 141, w: 14, h: 56, r: 15 },
    { l: 80, t: 147, w: 56, h: 12, r: -15, c: 'skin' },
  ],
  knee: [
    { l: 112, t: 410, w: 9, h: 52, r: 10 },
    { l: 137, t: 410, w: 9, h: 52, r: -10 },
    { l: 110, t: 452, w: 38, h: 9, c: 'skin' },
  ],
  ankle: [
    { l: 124, t: 500, w: 10, h: 44 },
    { l: 112, t: 528, w: 36, h: 9, r: -20, c: 'skin' },
  ],
  kids: [],
}
// Where each button sits around the body (px on the 338px photo).
// l = left edge of the button; r = right edge, for buttons left of the body,
// so they end next to it whatever the label length (English or Arabic).
type Pin = { l: number; t: number } | { r: number; t: number }
const PINS: Record<string, Pin> = {
  neck: { l: 214, t: 84 },
  shoulder: { r: 96, t: 120 },
  back: { l: 222, t: 164 },
  si: { l: 226, t: 224 },
  knee: { r: 104, t: 404 },
  ankle: { l: 196, t: 500 },
}
const pinStyle = (p: Pin) => ('r' in p ? { right: `calc(100% - ${p.r}px)`, top: p.t } : { left: p.l, top: p.t })

export default function BodyMap({
  heading,
  intro,
  areas,
  t,
}: {
  heading: string
  intro: string
  areas: SiteData['areas']
  t: Dict
}) {
  const start = areas.find((a) => a.key === 'knee') || areas[0]
  const [key, setKey] = useState(start?.key)
  const [kidsPhoto, setKidsPhoto] = useState(true)
  const area = areas.find((a) => a.key === key)
  if (!area) return null
  const kids = areas.find((a) => a.key === 'kids')
  // children get their own photo (public/img/body/kids.jpg); until it exists, the front photo is used
  const view = key === 'kids' && kidsPhoto ? 'kids' : area.view

  return (
    <section id="map" className="bodymap sec">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2 className="h-section">{heading}</h2>
          <p className="sec-head__intro">{intro}</p>
        </div>
        <div className="bodymap__grid">
          <div className="bodymap__figure" dir="ltr" data-reveal>
            <img className={`bodymap__img ${view === 'back' ? 'is-on' : ''}`} src="/img/body/back.jpg" alt={t.body.back} />
            <img className={`bodymap__img ${view === 'front' ? 'is-on' : ''}`} src="/img/body/front.jpg" alt={t.body.front} />
            {kids && kidsPhoto && (
              <img
                className={`bodymap__img ${view === 'kids' ? 'is-on' : ''}`}
                src="/img/body/kids.jpg"
                alt={t.body.kidsPhoto}
                onError={() => setKidsPhoto(false)}
              />
            )}
            <div key={key} className={`bodymap__tapes ${key === 'kids' ? 'is-kids' : ''}`} aria-hidden="true">
              {(TAPES[key || ''] || []).map((s, i) => (
                <span
                  key={i}
                  className={`tape ${s.c === 'skin' ? 'tape--skin' : ''}`}
                  style={{
                    left: s.l,
                    top: s.t,
                    width: s.w,
                    height: s.h,
                    ['--r' as string]: `${s.r || 0}deg`,
                    ['--d' as string]: `${i * 120}ms`,
                    ['--o' as string]: s.w > s.h ? 'left center' : 'center top',
                  }}
                />
              ))}
            </div>
            {areas
              .filter((a) => PINS[a.key])
              .map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className="chip chip--pin"
                  aria-pressed={a.key === key}
                  style={pinStyle(PINS[a.key])}
                  onClick={() => setKey(a.key)}
                >
                  {a.name}
                </button>
              ))}
          </div>

          <div className="bodymap__card" data-reveal>
            <span className="bodymap__ribbon" aria-hidden="true" />
            <span className="bodymap__label">{t.body.selected}</span>
            <h3 key={`h${key}`} className="bodymap__title anim-in">{area.name}</h3>
            <ul key={`l${key}`} className="bodymap__list">
              {area.certificates.map((c, i) => (
                <li key={c.title} className="anim-in" style={{ animationDelay: `${80 + i * 70}ms` }}>
                  <span className="bodymap__row">
                    <strong>
                      {c.title}
                      {c.inProgress ? t.body.inProgress : ''}
                    </strong>
                    <span className="muted">{c.issuer}</span>
                  </span>
                  {c.description && <span className="bodymap__desc">{c.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {kids && (
          <div className="bodymap__kids" data-reveal>
            <span className="muted">{t.body.forChildren}</span>
            <button type="button" className="chip" aria-pressed={key === 'kids'} onClick={() => setKey('kids')}>
              {t.body.kids}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
