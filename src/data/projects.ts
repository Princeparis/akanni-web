export type Discipline = 'Product' | 'Brand' | 'Web'

export interface Project {
  slug: string
  name: string
  client: string
  discipline: Discipline
  category: string
  image: string
  color: string
  headline: string
  description: string
  approach: string
  services: string[]
}

// Local, editable content. No database, remote content API, or credentials.
export const projects: Project[] = [
  {
    slug: 'reswitch',
    name: 'Reswitch',
    client: 'Reswitch Pty · Australia',
    discipline: 'Product',
    category: 'Product strategy / UX & UI',
    image: '/stories/Story-reswitch.webp',
    color: '#a9dbe9',
    headline: 'Renewable energy. Real possibilities.',
    description:
      'Renewable energy benefits for everyone in Australia. End-to-end product design, bringing a B2B management dashboard and a B2C mobile experience into one connected ecosystem.',
    approach:
      'Crafting the product from idea to prototyping and testing. Working closely with the founder and developers to make complex energy decisions feel simple, clear, and human.',
    services: ['Product strategy', 'User experience', 'Interface design', 'Prototyping'],
  },
  {
    slug: 'pivota',
    name: 'Pivota',
    client: 'Metnov · USA',
    discipline: 'Product',
    category: 'Social commerce / Design & development',
    image: '/stories/Story-pivota.webp',
    color: '#d8d6d1',
    headline: 'A place to connect. A simpler way to trade.',
    description:
      'A social commerce app for people to socialize and do simple commerce. Product design, brand strategy, and fullstack development brought together under one creative direction.',
    approach:
      'Working as co-founder and CTO, handling the complete product design, branding, and development. From the first idea to the MVP, keeping the needs of the people using the product at the center.',
    services: ['Creative direction', 'Brand strategy', 'Product design', 'Fullstack development'],
  },
  {
    slug: 'metnov-brand',
    name: 'Metnov',
    client: 'Metnov Inc',
    discipline: 'Brand',
    category: 'Strategy / Brand identity',
    image: '/stories/Story-Metnov-Branding.webp',
    color: '#c9c3ed',
    headline: 'For the in-between people of life.',
    description:
      'Metnov GenX branding. A visual identity built around the people, ideas, and possibilities that live in between the familiar.',
    approach:
      'Building a cohesive identity through strategy, typography, and a distinct visual language. Connecting the brand to the digital products that carry it.',
    services: ['Brand strategy', 'Visual identity', 'Art direction', 'Digital design'],
  },
  {
    slug: 'fxapp',
    name: 'FXApp',
    client: 'Independent concept',
    discipline: 'Product',
    category: 'Fintech / UX & UI',
    image: '/stories/Story-fxapp.webp',
    color: '#e8e2d8',
    headline: 'Sending money, made easy.',
    description:
      'FXApp design and process. A class experiment exploring a clearer, more intuitive way to move money.',
    approach:
      'An exploration of everyday financial interactions, pairing considered user flows with a focused interface. Making the path from intention to action feel effortless.',
    services: ['User experience', 'Interface design', 'Interaction design', 'Prototyping'],
  },
  {
    slug: 'pulsate',
    name: 'Pulsate',
    client: 'Pulsate',
    discipline: 'Product',
    category: 'Edtech / Product design',
    image: '/stories/Story-aalo.webp',
    color: '#d8d1ee',
    headline: 'Listen. Read. Let imagination lead.',
    description:
      'A kids story app to listen, read, and quiz. A digital experience for kids and young adults, designed around the joy of a good story.',
    approach:
      'Connecting listening, reading, and discovery in one approachable experience. An interface that gives the stories room to breathe and makes exploration feel natural.',
    services: ['User experience', 'Interface design', 'Interaction design'],
  },
  {
    slug: 'metnov-web',
    name: 'Metnov Digital',
    client: 'Metnov Inc',
    discipline: 'Web',
    category: 'Web design / Development',
    image: '/stories/Story-Metnov-website.webp',
    color: '#edc5df',
    headline: 'Infinite innovation. A digital expression.',
    description:
      'Metnov web design, for the in-between people of life. An expressive digital home that connects the brand to its wider creative world.',
    approach:
      'Translating brand character into a website through expressive typography, imagery, and a consistent visual system.',
    services: ['Art direction', 'Web design', 'Development'],
  },
  {
    slug: 'pulsate-brand',
    name: 'Pulsate Identity',
    client: 'Pulsate',
    discipline: 'Brand',
    category: 'Brand strategy / Visual identity',
    image: '/stories/Story-Pulsate-Branding.webp',
    color: '#d0c3ed',
    headline: 'A world of stories. A voice of its own.',
    description:
      'Pulsate branding for kids and young adults. An identity for a world of listening, reading, and imagination.',
    approach:
      'A simple, recognizable identity designed to carry across the app and its wider touchpoints. Bringing the warmth of storytelling into a digital brand.',
    services: ['Brand strategy', 'Visual identity', 'Art direction'],
  },
]

export const getProject = (slug: string) => projects.find((project) => project.slug === slug)
