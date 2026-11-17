import type { SiteData } from './data'
import { getDict, homePath, type Locale } from './i18n'
import { SITE_URL } from './site-url'

// User-supplied spellings of the same doctor's name, not separate identities.
const alternateNames = [
  'محمد الحلاج',
  'محمد عبد اللطيف الحلاج',
  'دكتور محمد الحلاج',
  'د محمد الحلاج',
  'دكتور الحلاج',
  'Dr Mohamed Elhallaj',
  'Dr Mohamed Alhallaj',
  'Mohamed Elhallaj',
  'Mohamed Alhallaj',
  'Dr Elhallaj',
  'Dr Mohamed Elhallag',
]

export function searchIdentity(site: SiteData['site'], lang: Locale) {
  const personId = `${SITE_URL}/#doctor`
  const websiteId = `${SITE_URL}/#website`
  const pageUrl = `${SITE_URL}${homePath(lang)}`
  const meta = getDict(lang).meta
  const sameAs = [...new Set([site.instagram, site.youtube])].filter((url) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
      return false
    }
  })

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: site.fullName,
        alternateName: alternateNames,
        url: `${SITE_URL}/`,
        description: meta.description,
        ...(site.title ? { jobTitle: site.title } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${SITE_URL}/`,
        name: lang === 'ar' ? 'دكتور محمد الحلاج' : 'Dr Mohamed Elhallaj',
        inLanguage: ['en', 'ar'],
        about: { '@id': personId },
        publisher: { '@id': personId },
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: meta.title,
        description: meta.description,
        inLanguage: lang,
        isPartOf: { '@id': websiteId },
        about: { '@id': personId },
        mainEntity: { '@id': personId },
      },
    ],
  }
}
