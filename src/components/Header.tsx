'use client'
import { useEffect, useRef } from 'react'
import type { Img } from '@/lib/data'
import { waLink } from '@/lib/links'

export default function Header({ logo, whatsapp }: { logo: Img; whatsapp: string }) {
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
  return (
    <header ref={ref} className="site-header">
      <a href="#top" className="site-header__logo" aria-label="Back to top">
        {logo ? <img src={logo.url} alt={logo.alt} /> : <strong>Dr. Elhallaj</strong>}
      </a>
      <nav aria-label="Main" className="site-header__nav">
        <a href="#about">About</a>
        <a href="#map">What I treat</a>
        <a href="#reels">Reels</a>
        <a href="#track">Experience</a>
        <a href="#clinics">Clinics</a>
        <a className="btn btn--cyan btn--sm" href={waLink(whatsapp)} target="_blank" rel="noreferrer">
          Book on WhatsApp
        </a>
      </nav>
    </header>
  )
}
