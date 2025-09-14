import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

import styles from "./AnimatedLink.module.css";

export default function AnimatedLink({
  href,
  text,
  containerStyle,
  strokeColor = "#000000",
  lastColor,
  textColor,
  animateOnScroll = false,
  delay = 0,
}) {
  const animeLinkRef = useRef(null);
  const { contextSafe } = useGSAP({
    scope: animeLinkRef,
    revertOnUpdate: true,
  });

  const handleMouseOver = contextSafe(() => {
    const tl = gsap.timeline();
    tl.to(".strip", {
      y: "-32px",
      duration: 0.5,
      ease: "power4.in",
    }).to(".icon-con", {
      y: 0,
      duration: 0.5,
      ease: "power4.in",
    });
  });

  const handleMouseLeave = contextSafe(() => {
    const outTl = gsap.timeline();
    outTl
      .to(".strip", {
        y: "0%",
        duration: 0.5,
        ease: "power4.out",
      })
      .to(".icon-con", {
        y: "20px",
        duration: 0.5,
        ease: "power4.out",
      });
  });

  return (
    <a
      href={href}
      className={`${styles.animatedLink} a-link`}
      style={{ containerStyle }}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      ref={animeLinkRef}
    >
      <div className={styles.textsCon}>
        <div className={`${styles.textStrip} strip`}>
          <p
            className={`${styles.paragraph} link-text`}
            style={{ color: `${textColor}` }}
          >
            {text}
          </p>
          <p
            className={`${styles.paragraph} link-text`}
            style={{ color: `${textColor}` }}
          >
            {text}
          </p>
          <p
            className={`${styles.paragraph} link-text`}
            style={{ color: `${textColor}` }}
          >
            {text}
          </p>
          <p
            className={`${styles.paragraph} link-text`}
            style={{ color: `${lastColor}` }}
          >
            {text}
          </p>
          <p
            className={`${styles.paragraph} link-text`}
            style={{ color: `${lastColor}` }}
          >
            {text}
          </p>
        </div>
      </div>
      <div className={`${styles.iconCon} icon-con`}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1H13M13 1C13 1 13 14.5983 13 12.8437M13 1L1 12.8437"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeWidth={2}
          />
        </svg>
      </div>
    </a>
  );
}
