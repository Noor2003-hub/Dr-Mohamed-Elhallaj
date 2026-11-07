'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/** Lenis smooth scrolling, kept in sync with GSAP ScrollTrigger. Also runs the shared fade-up reveals. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: Lenis | null = null
    const tick = (time: number) => lenis?.raf(time * 1000)
    if (!prefersReducedMotion()) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      ;(window as unknown as { lenis?: Lenis }).lenis = lenis
    }

    // anchor links go through Lenis
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const el = document.querySelector(a.getAttribute('href')!)
      if (!el) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0 })
      else el.scrollIntoView({ behavior: 'smooth' })
    }
    document.addEventListener('click', onClick)

    // shared reveal: any [data-reveal] fades up when it enters
    const els = gsap.utils.toArray<HTMLElement>('[data-reveal]')
    gsap.set(els, { autoAlpha: 0, y: 36 })
    const batch = ScrollTrigger.batch(els, {
      start: 'top 88%',
      onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    })

    // page height changes as images/fonts load and pins are added → recompute trigger positions
    let timer = 0
    const refresh = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    }
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    const ro = new ResizeObserver(refresh)
    ro.observe(document.body)
    return () => {
      ro.disconnect()
      window.clearTimeout(timer)
      document.removeEventListener('click', onClick)
      window.removeEventListener('load', refresh)
      batch.forEach((t) => t.kill())
      gsap.ticker.remove(tick)
      lenis?.destroy()
    }
  }, [])
  return <>{children}</>
}
