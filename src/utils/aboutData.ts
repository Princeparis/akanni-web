export interface AboutDataItem {
  title?: string
  content: string
  img?: string
  url?: string
}

export interface ExperienceDataItem {
  jobTitle: string
  contractType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Partnership'
  company: string
  dateStart: Date | number
  dateEnd?: Date
  description: string
  accomplishments: string
}

export const AboutDataItems: AboutDataItem[] = [
  {
    title: 'Who I am',
    content:
      'I am a passionate product designer and developer with over 8 years of experience in creating user-centric digital experiences. My expertise lies in UI/UX design, web development, and brand strategy. I thrive on transforming complex ideas into intuitive and engaging designs that resonate with users.',
    img: '',
    url: '',
  },
  {
    title: 'Leisure',
    content:
      "When I'm not designing or coding, you can find me exploring new technologies, reading (gaming,design, and movies) blogs or magazine issues, or indulging in my love for Football(Soccer) by watching or playing Efootball or FC25. I believe in continuous learning and staying updated with the latest trends in design and development to deliver cutting-edge solutions. I also enjoy chatting with friends and acquaintances about design, technology, life, love, philosophy and the ever-evolving digital landscape.",
    img: '',
    url: '',
  },
]

export const ExperienceData: ExperienceDataItem[] = [
  {
    jobTitle:
      'CTO: Co-founder, Product Designer, Brand Strategist and Designer and Fullstack Developer',
    contractType: 'Full-time',
    company: 'Metnov, USA',
    dateStart: new Date('2025-03-15'),
    dateEnd: undefined,
    description:
      'I am working here as a co-founder and CTO, handling the complete product design, branding, and development for the company. My responsibilities include overseeing the technical direction of the company, designing and developing the product, and ensuring a high standard of quality and creativity in all deliverables.',
    accomplishments:
      'Successfully launched the MVP of our product(Pivota: A social commerce app), resulting in increased user engagement and satisfaction. Worked closely with the CEO to understand the needs of the users and deliver designs and products that met their expectations.',
  },
  {
    jobTitle: 'Web Designer and Developer',
    contractType: 'Freelance',
    company: 'Zoe Foundation, UK',
    dateStart: new Date('2025-07-10'),
    dateEnd: new Date('2025-07-23'),
    description:
      'I worked as a freelance web designer and developer, focusing on creating visually appealing and user-friendly websites for the foundation. My responsibilities included designing layouts, selecting color schemes, ensuring a seamless user experience across devices, and developing the design into a functional website using WordPress.',
    accomplishments:
      'Successfully designed and launched a fully functional website for the foundation, resulting in increased online presence and improved engagement with their audience. The website received positive feedback from users for its intuitive navigation and appealing design.',
  },
  {
    jobTitle: 'Product Designer',
    contractType: 'Full-time',
    company: 'Reswitch Pty, Australia',
    dateStart: new Date('2023-01-01'),
    dateEnd: new Date('2021-01-01'),
    description:
      'I worked here as an end to end product designer handling both UI and UX. working for more than a year, crafting the product from idea to prototyping and testing. We worked on the design of both web B2B management dashboard and mobile app for B2C users.',
    accomplishments:
      'Created the product from scratch, working closely with the founder and developers to deliver a seamless experience for both web and mobile users. Conducted user research and usability testing to ensure the product met user needs and expectations.',
  },
  {
    jobTitle: 'UI/UX Designer',
    contractType: 'Full-time',
    company: 'Maxibuy, Nigeria',
    dateStart: new Date('2021-02-01'),
    dateEnd: new Date('2022-06-01'),
    description:
      'I worked here as a UI/UX designer, handling user research and the design of both web B2C e-commerce app and a B2B seller dashboard. I was responsible for creating wireframes, prototypes, and high-fidelity designs for various projects and sub-projects.',
    accomplishments:
      'Successfully designed and delivered multiple projects, including a B2B seller dashboard application and a web B2C e-commerce application for the company. Worked closely with users, and developers to ensure designs were implemented accurately and efficiently.',
  },
  {
    jobTitle: 'Product Designer',
    contractType: 'Contract',
    company: 'GoodTalent, UK',
    dateStart: new Date('2019-06-01'),
    dateEnd: new Date('2019-12-01'),
    description:
      'I worked as a freelance product designer, handling various projects for the company. My responsibilities included user research, wireframing, prototyping, and creating high-fidelity designs for both B2C Job board platform and a B2B Recruiter ATS platform.',
    accomplishments:
      'Successfully delivered multiple projects, including a B2C Job board platform and a B2B Recruiter ATS platform. Worked closely with users and developers to ensure designs were implemented accurately and efficiently, resulting in improved user experience and increased user engagement.',
  },
  {
    jobTitle: 'Web Designer',
    contractType: 'Freelance',
    company: 'Okewa Haircare, USA',
    dateStart: new Date('2022-07-01'),
    dateEnd: new Date(),
    description:
      'I worked as a web designer, focusing on creating visually appealing and user-friendly e-commerce websites for the client. My responsibilities included designing layouts, selecting color schemes,ensuring a seamless user experience across devices, and developing the design into a functional website with Woocommerce.',
    accomplishments:
      'Successfully designed and launched a fully functional e-commerce website for the client, resulting in increased online sales and improved customer engagement. The website received positive feedback from users for its intuitive navigation and appealing design.',
  },
  {
    jobTitle: 'Brand Identity Designer and E-commerce Developer',
    contractType: 'Freelance',
    company: 'Medmart, Nigeria',
    dateStart: new Date('2021-05-01'),
    dateEnd: new Date('2021-12-01'),
    description:
      'I worked as a brand identity designer and e-commerce developer, handling the complete branding and online store setup for the client. My responsibilities included creating a cohesive brand identity, designing marketing materials, and developing an e-commerce website using Woocommerce.',
    accomplishments:
      "Successfully created a strong brand identity for the client, resulting in increased brand recognition and customer engagement. Developed a fully functional e-commerce website that improved the client's online presence and sales.",
  },
  {
    jobTitle: 'Creative Director, Web Designer and Developer, Brand Strategist and Designer',
    contractType: 'Partnership',
    company: 'Speak Boutique, Nigeria',
    dateStart: new Date('2016-01-01'),
    dateEnd: undefined,
    description:
      'I worked as a creative director, web designer, and developer, handling various projects for the company. My responsibilities included overseeing the creative direction of projects, designing and developing websites, and ensuring a high standard of quality and creativity in all deliverables.',
    accomplishments:
      'Successfully delivered multiple projects, resulting in increased user engagement and satisfaction. Worked closely with the CEO to understand the needs of the company and deliver designs and products that met their expectations.',
  },

  {
    jobTitle: 'Graphics Designer: Brand Identity Designer',
    contractType: 'Full-time',
    company: 'Touchcore, Nigeria',
    dateStart: new Date('2019-08-01'),
    dateEnd: new Date('2020-02-28'),
    description:
      'I worked here as a graphics designer, handling various design projects for the company. My responsibilities included creating visual concepts, designing marketing materials, and developing brand identities for clients.',
    accomplishments:
      'Successfully delivered multiple design projects, resulting in increased brand recognition and customer engagement for clients. Worked closely with clients to understand their needs and deliver designs that met their expectations.',
  },
  {
    jobTitle: 'E-commerce Developer and UI/UX Designer',
    contractType: 'Freelance',
    company: 'Oga Farmer, Nigeria',
    dateStart: new Date('2015-09-10'),
    dateEnd: new Date('2015-10-20'),
    description:
      'I worked as an e-commerce developer and UI/UX designer, focusing on creating user-friendly and visually appealing online shopping experiences for the client. My responsibilities included designing intuitive user interfaces, optimizing the user journey, and developing the front-end of the e-commerce website using WooCommerce.',
    accomplishments:
      "Successfully launched a fully functional e-commerce website for farm produce (the 1st of it's kind in Nigeria then) that improved the client's online presence and sales. Received positive feedback from users for the website's design and usability.",
  },
]
