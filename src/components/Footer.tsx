import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

export default function Footer({ site, t }: { site: SiteData['site']; t: Dict }) {
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
            <span className="footer__h">{t.footer.explore}</span>
            <a href="#about">{t.nav.about}</a>
            <a href="#map">{t.nav.treat}</a>
            <a href="#reels">{t.nav.reels}</a>
            <a href="#track">{t.nav.experience}</a>
            <a href="#clinics">{t.nav.clinics}</a>
          </div>
          <div>
            <span className="footer__h">{t.footer.follow}</span>
            {site.instagram && (
              <a href={site.instagram} target="_blank" rel="noreferrer">
                {t.footer.instagram}
              </a>
            )}
            {site.youtube && (
              <a href={site.youtube} target="_blank" rel="noreferrer">
                {t.footer.youtube}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="wrap footer__bottom">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <a href="#top">{t.footer.top}</a>
      </div>
    </footer>
  )
}
