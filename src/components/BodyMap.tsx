'use client'
import { useState } from 'react'
import Modal, { PHONE } from './Modal'
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
const pinStyle = (p: Pin) =>
  'r' in p ? { right: `calc(100% - ${p.r}px)`, top: p.t } : { left: p.l, top: p.t }

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
  // the adult area to go back to when switching from Children to Adults
  const [adultKey, setAdultKey] = useState(start?.key)
  const [modal, setModal] = useState(false)

  const area = areas.find((a) => a.key === key)
  if (!area) return null
  const isKids = key === 'kids'
  const view = isKids ? 'kids' : area.view
  const kids = areas.find((a) => a.key === 'kids')
  /** `show`: on a phone, open the certificates modal (area buttons and Children do; Adults doesn't) */
  const pick = (k: SiteData['areas'][number]['key'], show = true) => {
    setKey(k)
    if (k !== 'kids') setAdultKey(k)
    // phones show the certificates in a modal instead of the card
    if (show && window.matchMedia(PHONE).matches) setModal(true)
  }

  const certificates = (
    <>
      <span className="bodymap__label">{t.body.selected}</span>
      <h3 key={`h${key}`} className="bodymap__title anim-in">
        {area.name}
      </h3>
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
    </>
  )

  return (
    <section id="map" className="bodymap sec">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2 className="h-section">{heading}</h2>
          <p className="sec-head__intro">{intro}</p>
        </div>
        <div className="bodymap__grid">
          {/* the photo with the Adults / Children switch right under it */}
          <div className="bodymap__side">
            <div className="bodymap__figure" dir="ltr" data-reveal>
              <img
                className={`bodymap__img ${view === 'back' ? 'is-on' : ''}`}
                src="/img/body/back.jpg"
                alt={t.body.back}
              />
              <img
                className={`bodymap__img ${view === 'front' ? 'is-on' : ''}`}
                src="/img/body/front.jpg"
                alt={t.body.front}
              />
              <img
                className={`bodymap__img ${view === 'kids' ? 'is-on' : ''}`}
                src="/img/body/kid-back.png"
                alt={t.body.kidsPhoto}
              />
              <div key={key} className="bodymap__tapes" aria-hidden="true">
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
              {/* children have no body-part certificates, so the area buttons are adults only */}
              {!isKids &&
                areas
                  .filter((a) => PINS[a.key])
                  .map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      className="chip chip--pin"
                      aria-pressed={a.key === key}
                      style={pinStyle(PINS[a.key])}
                      onClick={() => pick(a.key)}
                    >
                      {a.name}
                    </button>
                  ))}
            </div>
            {kids && (
              <div className="bodymap__switch" role="group" aria-label={t.body.patient} data-reveal>
                <span
                  className={`bodymap__switch-thumb ${isKids ? 'is-kids' : ''}`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  aria-pressed={!isKids}
                  onClick={() => adultKey && pick(adultKey, false)}
                >
                  {t.body.adults}
                </button>
                <button type="button" aria-pressed={isKids} onClick={() => pick('kids')}>
                  {t.body.children}
                </button>
              </div>
            )}
          </div>

          <div className="bodymap__card" data-reveal>
            <span className="bodymap__ribbon" aria-hidden="true" />
            {certificates}
          </div>
        </div>
      </div>

      {/* phones: the same certificates in a modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        label={area.name}
        closeLabel={t.body.close}
      >
        {certificates}
      </Modal>
    </section>
  )
}
