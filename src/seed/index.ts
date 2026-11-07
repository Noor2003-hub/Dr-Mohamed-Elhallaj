/**
 * Fills the CMS with the doctor's content from the approved design.
 * Run once on an empty database:  npm run seed
 * Running it again wipes the content collections (not users) and re-creates them.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '@payload-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const asset = (file: string) => path.resolve(dirname, 'assets', file)

const payload = await getPayload({ config })

const wipe = ['tools', 'body-areas', 'certificates', 'experiences', 'reels', 'clinics', 'media'] as const
for (const slug of wipe) {
  await payload.delete({ collection: slug, where: { id: { exists: true } } })
}

const upload = async (file: string, alt: string) => {
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath: asset(file) })
  return doc.id
}

/* ---------- Media ---------- */
const logoDark = await upload('logo-dr-elhallaj-dark-bg.png', 'Dr. Elhallaj Clinic')
const logoLight = await upload('logo-dr-elhallaj-light-bg.png', 'Dr. Elhallaj Clinic')
const clinicLogo = await upload('logo-experts-physio-house.png', 'Experts Physio House logo')
const contactImage = await upload('contact-stretch.jpg', 'The recovered patient in a full overhead stretch')

/* ---------- Site settings ---------- */
await payload.updateGlobal({
  slug: 'site',
  data: {
    name: 'Dr. Mohamed Elhallaj',
    fullName: 'Dr. Mohamed Abdellatif Elhallaj',
    title: 'Doctor of Physical Therapy',
    heroLines: 'Doctor of physical therapy\nOrthopedic diseases and sports injuries specialist',
    logoOnDark: logoDark,
    logoOnLight: logoLight,
    aboutHeading: 'Who is Dr. Elhallaj?',
    storyLines: [
      { text: 'My fascination with the human body made me want to become a physiotherapist,' },
      { text: 'along with a wish to help children with cerebral palsy and high-level disabilities.' },
      { text: 'I have always been interested in how the body works and repairs itself,' },
      { text: 'and how exercise and hydrotherapy can improve it.' },
    ],
    years: 18,
    yearsLabel: 'Years of experience',
    aboutText:
      'Consultant Physical Therapist across all PT specialties, with dedicated specialization in post-operative orthopedic rehabilitation, sports injuries, and recovery protocols for optimal function and safe return to normal life and sports.',
    clinicName: 'Experts Physio House',
    clinicNameArabic: 'مركز الخبراء للعلاج الطبيعي',
    clinicRole: 'Co-founder',
    clinicLogo,
    clinicInstagram: 'https://www.instagram.com/experts_physio_house_clinic/',
    contactHeading: 'Ready for your first session?',
    contactText: "Tell him about the injury or your child's needs, and you will plan the first session together.",
    contactImage,
    whatsapp: '+965 5028 2082',
    email: 'Dr.mohamed.elhallaj@gmail.com',
    location: 'Salmiya, Kuwait',
    instagram: 'https://www.instagram.com/dr.mohamedelhallaj/',
    instagramFollowers: '370K followers',
    youtube: '',
    mapHeading: 'Where does it hurt?',
    mapIntro: 'Choose an area. Kinesio tape goes on, and you see the training behind its treatment.',
    toolsHeading: 'What he treats with.',
    reelsHeading: 'Learn from his reels',
    reelsIntro: '[One line on reels]',
    trackHeading: 'Step by step, back to the pitch',
    trackIntro:
      'With each workplace the patient needs less help, from a wheelchair to crutches to his first free steps, until he runs and shoots.',
    educationHeading: 'Education and training',
    degreesNote: 'Degrees, Cairo University',
  },
})

