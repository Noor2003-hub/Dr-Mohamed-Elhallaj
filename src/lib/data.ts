import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'

export type Img = { url: string; alt: string } | null

/** Turn an upload field (id or populated doc) into { url, alt }. */
export const img = (m: unknown): Img => {
  if (!m || typeof m !== 'object') return null
  const d = m as Media
  return d.url ? { url: d.url, alt: d.alt || '' } : null
}

export async function getSiteData() {
  const payload = await getPayload({ config })
  const visible = { visible: { not_equals: false } }
  const [site, tools, areas, certificates, experiences, reels, clinics] = await Promise.all([
    payload.findGlobal({ slug: 'site', depth: 1 }),
    payload.find({ collection: 'tools', where: visible, sort: 'order', limit: 50, depth: 1 }),
    payload.find({ collection: 'body-areas', sort: 'order', limit: 20, depth: 1 }),
    payload.find({ collection: 'certificates', where: visible, sort: 'order', limit: 100, depth: 0 }),
    payload.find({ collection: 'experiences', where: visible, sort: 'order', limit: 50, depth: 1 }),
    payload.find({ collection: 'reels', where: visible, sort: 'order', limit: 50, depth: 1 }),
    payload.find({ collection: 'clinics', where: visible, sort: 'order', limit: 10, depth: 0 }),
  ])

  return {
    site: {
      name: site.name,
      fullName: site.fullName || site.name,
      title: site.title || '',
      heroLines: (site.heroLines || '').split('\n').filter(Boolean),
      logoOnDark: img(site.logoOnDark),
      logoOnLight: img(site.logoOnLight),
      aboutHeading: site.aboutHeading || 'Who is Dr. Elhallaj?',
      storyLines: (site.storyLines || []).map((l) => l.text),
      years: site.years ?? 18,
      yearsLabel: site.yearsLabel || 'Years of experience',
      aboutText: site.aboutText || '',
      clinicName: site.clinicName || '',
      clinicNameArabic: site.clinicNameArabic || '',
      clinicRole: site.clinicRole || 'Co-founder',
      clinicLogo: img(site.clinicLogo),
      clinicInstagram: site.clinicInstagram || '',
      contactHeading: site.contactHeading || '',
      contactText: site.contactText || '',
      contactImage: img(site.contactImage),
      whatsapp: site.whatsapp || '',
      email: site.email || '',
      location: site.location || '',
      instagram: site.instagram || '',
      instagramFollowers: site.instagramFollowers || '',
      youtube: site.youtube || '',
      mapHeading: site.mapHeading || '',
      mapIntro: site.mapIntro || '',
      toolsHeading: site.toolsHeading || '',
      reelsHeading: site.reelsHeading || '',
      reelsIntro: site.reelsIntro || '',
      trackHeading: site.trackHeading || '',
      trackIntro: site.trackIntro || '',
      educationHeading: site.educationHeading || '',
      degreesNote: site.degreesNote || '',
    },
    tools: tools.docs.map((t) => ({
      id: t.id,
      title: t.title,
      shortName: t.shortName || t.title,
      tag: t.tag || '',
      image: img(t.image),
      description: t.description,
    })),
    areas: areas.docs.map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      view: a.view || 'back',
      certificates: (a.certificates || [])
        .filter((c): c is Exclude<typeof c, number> => typeof c === 'object')
        .map((c) => ({ title: c.title, issuer: c.issuer || '', description: c.description || '', inProgress: !!c.inProgress })),
    })),
    certificates: certificates.docs.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      issuer: c.issuer || '',
      years: c.years || '',
      note: c.note || '',
      inProgress: !!c.inProgress,
    })),
    experiences: experiences.docs.map((e) => ({
      id: e.id,
      place: e.place,
      role: e.role,
      years: e.years,
      current: !!e.current,
      logo: img(e.logo),
    })),
    reels: reels.docs.map((r) => ({
      id: r.id,
      url: r.url,
      title: r.title,
      dir: r.direction || 'ltr',
      views: r.views || '',
      tag: r.tag || '',
      cover: img(r.cover),
    })),
    clinics: clinics.docs.map((c) => ({
      id: c.id,
      name: c.name,
      area: c.mapArea || null,
      color: c.color || 'orange',
      address: c.address,
      phones: (c.phones || []).map((p) => p.number),
      hours: c.hours || '',
      mapsUrl: c.mapsUrl || '',
    })),
  }
}

export type SiteData = Awaited<ReturnType<typeof getSiteData>>
