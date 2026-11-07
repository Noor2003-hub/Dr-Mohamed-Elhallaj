/**
 * Imports all website content from src/import/content.json into the CMS.
 *
 *   npm run import
 *
 * - Image fields hold a file name from src/import/images (or "" for none).
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

/* ---------- read + check ---------- */
const data = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Content
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
if (problems.length) {
  console.error(`\nImport stopped, nothing was changed:\n - ${problems.join('\n - ')}\n`)
  process.exit(1)
}

/* ---------- import ---------- */
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
await payload.updateGlobal({
  slug: 'site',
  data: {
    name: s.name,
    fullName: s.fullName,
    title: s.title,
    heroLines: s.heroLines.join('\n'),
    logoOnDark: await upload(s.logoOnDark),
    logoOnLight: await upload(s.logoOnLight),
    aboutHeading: s.about.heading,
    storyLines: s.about.storyLines.map((text) => ({ text })),
    years: s.about.years,
    yearsLabel: s.about.yearsLabel,
    aboutText: s.about.text,
    clinicName: s.clinic.name,
    clinicNameArabic: s.clinic.nameArabic,
    clinicRole: s.clinic.role,
    clinicLogo: await upload(s.clinic.logo),
    clinicInstagram: s.clinic.instagram,
    contactHeading: s.contact.heading,
    contactText: s.contact.text,
    contactImage: await upload(s.contact.image),
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

for (const [order, a] of data.bodyAreas.entries()) {
  await payload.create({
    collection: 'body-areas',
    data: { name: a.name, key: a.key, view: a.view, certificates: a.certificates.map((k) => certIds[k]), order },
  })
}

for (const [order, t] of data.tools.entries()) {
  const image = await upload(t.image, t.title)
  await payload.create({
    collection: 'tools',
    data: { title: t.title, shortName: t.shortName, tag: t.tag, image: image!, description: t.description, order },
  })
}

for (const [order, e] of data.experiences.entries()) {
  await payload.create({
    collection: 'experiences',
    data: { years: e.years, place: e.place, role: e.role, current: !!e.current, logo: await upload(e.logo, `${e.place} logo`), order },
  })
}

for (const [order, r] of data.reels.entries()) {
  await payload.create({
    collection: 'reels',
    data: { url: r.url, title: r.title, views: r.views, tag: r.tag, direction: r.direction || 'ltr', cover: await upload(r.cover, r.title), order },
  })
}

for (const [order, c] of data.clinics.entries()) {
  await payload.create({
    collection: 'clinics',
    data: { ...c, phones: (c.phones || []).map((number) => ({ number })), order },
  })
}

payload.logger.info(
  `Import finished: ${data.tools.length} tools, ${data.certificates.length} certificates, ${data.bodyAreas.length} body areas, ` +
    `${data.experiences.length} workplaces, ${data.reels.length} reels, ${data.clinics.length} branches, ${uploaded.size} images.`,
)
process.exit(0)
