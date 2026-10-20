import Image from 'next/image'
import Hero from '@/components/Hero'
import ProjectGrid from '@/components/ProjectGrid'
import About from '@/components/About'
import Reveal from '@/components/Reveal'
import MagneticLink from '@/components/MagneticLink'
import { Asterisk } from '@/components/Icons'

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <div
        className="discipline-strip"
        aria-label="Designer, developer, AI explorer, creative thinker"
      >
        <span>Design with intention.</span>
        <Asterisk />
        <span>Build with curiosity.</span>
        <Asterisk />
        <span>Make it matter.</span>
        <Asterisk />
      </div>
      <section id="work" className="work-section section-pad">
        <div className="section-kicker">
          <span className="eyebrow">
            <span className="blue-dot" /> Selected work
          </span>
          <span className="eyebrow">01 / A few things I’ve put into the world</span>
        </div>
        <div className="work-heading">
          <Reveal>
            <h2>
              Thoughtfully designed.
              <br />
              <em>Built to feel different.</em>
            </h2>
          </Reveal>
          <p>
            Digital products, distinctive identities,
            <br />
            and ideas made real.
            <br />
            <span>A selection of independent & collaborative work.</span>
          </p>
        </div>
        <ProjectGrid />
        <div className="work-bottom">
          <span className="eyebrow">A little strategy. A lot of soul.</span>
          <MagneticLink href="/portfolio">Explore all projects</MagneticLink>
        </div>
      </section>
      <About />
      <section className="visual-teaser section-pad">
        <span className="eyebrow">An eye for the unexpected</span>
        <Reveal>
          <h2>
            Always looking.
            <br />
            <em>Always making.</em>
          </h2>
        </Reveal>
        <div className="visual-teaser-images">
          {[4, 8, 11].map((number, i) => (
            <a key={number} href="/gallery" aria-label={`Explore visual diary, image ${i + 1}`}>
              <Image
                width={500}
                height={600}
                sizes="(max-width: 760px) 50vw, 33vw"
                src={`/assets/img${number}.jpeg`}
                alt="Photography from Akanni’s visual diary"
              />
            </a>
          ))}
        </div>
        <div className="visual-teaser-bottom">
          <p>
            A few frames from the world through my eyes.
            <br />
            Photography, experiments, and creative detours.
          </p>
          <MagneticLink href="/gallery">Open the visual diary</MagneticLink>
        </div>
      </section>
    </main>
  )
}
