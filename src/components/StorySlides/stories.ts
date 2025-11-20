export interface Story {
  profileImg: string
  profileName: string
  title: string[]
  linkLabel: string
  linkSrc: string
  storyImg: string
}

export const stories: Story[] = [
  {
    profileImg: '/stories/profile-1.png',
    profileName: 'Behance',
    title: ['FXApp Design & Process', 'Sending money made easy', 'A class experiment'],
    linkLabel: 'Explore Work',
    linkSrc: '/sample-project',
    storyImg: '/stories/Story-fxapp.webp',
  },
  {
    profileImg: '/stories/profile-2.png',
    profileName: 'Reswitch Pty Australia',
    title: ['Reswitch App Design,', 'Renewable Energy Benefits', 'for everyone in Australia'],
    linkLabel: 'Explore Work',
    linkSrc: '/sample-project',
    storyImg: '/stories/Story-reswitch.webp',
  },
  {
    profileImg: '/stories/profile-3.png',
    profileName: 'Pulsate',
    title: ['Pulsate Kids Story App', 'Listen, Read and Quiz', 'For kids and young adults'],
    linkLabel: 'Explore Work',
    linkSrc: '/sample-project',
    storyImg: '/stories/story-aalo.webp',
  },
  {
    profileImg: '/stories/profile-4.png',
    profileName: 'Adobe',
    title: ['Pivota Social Commerce', 'App to socialize and', 'do simple commerce.'],
    linkLabel: 'Explore Work',
    linkSrc: '/sample-project',
    storyImg: '/stories/story-pivota.webp',
  },
  {
    profileImg: '/stories/profile-2.png',
    profileName: 'Metnov',
    title: ['Metnov GenX branding', 'for the in-between', 'people of life'],
    linkLabel: 'Explore Work',
    linkSrc: '/sample-project',
    storyImg: '/stories/Story-Metnov-Branding.webp',
  },
  {
    profileImg: '/stories/profile-4.png',
    profileName: 'Pulsate',
    title: ['Pulsate Branding App', 'For kids and young adults', 'trying to listen to stories'],
    linkLabel: 'Explore Work',
    linkSrc: '/sample-project',
    storyImg: '/stories/Story-Pulsate-Branding.webp',
  },
  {
    profileImg: '/stories/profile-4.png',
    profileName: 'Metnov Inc',
    title: ['Metnov Web Design', 'for the in-between', 'people of life'],
    linkLabel: 'Explore Work',
    linkSrc: '/sample-project',
    storyImg: '/stories/Story-Pulsate-Branding.webp',
  },
]

export default stories
