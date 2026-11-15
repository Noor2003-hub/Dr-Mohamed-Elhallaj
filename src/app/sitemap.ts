import type { MetadataRoute } from 'next'
import { LOCALES, homePath } from '@/lib/i18n'
import { SITE_URL } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((lang) => [lang, `${SITE_URL}${homePath(lang)}`]),
  )

  return LOCALES.map((lang) => ({
    url: `${SITE_URL}${homePath(lang)}`,
    alternates: { languages },
  }))
}
