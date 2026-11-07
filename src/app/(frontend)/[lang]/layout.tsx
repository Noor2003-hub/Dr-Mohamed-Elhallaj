import React from 'react'
import { Archivo, Bricolage_Grotesque } from 'next/font/google'
import './styles.css'

const archivo = Archivo({ subsets: ['latin'], variable: '--font-body', axes: ['wdth'] })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-head' })

export const metadata = {
  title: 'Dr. Mohamed Elhallaj · Physical therapy and sports injuries',
  description:
    'Doctor of physical therapy, orthopedic diseases and sports injuries specialist. Co-founder of Experts Physio House.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${bricolage.variable}`}>
      <body>{children}</body>
    </html>
  )
}
