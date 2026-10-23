export const studios = [
  {
    slug: 'caustic',
    number: '09',
    title: 'Caustic',
    medium: 'Liquid-light laboratory',
    description: 'Disturb the surface. Bend the light. Make something unrepeatable.',
  },
  {
    slug: 'loom',
    number: '10',
    title: 'Loom',
    medium: 'Typographic fabric simulator',
    description: 'Words with weight. A little wind. A material you can actually pull.',
  },
] as const
export type StudioSlug = (typeof studios)[number]['slug']
