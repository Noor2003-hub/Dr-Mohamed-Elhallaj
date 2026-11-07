'use client'
import GrainientShader from './GrainientShader'

/**
 * Moving shader background for the light sections (Reels, Education).
 * Same settings as the clients block in new-portfolio, in the doctor's colours.
 * The canvas fills the whole section.
 */
const GRADIENT = {
  color1: '#24687C',
  color2: '#EEF2F0',
  color3: '#8FCFE0',
  timeSpeed: 1.65,
  colorBalance: -0.57,
  warpStrength: 3.6,
  warpFrequency: 3.1,
  warpSpeed: 2.4,
  warpAmplitude: 50,
  blendAngle: 73,
  blendSoftness: 0.03,
  rotationAmount: 500,
  noiseScale: 1.75,
  grainAmount: 0.11,
  grainScale: 2,
  grainAnimated: false,
  contrast: 0.9,
  gamma: 1.35,
  saturation: 1,
  centerX: -0.11,
  centerY: -0.29,
  zoom: 0.65,
}

export default function SectionGradient() {
  return (
    <div className="sec-gradient" aria-hidden="true">
      <GrainientShader className="sec-gradient__canvas" {...GRADIENT} />
    </div>
  )
}
