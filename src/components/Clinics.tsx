'use client'
import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import geo from '@/lib/mapgeo.json'
import type { SiteData } from '@/lib/data'
import { telLink } from '@/lib/links'
import type { Dict, Locale } from '@/lib/i18n'

const LAYERS = 12 // slices that build each raised area
const COLORS = {
  orange: { top: '#F26B3A', side: '#A03A18', text: '#FFFFFF' },
  cyan: { top: '#2BB3D6', side: '#0B607D', text: '#032D3B' },
}
type Area = { polygon: number[][]; center: number[] }
const AREAS = geo.areas as Record<string, Area>

/**
 * Experts Physio House: co-founder seal + a real CSS-3D map.
 * The flat map image lies on a plane that tilts back while you scroll,
 * then each branch area rises out of it, one after the other.
 */
export default function Clinics({
  site,
  clinics,
  lang,
  t,
}: {
  site: SiteData['site']
  clinics: SiteData['clinics']
  lang: Locale
  t: Dict
}) {
  const section = useRef<HTMLElement>(null)
  const plane = useRef<HTMLDivElement>(null)
  const seal = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const pl = plane.current!
    const areas = gsap.utils.toArray<HTMLElement>('.map3d__area', pl)
    const wrap = pl.parentElement as HTMLElement
    const labels = gsap.utils.toArray<HTMLElement>('.map3d__label', wrap)
    // labels live outside the 3D plane; each frame they follow their anchor on top of the raised area
    let raf = 0
    const place = () => {
      const w = wrap.getBoundingClientRect()
      labels.forEach((l) => {
        const an = pl.querySelector<HTMLElement>(`[data-anchor="${l.dataset.label}"]`)
        if (!an) return
        const r = an.getBoundingClientRect()
        l.style.transform = `translate(${r.left - w.left}px, ${r.top - w.top}px) translate(-50%, -100%)`
      })
      raf = requestAnimationFrame(place)
    }
    raf = requestAnimationFrame(place)
    if (prefersReducedMotion()) {
      gsap.set(pl, { rotateX: 48 })
      areas.forEach((a) => a.style.setProperty('--h', '1'))
      gsap.set(labels, { autoAlpha: 1 })
      return () => cancelAnimationFrame(raf)
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.map3d', start: 'top 85%', end: 'center 45%', scrub: 0.8 },
      })
      tl.fromTo(pl, { rotateX: 6, scale: 0.88 }, { rotateX: 48, scale: 1, ease: 'power2.out', duration: 1 })
      areas.forEach((a, i) => {
        tl.fromTo(a, { '--h': 0 }, { '--h': 1, ease: 'back.out(1.6)', duration: 0.5 }, 0.55 + i * 0.3)
        if (labels[i]) tl.fromTo(labels[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.8 + i * 0.3)
      })
      gsap.to(seal.current, {
        rotate: 200,
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, section)
    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [])

  const words = site.clinicName.split(' ')
  return (
    <section id="clinics" ref={section} className="clinics sec">
      <div className="wrap clinics__head">
        <div className="seal" data-reveal>
          <svg ref={seal} className="seal__ring spin" viewBox="0 0 250 250" aria-hidden="true">
            <defs>
              <path id="seal-path" d="M125,125 m-104,0 a104,104 0 1,1 208,0 a104,104 0 1,1 -208,0" />
            </defs>
            <text>
              <textPath href="#seal-path">
                {`${site.clinicRole} ✦ ${site.clinicName} ✦ `.toUpperCase()}
              </textPath>
            </text>
          </svg>
          <span className="seal__logo">
            {site.clinicLogo && <img src={site.clinicLogo.url} alt={site.clinicLogo.alt} />}
          </span>
        </div>
        <div className="clinics__title">
          <span className="badge-role" data-reveal>
            <i aria-hidden="true">★</i>
            {site.clinicRole}
          </span>
          <h2 className="h-display" data-reveal>
            {words[0]} <span className="accent-teal">{words.slice(1).join(' ')}</span>
          </h2>
          {/* on the Arabic page the main name is already Arabic */}
          {lang !== 'ar' && site.clinicNameArabic && (
            <p className="clinics__ar" dir="rtl" lang="ar" data-reveal>
              {site.clinicNameArabic}
            </p>
          )}
          {site.clinicInstagram && (
            <a className="link" href={site.clinicInstagram} target="_blank" rel="noreferrer" data-reveal>
              {t.clinics.followClinic}
            </a>
          )}
        </div>
      </div>

      <div className="map3d" dir="ltr" aria-label={t.clinics.map}>
        <div ref={plane} className="map3d__plane" style={{ aspectRatio: `${geo.width} / ${geo.height}` }}>
          <img className="map3d__img" src="/map/alexandria-east.jpg" alt="" />
          <span className="map3d__sea">{t.clinics.sea}</span>
          {clinics.map((c, ci) => {
            const a = c.area ? AREAS[c.area] : null
            if (!a) return null
            const col = COLORS[c.color as keyof typeof COLORS] || COLORS.orange
            const pts = a.polygon.map((p) => p.join(',')).join(' ')
            return (
              <div key={c.id} className="map3d__area" style={{ ['--h' as string]: 0 }}>
                {Array.from({ length: LAYERS }).map((_, k) => (
                  <svg
                    key={k}
                    className="map3d__slice"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{ ['--k' as string]: k }}
                    aria-hidden="true"
                  >
                    {k === LAYERS - 1 ? (
                      // top face: the raised piece of the map itself, tinted, so the streets show through
                      <>
                        <clipPath id={`map-area-${c.id}`}>
                          <polygon points={pts} />
                        </clipPath>
                        <image
                          href="/map/alexandria-east.jpg"
                          width="100"
                          height="100"
                          preserveAspectRatio="none"
                          clipPath={`url(#map-area-${c.id})`}
                        />
                        <polygon points={pts} fill={col.top} fillOpacity={0.6} stroke="#fff" strokeWidth={0.25} />
                      </>
                    ) : (
                      <polygon points={pts} fill={col.side} />
                    )}
                  </svg>
                ))}
                <span className="map3d__anchor" data-anchor={ci} style={{ left: `${a.center[0]}%`, top: `${a.center[1]}%` }} />
              </div>
            )
          })}
        </div>
        {clinics.map((c, ci) => {
          const col = COLORS[c.color as keyof typeof COLORS] || COLORS.orange
          if (!c.area || !AREAS[c.area]) return null
          return (
            <div key={c.id} className="map3d__label" data-label={ci}>
              <span style={{ background: col.top, color: col.text }}>
                {String(ci + 1).padStart(2, '0')} · {c.name}
              </span>
              <i style={{ background: col.side }} />
            </div>
          )
        })}
      </div>

      <div className="wrap clinics__cards">
        {clinics.map((c, ci) => {
          const col = COLORS[c.color as keyof typeof COLORS] || COLORS.orange
          return (
            <article key={c.id} className="branch" style={{ borderTopColor: col.top }} data-reveal>
              <span className="branch__num" style={{ background: col.top, color: col.text }}>
                {String(ci + 1).padStart(2, '0')}
              </span>
              <div className="branch__body">
                <strong className="branch__name">{c.name}</strong>
                <span>{c.address}</span>
                {c.phones.length > 0 && (
                  <span>
                    {c.phones.map((p, i) => (
                      <span key={p}>
                        {i > 0 && ' · '}
                        <a href={telLink(p)}>{p}</a>
                      </span>
                    ))}
                  </span>
                )}
                {c.hours && <span>{c.hours}</span>}
                <a
                  className="link"
                  href={c.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(`${c.address}, ${c.name}, Alexandria`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.clinics.directions}
                </a>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
