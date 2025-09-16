import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

async function seedDemoData() {
  const payload = await getPayload({ config })

  console.log('🌱 Starting to seed demo data...')

  try {
    // Create Categories
    console.log('📁 Creating categories...')
    const designCategory = await payload.create({
      collection: 'categories',
      data: {
        name: 'Design',
        slug: 'design',
        description: 'Thoughts on design, UX, and visual creativity',
        color: '#d9fe62',
      },
    })

    const techCategory = await payload.create({
      collection: 'categories',
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Insights on web development and emerging tech',
        color: '#b2e3ff',
      },
    })

    const lifeCategory = await payload.create({
      collection: 'categories',
      data: {
        name: 'Life & Growth',
        slug: 'life-growth',
        description: 'Personal reflections and life lessons',
        color: '#ff85b7',
      },
    })

    console.log('✅ Categories created successfully')

    // Create Tags
    console.log('🏷️ Creating tags...')
    const tags = await Promise.all([
      payload.create({
        collection: 'tags',
        data: { name: 'React', slug: 'react' },
      }),
      payload.create({
        collection: 'tags',
        data: { name: 'Next.js', slug: 'nextjs' },
      }),
      payload.create({
        collection: 'tags',
        data: { name: 'TypeScript', slug: 'typescript' },
      }),
      payload.create({
        collection: 'tags',
        data: { name: 'UI/UX', slug: 'ui-ux' },
      }),
      payload.create({
        collection: 'tags',
        data: { name: 'Productivity', slug: 'productivity' },
      }),
      payload.create({
        collection: 'tags',
        data: { name: 'Learning', slug: 'learning' },
      }),
    ])

    console.log('✅ Tags created successfully')
    // Create Journal Entries
    console.log('📝 Creating journal entries...')

    const journalEntries = [
      {
        title: 'Building Modern Web Applications with Next.js 15',
        slug: 'building-modern-web-apps-nextjs-15',
        excerpt:
          'Exploring the latest features in Next.js 15 and how they revolutionize the way we build React applications.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: "Next.js 15 brings incredible improvements to the React ecosystem. In this post, I'll share my experience building production applications with the latest features.",
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: "Key Features I'm Excited About:",
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Improved App Router with better performance',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Enhanced Server Components',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Better TypeScript integration',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        status: 'published',
        publishedAt: new Date('2024-12-01'),
        category: techCategory.id,
        tags: [tags[1].id, tags[2].id], // Next.js, TypeScript
        seo: {
          title: 'Building Modern Web Applications with Next.js 15',
          description:
            'Learn about the latest Next.js 15 features and how to build better React applications.',
        },
      },
      {
        title: 'The Art of Minimalist Design in Digital Products',
        slug: 'art-of-minimalist-design-digital-products',
        excerpt:
          'How embracing minimalism can lead to more intuitive and effective user experiences.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: "Minimalism isn't just about removing elements—it's about intentional design that serves the user's needs without distraction.",
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: 'Core Principles:',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '1. Every element should have a purpose',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '2. White space is your friend',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '3. Typography creates hierarchy',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        status: 'published',
        publishedAt: new Date('2024-11-28'),
        category: designCategory.id,
        tags: [tags[3].id], // UI/UX
        seo: {
          title: 'The Art of Minimalist Design in Digital Products',
          description:
            'Discover how minimalist design principles can improve user experience and product effectiveness.',
        },
      },
      {
        title: 'Lessons Learned from Building My First SaaS Product',
        slug: 'lessons-learned-building-first-saas-product',
        excerpt:
          'A candid reflection on the challenges, mistakes, and victories of launching a software product.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Building a SaaS product from scratch taught me more about business, technology, and myself than any course or book ever could.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: 'Key Takeaways:',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Start with the problem, not the solution',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: "• MVP doesn't mean minimum viable product—it means maximum viable learning",
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Customer feedback is gold, but knowing which feedback to ignore is platinum',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        status: 'published',
        publishedAt: new Date('2024-11-25'),
        category: lifeCategory.id,
        tags: [tags[4].id, tags[5].id], // Productivity, Learning
        seo: {
          title: 'Lessons Learned from Building My First SaaS Product',
          description:
            'Real insights and lessons from the journey of building and launching a SaaS product.',
        },
      },
      {
        title: 'React Server Components: The Future of Web Development',
        slug: 'react-server-components-future-web-development',
        excerpt:
          'Understanding how React Server Components are changing the way we think about client-server architecture.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'React Server Components represent a paradigm shift in how we build web applications, blurring the lines between client and server rendering.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: "Benefits I've Experienced:",
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Reduced bundle sizes',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Better performance on slower devices',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Simplified data fetching patterns',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        status: 'published',
        publishedAt: new Date('2024-11-20'),
        category: techCategory.id,
        tags: [tags[0].id, tags[2].id], // React, TypeScript
        seo: {
          title: 'React Server Components: The Future of Web Development',
          description:
            'Explore how React Server Components are revolutionizing web development architecture.',
        },
      },
      {
        title: 'Finding Balance: Work, Life, and Creative Pursuits',
        slug: 'finding-balance-work-life-creative-pursuits',
        excerpt:
          'Reflections on maintaining creativity and personal growth while building a career in tech.',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'The tech industry moves fast, but personal growth requires patience. Finding the balance between professional ambition and personal fulfillment is an ongoing journey.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    text: "What I've Learned:",
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Burnout is real, and prevention is better than cure',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Side projects fuel creativity and learning',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '• Community and mentorship accelerate growth',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        status: 'draft',
        category: lifeCategory.id,
        tags: [tags[4].id, tags[5].id], // Productivity, Learning
        seo: {
          title: 'Finding Balance: Work, Life, and Creative Pursuits',
          description:
            'Personal reflections on balancing career growth with creative fulfillment in tech.',
        },
      },
    ]

    // Create all journal entries
    for (const entryData of journalEntries) {
      await payload.create({
        collection: 'journals',
        data: entryData,
      })
    }

    console.log('✅ Journal entries created successfully')
    console.log('🎉 Demo data seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
  }
}

// Run the seeding function
seedDemoData()
  .then(() => {
    console.log('✨ Seeding process finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })

export { seedDemoData }
