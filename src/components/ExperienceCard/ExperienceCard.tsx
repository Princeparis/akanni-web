import React from 'react'
import { ExperienceDataItem } from '@/utils/aboutData'

// @ts-ignore: allow side-effect CSS import without type declarations
import './ExperienceCard.css'
import Copy from '../Copy'

function ExperienceCard({ item, className }: { item: ExperienceDataItem; className?: string }) {
  const duration =
    item.dateEnd !== undefined
      ? `${new Date(item.dateStart).getFullYear()} - ${new Date(item.dateEnd).getFullYear()}`
      : `${new Date(item.dateStart).getFullYear()} - Present`
  return (
    <div className={className ? `experience-card ${className}` : 'experience-card'}>
      <div className="exp-upper">
        <h3 className="exp-title">{item.jobTitle}</h3>
        <div className="company-time">
          <h5>{item.company}</h5>
          <h5>{duration}</h5>
          <div className="exp-type">
            <p>{item.contractType}</p>
          </div>
        </div>
      </div>
      <div className="exp-lower">
        <p className="exp-desc">{item.description}</p>
        <p className="exp-desc">{item.accomplishments}</p>
      </div>
    </div>
  )
}

export default ExperienceCard
