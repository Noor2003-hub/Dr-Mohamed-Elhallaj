import type { SiteData } from '@/lib/data'

export default function Footer({ site }: { site: SiteData['site'] }) {
  return (
    <footer className="footer">
      <div className="wrap footer__top">
        <div className="footer__brand">
          {site.logoOnDark && <img src={site.logoOnDark.url} alt={site.logoOnDark.alt} />}
          <span>
            <strong>{site.fullName}</strong>
            <span>{site.title}</span>
          </span>
        </div>
        <div className="footer__cols">
          <div>
            <span className="footer__h">Explore</span>
            <a href="#about">About</a>
            <a href="#map">What I treat</a>
            <a href="#reels">Reels</a>
            <a href="#track">Experience</a>
            <a href="#clinics">Clinics</a>
          </div>
          <div>
            <span className="footer__h">Follow</span>
            {site.instagram && (
              <a href={site.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            )}
            {site.youtube && (
              <a href={site.youtube} target="_blank" rel="noreferrer">
                YouTube
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="wrap footer__bottom">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}
