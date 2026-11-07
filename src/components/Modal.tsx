'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Lenis = { stop: () => void; start: () => void }
/** Modals are a phone layout: wider screens show the same content in the page (see styles.css). */
export const PHONE = '(max-width: 900px)'

/**
 * Details sheet used on phones (body map certificates, clinic branches).
 * Slides up over a blurred, darkened page; closes with the X, a tap outside or Escape.
 * While open the page doesn't scroll and focus stays inside; on close it goes back
 * to the control that opened it.
 */
export default function Modal({
  open,
  onClose,
  label,
  closeLabel,
  children,
}: {
  open: boolean
  onClose: () => void
  /** accessible name of the dialog */
  label: string
  closeLabel: string
  children: ReactNode
}) {
  const card = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)
  // latest onClose, without re-running the open effect (and moving focus) on every render
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const lenis = (window as unknown as { lenis?: Lenis }).lenis
    lenis?.stop()
    document.documentElement.classList.add('modal-open')
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
      if (e.key !== 'Tab' || !card.current) return
      const items = [...card.current.querySelectorAll<HTMLElement>('a[href], button')]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    // a wider screen shows the content in the page again
    const mq = window.matchMedia(PHONE)
    const onWide = () => !mq.matches && close.current()
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onWide)
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onWide)
      document.documentElement.classList.remove('modal-open')
      lenis?.start()
      opener?.focus({ preventScroll: true })
    }
  }, [open])

  if (!mounted) return null
  // on <body>, so no section's stacking or transform can hold it inside
  return createPortal(
    <div className={`modal ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="modal__backdrop" onClick={onClose} />
      <div ref={card} className="modal__card" data-lenis-prevent role="dialog" aria-modal="true" aria-label={label} inert={!open}>
        <button ref={closeBtn} type="button" className="modal__close" aria-label={closeLabel} onClick={onClose}>
          <span aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}
