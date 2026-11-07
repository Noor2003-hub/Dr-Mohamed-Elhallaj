import React from 'react'
import { notFound } from 'next/navigation'
import { Archivo, Bricolage_Grotesque, Cairo, IBM_Plex_Sans_Arabic } from 'next/font/google'
import { LOCALES, dirOf, getDict, homePath, isLocale } from '@/lib/i18n'
import '../styles.css'

const archivo = Archivo({ subsets: ['latin'], variable: '--font-body', axes: ['wdth'] })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-head' })
// Arabic pages: Cairo for headings, IBM Plex Sans Arabic for body text
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-head-ar', preload: false })
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-ar',
  preload: false,
})

export const dynamicParams = false
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = getDict(lang)
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, homePath(l)])) },
  }
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const fonts = [archivo, bricolage, cairo, plexArabic].map((f) => f.variable).join(' ')
  return (
    <html lang={lang} dir={dirOf(lang)} className={fonts}>
      <body>{children}</body>
    </html>
  )
}