/* ---------- Certificates ---------- */
type Cert = {
  title: string
  type: 'degree' | 'diploma' | 'course'
  issuer?: string
  years?: string
  note?: string
  description?: string
  inProgress?: boolean
}
const certs: Record<string, Cert> = {
  bsc: { title: 'Bachelor of Physical Therapy', type: 'degree', issuer: 'Faculty of Physical Therapy', years: '2005 to 2010' },
  dpt: { title: 'Doctor of Physical Therapy (DPT)', type: 'degree', issuer: 'Orthopedic diseases specialist', years: '2017 to 2019' },
  omtc: {
    title: 'Orthopaedic Manual Therapy Diploma (OMTC)',
    type: 'diploma',
    issuer: 'Dr. Mahmoud Saad, Kuwait',
    note: 'Levels one and two, UK certified',
    description: 'Hands-on manual therapy for bones, joints and soft tissue.',
  },
  fifa: {
    title: 'FIFA Diploma in Football Medicine',
    type: 'diploma',
    issuer: 'FIFA Medical Network',
    inProgress: true,
    description:
      'Managing and rehabilitating football injuries, tendinopathy load management, pitch-side first aid and safe return to play.',
  },
  dn: {
    title: 'Dry needling specialist',
    type: 'course',
    issuer: 'AIMS Academy',
    years: '2024 to now',
    description: 'Dry needling of muscle trigger points to ease referred pain, improve circulation and relax the muscle.',
  },
  cerv: {
    title: 'Cervical pain management workshop',
    type: 'course',
    issuer: 'Prime Physio, Dr. Mahmoud Saad',
    description: 'Assessing and treating neck pain and its mechanical causes.',
  },
  si: {
    title: 'Sacroiliac pain management workshop',
    type: 'course',
    issuer: 'Prime Physio, Dr. Mahmoud Saad',
    description: 'Diagnosing and treating sacroiliac joint and pelvic pain.',
  },
  img: {
    title: 'Imaging course: spine, knee, brain and shoulder',
    type: 'course',
    issuer: 'Dr. Mamdouh Mahfouz',
    description: 'Reading X-ray and MRI imaging of the spine, knee, brain and shoulder.',
  },
  gaitU: {
    title: 'Gait analysis updates',
    type: 'course',
    issuer: 'Dr. Ehab Wally',
    description: 'Analysing walking and movement in children and adults.',
  },
  gaitCP: {
    title: 'Gait analysis in cerebral palsy',
    type: 'course',
    issuer: 'Free2move',
    description: 'Analysing walking and movement in children with cerebral palsy.',
  },
  ndt: {
    title: 'NDT, levels one and two',
    type: 'course',
    issuer: 'Free2move, Mrs Estelle',
    description: 'Neurodevelopmental treatment for children with neurological conditions.',
  },
  suit: {
    title: 'Suit training for paediatric rehabilitation',
    type: 'course',
    issuer: 'Free2move',
    description: 'Using a therapy suit to improve alignment, stability and neuromuscular control in children.',
  },
  ueu: {
    title: 'Universal exercise unit workshop (Spider, Ogle)',
    type: 'course',
    issuer: 'Free2move',
    description: 'Strengthening and balance training for children using the universal exercise unit.',
  },
  gmfm: {
    title: 'Gross Motor Function Measure (GMFM)',
    type: 'course',
    issuer: 'Free2move',
    description: 'Measuring gross motor function in children, especially cerebral palsy.',
  },
  aid: { title: 'Heartsaver First Aid, CPR and AED', type: 'course', issuer: 'American Heart Association' },
}
const certIds: Record<string, number> = {}
let i = 0
for (const [key, c] of Object.entries(certs)) {
  const doc = await payload.create({ collection: 'certificates', data: { ...c, order: i++ } })
  certIds[key] = doc.id
}

