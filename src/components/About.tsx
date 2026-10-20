'use client'

import Image from 'next/image'
import { AboutDataItems, ExperienceData } from '@/data/about'
import { Arrow, Asterisk } from './Icons'
import Reveal from './Reveal'
import AnimatedCopy from './AnimatedCopy'

const capabilities = [
  {
    title: 'Brand & strategy',
    tags: 'Identity / Art direction / Visual systems',
    copy: 'For 10+ years I’ve designed identities, UX/UI, and visuals that actually move people. Building brands that feel inevitable, with a clear strategy and a distinct point of view.',
  },
  {
    title: 'Digital experiences',
    tags: 'Product design / UX & UI / Web',
    copy: 'I thrive on transforming complex ideas into intuitive and engaging designs that resonate with users. From the first wireframe to the final interaction, every detail has a job to do.',
  },
  {
    title: 'Creative development',
    tags: 'TypeScript / JavaScript / Python',
    copy: 'In the last six years I’ve gone deep on code — web, mobile, and backend — shipping with Python, TypeScript, and pure JavaScript. Strategy, craft, and software in one pair of hands.',
  },
  {
    title: 'AI & experimentation',
    tags: 'AI design / Writing / Photography',
    copy: 'An uncommon edge: AI fluency for writing, design, and photography that multiplies creative output. Exploring new technologies and finding fresh ways to bring ideas to life.',
  },
]

export default function About() {
  return (
    <>
      <section id="about" className="about-section section-pad">
        <div className="section-kicker">
          <span className="eyebrow">
            <span className="blue-dot" /> A little about me
          </span>
          <span className="eyebrow">02 / The person behind the pixels</span>
        </div>
        <div className="about-layout">
          <Reveal className="about-photo">
            <Image
              src="/images/akanni-web.jpg"
              alt="Portrait of Yusuff Ridwan Akanni"
              width={700}
              height={800}
              sizes="(max-width: 700px) 100vw, 35vw"
            />
            <div className="photo-caption">
              <span>Yusuff Ridwan</span>
              <Asterisk />
            </div>
          </Reveal>
          <div className="about-copy">
            <Reveal>
              <h2>
                Strategy. Craft.
                <br />
                <span className="outline-text">& software.</span>
              </h2>
              <AnimatedCopy
                className="about-lead"
                text="I’m a creative engineer: strategy, craft, and software in one pair of hands."
              />
              <p>
                I build brands that feel inevitable and the products that carry them. For 10+ years
                I’ve designed identities, UX/UI, and visuals that actually move people. Along the
                way I added an uncommon edge: AI fluency for writing, design, and photography that
                multiplies creative output.
              </p>
            </Reveal>
            <div className="about-stats">
              <div>
                <span>10+</span>
                <p>Years in design</p>
              </div>
              <div>
                <span>06+</span>
                <p>Years deep in code</p>
              </div>
              <div>
                <Asterisk />
                <p>Always curious</p>
              </div>
            </div>
            <a className="text-link" href="/Adeniran-R-Yusuff-Resume-Int.pdf" download>
              Download my résumé <Arrow />
            </a>
            <details className="personal-note">
              <summary>
                Beyond the screen <span>+</span>
              </summary>
              <p>{AboutDataItems[1].content}</p>
            </details>
          </div>
        </div>
      </section>
      <section className="capabilities-section section-pad" id="expertise">
        <div className="capabilities-heading">
          <span className="eyebrow">What I bring to the table</span>
          <Reveal>
            <h2>
              One mind.
              <br />
              <span className="outline-text">Many possibilities.</span>
            </h2>
          </Reveal>
          <p>From the first “what if” to the final interaction. One connected creative process.</p>
        </div>
        <div className="capabilities-list">
          {capabilities.map((capability, i) => (
            <details key={capability.title} className="capability" open={i === 0}>
              <summary>
                <span className="eyebrow">0{i + 1}</span>
                <div>
                  <h3>{capability.title}</h3>
                  <span className="capability-tags">{capability.tags}</span>
                </div>
                <span className="capability-plus">+</span>
              </summary>
              <p>{capability.copy}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="experience-section section-pad">
        <div className="experience-heading">
          <span className="eyebrow">A few chapters along the way</span>
          <h2>
            Good people.
            <br />
            <span className="outline-text">Meaningful work.</span>
          </h2>
        </div>
        <div className="experience-list">
          {ExperienceData.map((item, i) => (
            <details className="experience-row" key={`${item.company}-${i}`}>
              <summary>
                <span className="experience-company">{item.company}</span>
                <span>{item.contractType}</span>
                <span className="experience-plus">+</span>
              </summary>
              <div>
                <h3>{item.jobTitle}</h3>
                <p>{item.description}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
