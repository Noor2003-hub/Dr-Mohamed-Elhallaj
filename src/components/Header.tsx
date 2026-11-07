'use client'
import { useEffect, useRef, useState } from 'react'
import type { Img } from '@/lib/data'
import { waLink } from '@/lib/links'
import { homePath, type Dict, type Locale } from '@/lib/i18n'

type Lenis = { stop: () => void; start: () => void }

export default function Header({ logo, whatsapp, lang, t }: { logo: Img; whatsapp: string; lang: Locale; t: Dict }) {
  const ref = useRef<HTMLElement>(null)
  const burger = useRef<HTMLButtonElement>(null)
  const drawer = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

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

  // side menu: stop the page scrolling behind it, close on Escape, keep focus inside it
  useEffect(() => {
    if (!open) return
    const lenis = (window as unknown as { lenis?: Lenis }).lenis
    lenis?.stop()
    document.documentElement.classList.add('menu-open')
    const panel = drawer.current
    panel?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key !== 'Tab' || !panel) return
      const items = [...panel.querySelectorAll<HTMLElement>('a, button')]
      const first = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('menu-open')
      lenis?.start()
      burger.current?.focus({ preventScroll: true })
    }
  }, [open])

  // a link in the menu unlocks the page at once, so the smooth scroll to its section can run
  const goTo = () => {
    document.documentElement.classList.remove('menu-open')
    ;(window as unknown as { lenis?: Lenis }).lenis?.start()
    setOpen(false)
  }

  const other: Locale = lang === 'ar' ? 'en' : 'ar'
  const links = [
    ['#about', t.nav.about],
    ['#map', t.nav.treat],
    ['#reels', t.nav.reels],
    ['#track', t.nav.experience],
    ['#clinics', t.nav.clinics],
  ]
  const langSwitch = (
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
  )
  const book = (
    <a className="btn btn--cyan btn--sm" href={waLink(whatsapp)} target="_blank" rel="noreferrer">
      {t.nav.book}
    </a>
  )

  return (
    <>
      <header ref={ref} className="site-header">
        <a href="#top" className="site-header__logo" aria-label={t.nav.backToTop}>
          {logo ? <img src={logo.url} alt={logo.alt} /> : <strong>{t.nav.brand}</strong>}
        </a>
        <nav aria-label={t.nav.main} className="site-header__nav">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          {langSwitch}
          {book}
        </nav>
        {/* smaller screens: the links and the language switch move into the side menu */}
        <button
          ref={burger}
          type="button"
          className="burger"
          aria-expanded={open}
          aria-controls="side-menu"
          aria-label={open ? t.nav.close : t.nav.open}
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" />
        </button>
      </header>

      {/* outside the header: its transform would otherwise hold the fixed menu inside it */}
      <div className={`side-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="side-menu__backdrop" onClick={() => setOpen(false)} />
        <div
          ref={drawer}
          id="side-menu"
          className="side-menu__panel"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.main}
          inert={!open}
        >
          <button type="button" className="side-menu__close" aria-label={t.nav.close} onClick={() => setOpen(false)}>
            <span aria-hidden="true" />
          </button>
          <nav aria-label={t.nav.main}>
            <ol className="side-menu__links">
              {links.map(([href, label], i) => (
                <li key={href} style={{ ['--i' as string]: i }}>
                  <a href={href} onClick={goTo}>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="side-menu__foot" style={{ ['--i' as string]: links.length }}>
            <span className="side-menu__label">{t.nav.language}</span>
            {langSwitch}
            {book}
          </div>
        </div>
      </div>
    </>
  )
}
