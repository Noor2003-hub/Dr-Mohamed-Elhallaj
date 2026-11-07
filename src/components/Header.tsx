'use client'
import { useEffect, useRef } from 'react'
import type { Img } from '@/lib/data'
import { waLink } from '@/lib/links'
import { homePath, type Dict, type Locale } from '@/lib/i18n'

export default function Header({ logo, whatsapp, lang, t }: { logo: Img; whatsapp: string; lang: Locale; t: Dict }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const y = window.scrollY
      const el = ref.current
      if (!el) return
      el.classList.toggle('is-hidden', y > last && y > 300)
      el.classList.toggle('is-scrolled', y > 40)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const other: Locale = lang === 'ar' ? 'en' : 'ar'
  return (
    <header ref={ref} className="site-header">
      <a href="#top" className="site-header__logo" aria-label={t.nav.backToTop}>
        {logo ? <img src={logo.url} alt={logo.alt} /> : <strong>{t.nav.brand}</strong>}
      </a>
      <nav aria-label={t.nav.main} className="site-header__nav">
        <a href="#about">{t.nav.about}</a>
        <a href="#map">{t.nav.treat}</a>
        <a href="#reels">{t.nav.reels}</a>
        <a href="#track">{t.nav.experience}</a>
        <a href="#clinics">{t.nav.clinics}</a>
        <a
          className="lang-switch"
          href={homePath(other)}
          hrefLang={other}
          lang={other}
          aria-label={t.nav.switchLabel}
          title={t.nav.switchLabel}
        >
          {t.nav.switchTo}
        </a>
        <a className="btn btn--cyan btn--sm" href={waLink(whatsapp)} target="_blank" rel="noreferrer">
          {t.nav.book}
        </a>
      </nav>
    </header>
  )
}
