import Footer from '@/components/footer/Footer'
import './globals.css'
import Navbar from '@/components/Navbar'
import localFont from 'next/font/local'
import ClientLayout from '@/client-layout'

const machinaFont = localFont({
  src: [
    {
      path: '../../../public/fonts/PPNeueMachina-InktrapRegular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/PPNeueMachina-InktrapMedium.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/PPNeueMachina-InktrapUltrabold.woff2',
      weight: '1000',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/PPNeueMachina-InktrapLightItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../../public/fonts/PPNeueMachina-InktrapMediumItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../../public/fonts/PPNeueMachina-InktrapUltraboldItalic.woff2',
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
      path: '../../../public/fonts/PPNeueMontreal-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/PPNeueMontreal-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../../public/fonts/PPNeueMontreal-Medium.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/PPNeueMontreal-Bold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/PPNeueMontreal-BoldItalic.woff2',
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
      path: '../../../public/fonts/PPKyoto-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/PPKyoto-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
  ],
  variable: '--font-kyoto', // CSS variable for this font
  display: 'swap',
  fallback: ['Times New Roman', 'serif'],
})

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${machinaFont.variable} ${montrealFont.variable} ${kyotoFont.variable}`}
    >
      <body>
        <ClientLayout>
          <Navbar />
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