/* ---------- Body areas ---------- */
const areas: { name: string; key: 'neck' | 'shoulder' | 'back' | 'si' | 'knee' | 'ankle' | 'kids'; view: 'front' | 'back'; c: string[] }[] = [
  { name: 'Neck', key: 'neck', view: 'back', c: ['cerv', 'omtc', 'dn', 'img'] },
  { name: 'Shoulder', key: 'shoulder', view: 'front', c: ['omtc', 'dn', 'img'] },
  { name: 'Back and spine', key: 'back', view: 'back', c: ['omtc', 'dn', 'img', 'gaitU'] },
  { name: 'SI joint and pelvis', key: 'si', view: 'back', c: ['si', 'omtc', 'dn', 'fifa', 'gaitU'] },
  { name: 'Knee', key: 'knee', view: 'front', c: ['fifa', 'omtc', 'dn', 'img', 'gaitU'] },
  { name: 'Ankle and foot', key: 'ankle', view: 'front', c: ['fifa', 'omtc', 'gaitU'] },
  { name: 'Pediatric rehab', key: 'kids', view: 'front', c: ['ndt', 'suit', 'ueu', 'gmfm', 'gaitCP'] },
]
for (const [n, a] of areas.entries()) {
  await payload.create({
    collection: 'body-areas',
    data: { name: a.name, key: a.key, view: a.view, certificates: a.c.map((k) => certIds[k]), order: n },
  })
}

/* ---------- Tools ---------- */
const tools = [
  ['cupping', 'Cupping therapy', 'Recovery', 'Achedaway Cupping Therapy', 'Two Achedaway smart cupping devices on a patient’s upper back',
    'We use Achedaway Cupping Therapy to help relieve muscle tension, reduce discomfort, and improve local blood circulation through controlled suction. It is used as part of a recovery program to promote muscle relaxation and support overall mobility.'],
  ['needling', 'Dry needling', 'Trigger points', 'Dry Needling Therapy', 'Thin needles placed in the lower back muscles',
    'We use Dry Needling Therapy to relieve muscle pain and tension by targeting myofascial trigger points — tight, sensitive areas within the muscles that often develop due to muscular overload, repetitive strain, and intense physical training. This technique helps reduce muscle tightness, alleviate pain, and restore optimal muscle function and mobility.'],
  ['iastm', 'IASTM therapy', 'Soft tissue', 'Advanced IASTM Therapy', 'An IASTM tool used on the upper back',
    'We use Advanced IASTM Therapy with heat and vibration to relieve muscle tension, improve soft tissue mobility, reduce discomfort, and support faster recovery and optimal muscle function.'],
  ['taping', 'Kinesiology taping', 'Support', 'Kinesiology Taping', 'Kinesiology tape applied to a shoulder',
    'We use Kinesiology Taping to support muscles and joints, improve movement efficiency, and help manage pain during physical activity. The elastic therapeutic tape is applied to targeted areas to provide additional support, reduce excessive strain, and facilitate functional movement without restricting the body’s natural range of motion. It can also be used as part of a comprehensive rehabilitation program to support recovery and optimize physical performance.'],
  ['shockwave', 'Shockwave therapy', 'Tendon pain', 'Shockwave Therapy', 'A shockwave applicator on a patient’s shoulder',
    'We use Shockwave Therapy to target chronic muscle and tendon pain through focused acoustic waves, helping stimulate tissue healing, reduce discomfort, and improve mobility and functional recovery.'],
  ['mulligan', 'Mulligan technique', 'Joint mobility', 'Mulligan Technique', 'Mulligan mobilisation of the ankle with a belt',
    'We use the Mulligan Technique to improve joint mobility, reduce pain, and restore normal movement through specific manual mobilization techniques combined with active patient movement.'],
  ['estim', 'Electrical stimulation', 'Muscle activation', 'Electrical Stimulation Therapy', 'Electrode pads on the thigh connected to a stimulation unit',
    'We use Electrical Stimulation Therapy to help relieve pain, stimulate muscle activity, improve circulation, and support muscle strengthening and rehabilitation.'],
] as const
for (const [n, [file, shortName, tag, title, alt, description]] of tools.entries()) {
  const image = await upload(`tool-${file}.jpg`, alt)
  await payload.create({ collection: 'tools', data: { title, shortName, tag, image, description, order: n } })
}

