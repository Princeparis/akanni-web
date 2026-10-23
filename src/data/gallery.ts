export type GalleryImage = {
  src: string
  title: string
  alt: string
  width: number
  height: number
  generated?: boolean
}
export const galleryImages: GalleryImage[] = [
  {
    src: '/assets/generated/alloy.webp',
    title: 'Alloy / Generated editorial study',
    alt: 'Generated editorial portrait of an adult Black woman with close-cropped hair and an architectural silver pleated collar against sage grey.',
    width: 1086,
    height: 1448,
    generated: true,
  },
  {
    src: '/assets/generated/ember.webp',
    title: 'Ember / Generated editorial study',
    alt: 'Generated editorial portrait of an adult woman wearing a sculptural red woven headpiece and a charcoal high-neck coat against warm ivory.',
    width: 1086,
    height: 1448,
    generated: true,
  },
  {
    src: '/assets/generated/nocturne.webp',
    title: 'Nocturne / Generated editorial study',
    alt: 'Generated editorial portrait of an adult East Asian model in chrome wraparound eyewear and a black architectural collar, lit in cobalt blue.',
    width: 1086,
    height: 1448,
    generated: true,
  },
  ...Array.from({ length: 15 }, (_, index) => ({
    src: `/assets/img${index + 1}.jpeg`,
    title: `Visual study ${String(index + 1).padStart(2, '0')}`,
    alt: `Visual study ${String(index + 1).padStart(2, '0')} from Akanni’s creative collection`,
    width: 750,
    height: 1000,
  })),
]
