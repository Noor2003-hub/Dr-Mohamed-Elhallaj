import type { SiteData } from '@/lib/data'
import { waLink } from '@/lib/links'
import type { Dict } from '@/lib/i18n'

export default function Contact({ site, t }: { site: SiteData['site']; t: Dict }) {
  return (
    <section id="contact" className="contact sec sec--dark">
      <div className="wrap contact__grid">
        {site.contactImage && (
          <div className="contact__img" data-reveal>
            <img src={site.contactImage.url} alt={site.contactImage.alt} loading="lazy" />
          </div>
        )}
        <div className="contact__body">
          <h2 className="h-display" data-reveal>{site.contactHeading}</h2>
          <p className="contact__text" data-reveal>{site.contactText}</p>
          <div className="contact__ctas" data-reveal>
            <a className="btn btn--cyan" href={waLink(site.whatsapp)} target="_blank" rel="noreferrer">
              {t.contact.whatsapp}
            </a>
            {site.email && (
              <a className="btn btn--ghost" href={`mailto:${site.email}`}>
                {t.contact.email}
              </a>
            )}
          </div>
          <p className="contact__facts" data-reveal>
            {site.whatsapp && <span>{site.whatsapp}</span>}
            {site.email && <span>{site.email}</span>}
            {site.location && <span>{site.location}</span>}
          </p>
        </div>
      </div>
    </section>
  )
}
