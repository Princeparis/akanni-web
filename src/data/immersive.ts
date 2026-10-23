export const immersive = [
  {
    slug: 'matter',
    number: '07',
    title: 'Matter',
    medium: '3D sculpture studio',
    description:
      'A little impossible. Entirely in your hands. Shape, light, and capture a digital object.',
  },
  {
    slug: 'pulse',
    number: '08',
    title: 'Pulse',
    medium: 'Audiovisual rhythm machine',
    description:
      'Make a beat. Watch it become a living particle sculpture. Take the loop with you.',
  },
] as const
export type ImmersiveSlug = (typeof immersive)[number]['slug']
