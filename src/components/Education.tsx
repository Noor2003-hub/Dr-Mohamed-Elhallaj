import Grainient from './Grainient'
import type { SiteData } from '@/lib/data'

export default function Education({
  heading,
  degreesNote,
  certificates,
}: {
  heading: string
  degreesNote: string
  certificates: SiteData['certificates']
}) {
  const degrees = certificates.filter((c) => c.type === 'degree')
  const diplomas = certificates.filter((c) => c.type === 'diploma')
  const courses = certificates.filter((c) => c.type === 'course')
  return (
    <section id="education" className="edu sec">
      <Grainient variant="b" />
      <div className="wrap rel">
        <h2 className="h-section edu__h" data-reveal>{heading}</h2>

        {degrees.length > 0 && (
          <>
            <span className="eyebrow eyebrow--ink" data-reveal>{degreesNote}</span>
            <div className="edu__degrees">
              <span className="edu__line" aria-hidden="true" />
              {degrees.map((d, i) => (
                <div key={d.id} className="edu__degree" data-reveal>
                  <span className={`edu__pill ${i % 2 ? 'is-orange' : ''}`} aria-hidden="true" />
                  <span className={`edu__years ${i % 2 ? 'is-orange' : ''}`}>{d.years}</span>
                  <strong>{d.title}</strong>
                  <span className="muted">{d.issuer}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {diplomas.length > 0 && (
          <>
            <span className="eyebrow eyebrow--ink" data-reveal>Diplomas</span>
            <div className="edu__diplomas">
              {diplomas.map((d) => (
                <div key={d.id} className={`edu__diploma ${d.inProgress ? 'is-progress' : ''}`} data-reveal>
                  {d.inProgress ? <span className="badge">● In progress</span> : d.note && <span className="edu__note">{d.note}</span>}
                  <strong>{d.title}</strong>
                  <span className="muted">{d.issuer}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {courses.length > 0 && (
          <>
            <span className="eyebrow eyebrow--ink" data-reveal>Further training</span>
            <ul className="edu__courses">
              {courses.map((c) => (
                <li key={c.id} data-reveal>
                  <span>{c.title}</span>
                  <span className="muted">
                    {c.issuer}
                    {c.years ? `, ${c.years}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
