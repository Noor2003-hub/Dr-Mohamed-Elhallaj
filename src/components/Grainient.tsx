/** Animated soft colour blobs with film grain (same idea as Omar's site, in the doctor's colours). */
export default function Grainient({ variant = 'a' }: { variant?: 'a' | 'b' }) {
  return (
    <div className={`grain-bg grain-bg--${variant}`} aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <span className="blob b4" />
      <svg className="grain" xmlns="http://www.w3.org/2000/svg">
        <filter id={`grain-${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${variant})`} />
      </svg>
    </div>
  )
}
