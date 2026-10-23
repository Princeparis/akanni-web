import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import localFont from 'next/font/local'
import SiteShell from '@/components/SiteShell'
import SiteFrame from '@/components/SiteFrame'
import './globals.css'

const machinaFont = localFont({
  src: [
    {
      path: '../../public/fonts/PPNeueMachina-InktrapRegular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PPNeueMachina-InktrapMedium.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PPNeueMachina-InktrapUltrabold.woff2',
      weight: '1000',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PPNeueMachina-InktrapLightItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/PPNeueMachina-InktrapMediumItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/PPNeueMachina-InktrapUltraboldItalic.woff2',
      weight: '1000',
      style: 'italic',
    },
    // Add other weights/styles for PrimaryFont if available
  ],
  variable: '--font-machina', // CSS variable for this font
  display: 'swap',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'], // Fallback for primary font
})

const montrealFont = localFont({
  src: [
    {
      path: '../../public/fonts/PPNeueMontreal-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PPNeueMontreal-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/PPNeueMontreal-Medium.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PPNeueMontreal-Bold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PPNeueMontreal-BoldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-montreal', // CSS variable for this font
  display: 'swap',
  fallback: ['Helvetica', 'sans-serif'], // Fallback for secondary font (e.g., a serif)
})

const kyotoFont = localFont({
  src: [
    {
      path: '../../public/fonts/PPKyoto-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/PPKyoto-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
  ],
  variable: '--font-kyoto', // CSS variable for this font
  display: 'swap',
  fallback: ['Times New Roman', 'serif'],
})
const BigFont = localFont({
  src: [
    {
      path: '../../public/fonts/BigShouldersDisplay.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-big', // CSS variable for this font
  display: 'swap',
  fallback: ['Times New Roman', 'sans-serif'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: 'Akanni — Creative Engineer', template: '%s — Akanni' },
  description:
    'Yusuff Ridwan Akanni. Strategy, craft, and software in one pair of hands. Independent creative engineer building brands and digital experiences.',
  openGraph: {
    title: 'Akanni — Creative Engineer',
    description: 'Creative by nature. Engineer by craft.',
    ...(siteUrl ? { images: ['/images/akanni-web.jpg'] } : {}),
  },
  icons: { icon: '/brand/rayab/favicon.svg', apple: '/brand/rayab/apple-touch-icon.png' },
}
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${machinaFont.variable} ${montrealFont.variable} ${kyotoFont.variable} ${BigFont.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteShell>
          <SiteFrame>{children}</SiteFrame>
        </SiteShell>
      </body>
    </html>
  )
}
