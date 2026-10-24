import type { Metadata } from 'next'
import IbadanExperience from '@/components/ibadan/IbadanExperience'

export const metadata: Metadata = {
  title: 'Ibadan — A living memory',
  description:
    'An immersive particle journey through the land, objects and memories of Ibadan. An independent experience by Rayab.',
  robots: { index: false, follow: true },
}

export default function IbadanPage() {
  return <IbadanExperience />
}
