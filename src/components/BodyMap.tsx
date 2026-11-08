'use client'
import { useId, useState } from 'react'
import Modal, { PHONE } from './Modal'
import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

// Region layers share the photo's 338×600 coordinates and its transparent silhouette.
const REGIONS: Record<string, string> = {
  neck: 'M144 99 Q169 108 188 99 L191 133 Q169 146 142 133 Z',
  back: 'M128 128 Q169 112 211 128 L204 217 Q169 239 133 217 Z',
  si: 'M122 216 Q169 232 213 216 L208 250 Q169 264 127 250 Z',
  shoulder: 'M89 126 Q106 119 125 132 L129 162 Q119 184 101 182 L85 158 Z',
  knee: 'M105 411 Q126 399 150 413 L151 455 Q130 477 106 455 Z',
  ankle: 'M111 491 Q130 480 149 493 L151 533 Q129 550 104 535 Z',
  kids: 'M155 237 Q169 230 183 237 L182 310 Q169 321 155 310 Z',
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
  const maskId = useId()

  const area = areas.find((a) => a.key === key)
  if (!area) return null
  const isKids = key === 'kids'
  const view = isKids ? 'kids' : area.view
  const photo = isKids ? '/img/body/kid-back.png' : `/img/body/${view === 'back' ? 'back' : 'front'}.png`
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
                src="/img/body/back.png"
                alt={t.body.back}
              />
              <img
                className={`bodymap__img ${view === 'front' ? 'is-on' : ''}`}
                src="/img/body/front.png"
                alt={t.body.front}
              />
              <img
                className={`bodymap__img ${view === 'kids' ? 'is-on' : ''}`}
                src="/img/body/kid-back.png"
                alt={t.body.kidsPhoto}
              />
              <svg className="bodymap__highlight" viewBox="0 0 338 600" aria-hidden="true">
                <defs>
                  <mask id={maskId} style={{ maskType: 'alpha' }}>
                    <image href={photo} width="338" height="600" preserveAspectRatio="none" />
                  </mask>
                </defs>
                <g mask={`url(#${maskId})`}>
                  <path key={key} d={REGIONS[key || '']} className="bodymap__region" />
                </g>
              </svg>
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