/* ---------- Experiences ---------- */
const stations = [
  ['2007', 'Islamic Relief pediatric center', 'Trainee physiotherapist', 'islamic', false],
  ['2008 to 2010', 'Free2move pediatric rehabilitation center', 'Physiotherapist', 'free2move', false],
  ['2008 to 2010', 'Alyasmen center for orthopedic, neurological and sports injuries', 'Senior physiotherapist', '', false],
  ['2009 to 2011', 'Ministry of Health, Egypt', 'Physiotherapist', 'moh_eg', false],
  ['2010 to 2011', 'Nour Alhayah pediatric rehabilitation center', 'Senior pediatric physiotherapist', 'nour', false],
  ['2011 to now', 'Alnibras School for Special Needs', 'Spine and posture physiotherapist', 'nibras', true],
  ['2013 to 2014', 'Khaitan Sports Club', 'Sports physical therapist', 'khaitan', false],
  ['2014 to 2016', 'Al-Tadamon Sports Club', 'Sports physical therapist', 'tadamon', false],
  ['2017 to 2023', 'Al-Qadsiya Sports Club', 'Senior sports physiotherapist', 'qadsia', false],
] as const
for (const [n, [years, place, role, logo, current]] of stations.entries()) {
  const logoId = logo ? await upload(`station-${logo}.png`, `${place} logo`) : undefined
  await payload.create({ collection: 'experiences', data: { years, place, role, current, logo: logoId, order: n } })
}

/* ---------- Reels ---------- */
const reels = [
  ['C0hPJjsN1RB', '129M', 'Posture', 'rtl', 'بعض التمارين المهمة لتعديل وضعية انحناء الظهر', 'reel-posture.jpg'],
  ['C9clDvaNb6W', '21.3M', 'Ankle', 'ltr', 'Messi’s ankle injury', ''],
  ['DWPHtm2Dh-8', '739K', 'Ankle', 'ltr', 'What should we do in case of acute ankle sprain?', ''],
  ['DewNhUEu4vS', '659K', 'Knee', 'ltr', 'Complete tear of ACL', ''],
  ['DXpaFifDgHC', '639K', 'Taping', 'rtl', 'أتعلم ازاي تستخدم اللاصق الطبي لالتهاب وتر أكيليس والشوكة العظمية', 'reel-taping.jpg'],
  ['DdMRB3-PISr', '613K', 'Knee', 'ltr', 'Neymar’s knee fixation', ''],
] as const
for (const [n, [id, views, tag, direction, title, cover]] of reels.entries()) {
  const coverId = cover ? await upload(cover, title) : undefined
  await payload.create({
    collection: 'reels',
    data: { url: `https://www.instagram.com/reel/${id}/`, views, tag, direction, title, cover: coverId, order: n },
  })
}

/* ---------- Clinics ---------- */
await payload.create({
  collection: 'clinics',
  data: {
    name: 'Smouha',
    mapArea: 'smouha',
    color: 'orange',
    address: '11 Zaki Ragab St. (Saeed Nassar), Al-Tawheed Tower, Al-Iman Building, 1st floor, above Sobeiko Market',
    phones: [{ number: '+20 128 222 5725' }, { number: '03 427 8388' }],
    hours: 'Open 12 pm – 8 pm',
    mapsUrl: '',
    order: 0,
  },
})
await payload.create({
  collection: 'clinics',
  data: {
    name: 'Gianaclis',
    mapArea: 'gianaclis',
    color: 'cyan',
    address: '133 El Horreya Rd., Al-Zeraiyin Towers, Mohamed Saleh Tower (1), 1st floor, Apt. 12',
    phones: [{ number: '+20 104 444 2813' }],
    hours: 'Open 12 pm – 8 pm',
    mapsUrl: '',
    order: 1,
  },
})

payload.logger.info('Seed finished.')
process.exit(0)
