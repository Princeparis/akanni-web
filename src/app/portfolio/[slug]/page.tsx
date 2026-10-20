import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { projects, getProject } from '@/data/projects'
import Reveal from '@/components/Reveal'
import { Arrow } from '@/components/Icons'

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}
export const dynamicParams = false
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const project = getProject((await params).slug)
  return project
    ? {
        title: project.name,
        description: project.description,
        openGraph: {
          title: project.name,
          description: project.headline,
          ...(process.env.NEXT_PUBLIC_SITE_URL ? { images: [project.image] } : {}),
        },
      }
    : { title: 'Project not found' }
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug)
  if (!project) notFound()
  const next = projects[(projects.indexOf(project) + 1) % projects.length]
  return (
    <main id="main">
      <div className="case-intro">
        <Link href="/portfolio" className="case-back">
          ← Back to all work
        </Link>
        <div className="case-heading">
          <h1>{project.name}</h1>
          <p className="eyebrow">{project.category}</p>
        </div>
      </div>
      <Reveal className="case-image">
        <Image
          src={project.image}
          alt={`${project.name} project presentation`}
          fill
          priority
          sizes="100vw"
        />
      </Reveal>
      <section className="case-overview section-pad">
        <dl className="case-meta">
          <div>
            <dt>Client</dt>
            <dd>{project.client}</dd>
          </div>
          <div>
            <dt>Services</dt>
            <dd>
              {project.services.map((service) => (
                <span key={service}>
                  {service}
                  <br />
                </span>
              ))}
            </dd>
          </div>
        </dl>
        <div className="case-story">
          <Reveal>
            <h2>{project.headline}</h2>
            <p>{project.description}</p>
            <h3>The approach</h3>
            <p>{project.approach}</p>
          </Reveal>
        </div>
      </section>
      <Link className="case-next" href={`/portfolio/${next.slug}`}>
        <div>
          <span className="eyebrow">Keep exploring / Next project</span>
          <h2>{next.name}</h2>
          <p>{next.category}</p>
        </div>
        <Image width={360} height={260} className="case-next-thumb" src={next.image} alt="" />
        <span className="round-button">
          <Arrow />
        </span>
      </Link>
    </main>
  )
}
