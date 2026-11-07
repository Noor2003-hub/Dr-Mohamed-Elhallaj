/**
 * Imports all website content from src/import/content.json (English) and
 * src/import/content.ar.json (Arabic) into the CMS.
 *
 *   npm run import
 *
 * - Image fields hold a file name from src/import/images (or "" for none).
 * - content.ar.json holds only the text that changes between languages. Anything
 *   missing there shows the English text on the Arabic page.
 * - The whole file is checked first; if anything is wrong nothing is changed.
 * - Importing replaces all content collections and the site settings. Admin users are kept.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '@payload-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES = path.resolve(dirname, 'images')
const FILE = path.resolve(dirname, process.env.IMPORT_FILE || 'content.json')
const FILE_AR = path.resolve(dirname, process.env.IMPORT_FILE_AR || 'content.ar.json')

/* ---------- shape of content.json ---------- */
type ImageRef = { file: string; alt: string }
type CertType = 'degree' | 'diploma' | 'course'
type AreaKey = 'neck' | 'shoulder' | 'back' | 'si' | 'knee' | 'ankle' | 'kids'
type Content = {
  site: {
    name: string
    fullName?: string
    title?: string
    heroLines: string[]
    logoOnDark?: ImageRef
    logoOnLight?: ImageRef
    about: { heading?: string; storyLines: string[]; years?: number; yearsLabel?: string; text?: string }
    clinic: { name: string; nameArabic?: string; role?: string; logo?: ImageRef; instagram?: string }
    contact: {
      heading?: string
      text?: string
      image?: ImageRef
      whatsapp?: string
      email?: string
      location?: string
      instagram?: string
      instagramFollowers?: string
      youtube?: string
    }
    sections: Record<string, string>
  }
  certificates: {
    key: string
    title: string
    type: CertType
    issuer?: string
    years?: string
    note?: string
    description?: string
    inProgress?: boolean
  }[]
  bodyAreas: { name: string; key: AreaKey; view: 'front' | 'back'; certificates: string[] }[]
  tools: { title: string; shortName?: string; tag?: string; image: ImageRef; description: string }[]
  experiences: { years: string; place: string; role: string; logo?: string; current?: boolean }[]
  reels: { url: string; title: string; views?: string; tag?: string; direction?: 'ltr' | 'rtl'; cover?: string }[]
  clinics: {
    name: string
    mapArea?: 'smouha' | 'gianaclis'
    color?: 'orange' | 'cyan'
    address: string
    phones?: string[]
    hours?: string
    mapsUrl?: string
  }[]
}

/** content.ar.json: the same shape, only the translated text. */
type Alt = { alt?: string }
type ContentAr = {
  site?: {
    name?: string
    fullName?: string
    title?: string
    heroLines?: string[]
    logoOnDark?: Alt
    logoOnLight?: Alt
    about?: { heading?: string; storyLines?: string[]; yearsLabel?: string; text?: string }
    clinic?: { name?: string; role?: string; logo?: Alt }
    contact?: { heading?: string; text?: string; image?: Alt; location?: string; instagramFollowers?: string }
    sections?: Record<string, string>
  }
  certificates?: { key: string; title?: string; issuer?: string; years?: string; note?: string; description?: string }[]
  bodyAreas?: { key: AreaKey; name?: string }[]
  tools?: { title?: string; shortName?: string; tag?: string; imageAlt?: string; description?: string }[]
  experiences?: { years?: string; place?: string; role?: string }[]
  reels?: { title?: string; tag?: string; direction?: 'ltr' | 'rtl' }[]
  clinics?: { name?: string; address?: string; hours?: string }[]
}

