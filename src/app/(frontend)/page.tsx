import { getSiteData } from '@/lib/data'
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

export default async function HomePage() {
  const data = await getSiteData()
  const { site } = data
  return (
    <SmoothScroll>
      <Header logo={site.logoOnDark} whatsapp={site.whatsapp} />
      <main>
        <Story site={site} />
        <BodyMap heading={site.mapHeading} intro={site.mapIntro} areas={data.areas} />
        {data.tools.length > 0 && <Tools heading={site.toolsHeading} tools={data.tools} />}
        <Reels heading={site.reelsHeading} intro={site.reelsIntro} reels={data.reels} instagram={site.instagram} followers={site.instagramFollowers} />
        <Track heading={site.trackHeading} intro={site.trackIntro} stations={data.experiences} />
        <Education heading={site.educationHeading} degreesNote={site.degreesNote} certificates={data.certificates} />
        {data.clinics.length > 0 && <Clinics site={site} clinics={data.clinics} />}
        <Contact site={site} />
      </main>
      <Footer site={site} />
    </SmoothScroll>
  )
}
