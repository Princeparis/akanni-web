import type { Metadata } from 'next'
import IbadanExperience from '@/components/ibadan/IbadanExperience'

export const metadata: Metadata = {
  title: 'Ibadan: A City Made and Remade',
  description:
    'A spatial history of Ibadan through people, places and consequences. Six acts, eighteen episodes, and interpretive particle environments by Rayab.',
  robots: { index: false, follow: true },
}

export default function IbadanPage() {
  return <IbadanExperience />
}