/* ---------- read + check ---------- */
const data = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Content
const ar = (fs.existsSync(FILE_AR) ? JSON.parse(fs.readFileSync(FILE_AR, 'utf8')) : {}) as ContentAr
const problems: string[] = []
const checkImage = (file: string | undefined, where: string) => {
  if (file && !fs.existsSync(path.join(IMAGES, file))) problems.push(`${where}: image "${file}" is not in src/import/images`)
}
checkImage(data.site.logoOnDark?.file, 'site.logoOnDark')
checkImage(data.site.logoOnLight?.file, 'site.logoOnLight')
checkImage(data.site.clinic.logo?.file, 'site.clinic.logo')
checkImage(data.site.contact.image?.file, 'site.contact.image')
data.tools.forEach((t, i) => checkImage(t.image?.file, `tools[${i}] ${t.title}`))
data.experiences.forEach((e, i) => checkImage(e.logo, `experiences[${i}] ${e.place}`))
data.reels.forEach((r, i) => checkImage(r.cover, `reels[${i}] ${r.title}`))
const certKeys = new Set(data.certificates.map((c) => c.key))
if (certKeys.size !== data.certificates.length) problems.push('certificates: two certificates share the same "key"')
data.bodyAreas.forEach((a) =>
  a.certificates.forEach((k) => {
    if (!certKeys.has(k)) problems.push(`bodyAreas ${a.name}: no certificate with key "${k}"`)
  }),
)
const areaKeys = data.bodyAreas.map((a) => a.key)
if (new Set(areaKeys).size !== areaKeys.length) problems.push('bodyAreas: each "key" can be used once')
// Arabic file: keys must exist in content.json, and lists matched by position must not be longer
ar.certificates?.forEach((c) => {
  if (!certKeys.has(c.key)) problems.push(`content.ar.json certificates: no certificate with key "${c.key}"`)
})
ar.bodyAreas?.forEach((a) => {
  if (!areaKeys.includes(a.key)) problems.push(`content.ar.json bodyAreas: no body area with key "${a.key}"`)
})
for (const list of ['tools', 'experiences', 'reels', 'clinics'] as const) {
  const n = ar[list]?.length ?? 0
  if (n > data[list].length) problems.push(`content.ar.json ${list}: has ${n} items but content.json has ${data[list].length}`)
}
if (problems.length) {
  console.error(`\nImport stopped, nothing was changed:\n - ${problems.join('\n - ')}\n`)
  process.exit(1)
}

/* ---------- import (English) ---------- */
const payload = await getPayload({ config })

for (const slug of ['tools', 'body-areas', 'certificates', 'experiences', 'reels', 'clinics', 'media'] as const) {
  await payload.delete({ collection: slug, where: { id: { exists: true } } })
}

const uploaded = new Map<string, number>()
const upload = async (ref: ImageRef | undefined | string, fallbackAlt = '') => {
  const file = typeof ref === 'string' ? ref : ref?.file
  if (!file) return null
  const alt = (typeof ref === 'string' ? fallbackAlt : ref?.alt) || fallbackAlt || file
  const key = `${file}|${alt}`
  if (!uploaded.has(key)) {
    const doc = await payload.create({ collection: 'media', data: { alt }, filePath: path.join(IMAGES, file) })
    uploaded.set(key, doc.id)
  }
  return uploaded.get(key)!
}

const s = data.site
const siteImages = {
  logoOnDark: await upload(s.logoOnDark),
  logoOnLight: await upload(s.logoOnLight),
  clinicLogo: await upload(s.clinic.logo),
  contactImage: await upload(s.contact.image),
}
await payload.updateGlobal({
  slug: 'site',
  data: {
    name: s.name,
    fullName: s.fullName,
    title: s.title,
    heroLines: s.heroLines.join('\n'),
    logoOnDark: siteImages.logoOnDark,
    logoOnLight: siteImages.logoOnLight,
    aboutHeading: s.about.heading,
    storyLines: s.about.storyLines.map((text) => ({ text })),
    years: s.about.years,
    yearsLabel: s.about.yearsLabel,
    aboutText: s.about.text,
    clinicName: s.clinic.name,
    clinicNameArabic: s.clinic.nameArabic,
    clinicRole: s.clinic.role,
    clinicLogo: siteImages.clinicLogo,
    clinicInstagram: s.clinic.instagram,
    contactHeading: s.contact.heading,
    contactText: s.contact.text,
    contactImage: siteImages.contactImage,
    whatsapp: s.contact.whatsapp,
    email: s.contact.email,
    location: s.contact.location,
    instagram: s.contact.instagram,
    instagramFollowers: s.contact.instagramFollowers,
    youtube: s.contact.youtube,
    ...s.sections,
  },
})

const certIds: Record<string, number> = {}
for (const [order, { key, ...c }] of data.certificates.entries()) {
  const doc = await payload.create({ collection: 'certificates', data: { ...c, order } })
  certIds[key] = doc.id
}

const areaIds: Record<string, number> = {}
for (const [order, a] of data.bodyAreas.entries()) {
  const doc = await payload.create({
    collection: 'body-areas',
    data: { name: a.name, key: a.key, view: a.view, certificates: a.certificates.map((k) => certIds[k]), order },
  })
  areaIds[a.key] = doc.id
}

