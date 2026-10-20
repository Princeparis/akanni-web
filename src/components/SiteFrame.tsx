'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

export default function SiteFrame({ children }: { children: ReactNode }) {
  const standalone = usePathname().startsWith('/playground/')
  return standalone ? (
    children
  ) : (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
