'use client'
import React from 'react'

type Props = {
  width?: number | string
  height?: number | string
  className?: string
  title?: string
}

export default function Icon({
  width = '32px',
  height = '32px',
  className,
  title = 'Akanni Admin',
}: Props) {
  return (
    <div
      className={`payload-header__logo ${className || ''}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'flex',
        width: 'auto',
        aspectRatio: '1/1',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--payload-admin-logo-color, #111)',
      }}
    >
      <svg
        id="Layer_2"
        data-name="Layer 2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 387.19 386.84"
      >
        <g id="Layer_1-2" data-name="Layer 1">
          <path
            fill="#000000"
            d="M383.13,332.59L227.35,20.42c-6.15-12.32-17.4-19.12-29.2-20.42v154.09c7.98,1.28,15.45,6.09,19.63,14.47l17.61,35.3c15.05,30.16-7.04,65.4-40.75,65.31-.27,0-.54,0-.81,0-.31,0-.62,0-.92,0-33.73.1-55.82-35.21-40.71-65.37l17.67-35.27c4.11-8.2,11.37-12.97,19.17-14.35V.07c-11.53,1.49-22.46,8.25-28.5,20.31L4.09,332.64c-13.08,26.11,7.17,54.2,33.14,54.2,4.57,0,9.33-.87,14.1-2.78l61.83-24.68c25.9-10.34,53.28-15.51,80.67-15.51s54.97,5.21,80.95,15.62l61.02,24.46c4.79,1.92,9.56,2.8,14.15,2.8,25.94,0,46.2-28.04,33.17-54.15Z"
          />
        </g>
      </svg>
    </div>
  )
}