const toolIds: { id: number; image: number | null }[] = []
for (const [order, t] of data.tools.entries()) {
  const image = await upload(t.image, t.title)
  const doc = await payload.create({
    collection: 'tools',
    data: { title: t.title, shortName: t.shortName, tag: t.tag, image: image!, description: t.description, order },
  })
  toolIds.push({ id: doc.id, image })
}

const expIds: { id: number; logo: number | null }[] = []
for (const [order, e] of data.experiences.entries()) {
  const logo = await upload(e.logo, `${e.place} logo`)
  const doc = await payload.create({
    collection: 'experiences',
    data: { years: e.years, place: e.place, role: e.role, current: !!e.current, logo, order },
  })
  expIds.push({ id: doc.id, logo })
}

const reelIds: { id: number; cover: number | null }[] = []
for (const [order, r] of data.reels.entries()) {
  const cover = await upload(r.cover, r.title)
  const doc = await payload.create({
    collection: 'reels',
    data: { url: r.url, title: r.title, views: r.views, tag: r.tag, direction: r.direction || 'ltr', cover, order },
  })
  reelIds.push({ id: doc.id, cover })
}

const clinicIds: number[] = []
for (const [order, c] of data.clinics.entries()) {
  const doc = await payload.create({
    collection: 'clinics',
    data: { ...c, phones: (c.phones || []).map((number) => ({ number })), order },
  })
  clinicIds.push(doc.id)
}

/* ---------- Arabic version of the same documents ---------- */
const AR = { locale: 'ar' } as const
/** Arabic alt text for an uploaded image. */
const altAr = async (id: number | null | undefined, alt: string | undefined) => {
  if (id && alt) await payload.update({ collection: 'media', id, data: { alt }, ...AR })
}

const sa = ar.site
if (sa) {
  await payload.updateGlobal({
    slug: 'site',
    ...AR,
    data: {
      name: sa.name,
      fullName: sa.fullName,
      title: sa.title,
      heroLines: sa.heroLines?.join('\n'),
      aboutHeading: sa.about?.heading,
      storyLines: sa.about?.storyLines?.map((text) => ({ text })),
      yearsLabel: sa.about?.yearsLabel,
      aboutText: sa.about?.text,
      clinicName: sa.clinic?.name,
      clinicRole: sa.clinic?.role,
      contactHeading: sa.contact?.heading,
      contactText: sa.contact?.text,
      location: sa.contact?.location,
      instagramFollowers: sa.contact?.instagramFollowers,
      ...sa.sections,
    },
  })
  await altAr(siteImages.logoOnDark, sa.logoOnDark?.alt)
  await altAr(siteImages.logoOnLight, sa.logoOnLight?.alt)
  await altAr(siteImages.clinicLogo, sa.clinic?.logo?.alt)
  await altAr(siteImages.contactImage, sa.contact?.image?.alt)
}
for (const { key, ...c } of ar.certificates || []) {
  await payload.update({ collection: 'certificates', id: certIds[key], data: c, ...AR })
}
for (const a of ar.bodyAreas || []) {
  await payload.update({ collection: 'body-areas', id: areaIds[a.key], data: { name: a.name }, ...AR })
}
for (const [i, { imageAlt, ...t }] of (ar.tools || []).entries()) {
  await payload.update({ collection: 'tools', id: toolIds[i].id, data: t, ...AR })
  await altAr(toolIds[i].image, imageAlt)
}
for (const [i, e] of (ar.experiences || []).entries()) {
  await payload.update({ collection: 'experiences', id: expIds[i].id, data: e, ...AR })
  await altAr(expIds[i].logo, e.place && `شعار ${e.place}`)
}
for (const [i, r] of (ar.reels || []).entries()) {
  await payload.update({ collection: 'reels', id: reelIds[i].id, data: r, ...AR })
  await altAr(reelIds[i].cover, r.title)
}
for (const [i, c] of (ar.clinics || []).entries()) {
  await payload.update({ collection: 'clinics', id: clinicIds[i], data: c, ...AR })
}

payload.logger.info(
  `Import finished: ${data.tools.length} tools, ${data.certificates.length} certificates, ${data.bodyAreas.length} body areas, ` +
    `${data.experiences.length} workplaces, ${data.reels.length} reels, ${data.clinics.length} branches, ${uploaded.size} images` +
    (ar.site ? ', with the Arabic version.' : '. No content.ar.json, so the Arabic page shows the English text.'),
)
process.exit(0)
