import { notFound } from 'next/navigation'
import { getSiteData } from '@/lib/data'
import { getDict, isLocale } from '@/lib/i18n'
import SmoothScroll from '@/components/SmoothScroll'
import Header from '@/components/Header'
import Story from '@/components/Story'
import BodyMap from '@/components/BodyMap'
import Tools from '@/components/Tools'
import Reels from '@/components/Reels'
import Track from '@/components/Track'
import Education from '@/components/Education'
import Clinics from '@/components/Clinics'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDict(lang)
  const data = await getSiteData(lang)
  const { site } = data
  return (
    <SmoothScroll>
      <Header logo={site.logoOnDark} whatsapp={site.whatsapp} lang={lang} t={t} />
      <main>
        <Story site={site} t={t} />
        <BodyMap heading={site.mapHeading} intro={site.mapIntro} areas={data.areas} t={t} />
        {data.tools.length > 0 && <Tools heading={site.toolsHeading} tools={data.tools} t={t} />}
        <Reels
          heading={site.reelsHeading}
          intro={site.reelsIntro}
          reels={data.reels}
          instagram={site.instagram}
          followers={site.instagramFollowers}
          t={t}
        />
        <Track heading={site.trackHeading} intro={site.trackIntro} stations={data.experiences} t={t} rtl={lang === 'ar'} />
        <Education heading={site.educationHeading} degreesNote={site.degreesNote} certificates={data.certificates} t={t} />
        {data.clinics.length > 0 && <Clinics site={site} clinics={data.clinics} lang={lang} t={t} />}
        <Contact site={site} contacts={data.contacts} t={t} />
      </main>
      <Footer site={site} contacts={data.contacts} t={t} />
    </SmoothScroll>
  )
}
