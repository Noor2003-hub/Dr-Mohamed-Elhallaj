import type { SiteData } from '@/lib/data'
import type { Dict } from '@/lib/i18n'

export default function Contact({ site, contacts, t }: { site: SiteData['site']; contacts: SiteData['contacts']; t: Dict }) {
  const groups = ['kuwait', 'egypt', 'general'] as const
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
          <div className="contact__groups">
            {groups.map((group) => {
              const items = contacts.filter((item) => item.country === group && (item.url || item.kind === 'location'))
              if (!items.length) return null
              return (
                <div key={group} className={`contact__group contact__group--${group}`} data-reveal>
                  <h3>{t.contact[group]}</h3>
                  <ul className="contact__items">
                    {items.map((item) => {
                      const content = <>
                        <span className="contact__item-copy">
                          <strong>{item.title}</strong>
                          {item.detail && (item.kind === 'whatsapp' || item.kind === 'email'
                            ? <bdi dir="ltr">{item.detail}</bdi>
                            : <span>{item.detail}</span>)}
                        </span>
                        {item.url && <span className="contact__item-arrow" aria-hidden="true">↗</span>}
                      </>
                      return <li key={item.id}>{item.url
                        ? <a href={item.url} target="_blank" rel="noreferrer">{content}</a>
                        : <div className="contact__location">{content}</div>}</li>
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
