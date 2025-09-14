"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import slides from "./slides.js";

const Slider = () => {
  const sliderRef = useRef(null);
  const currentSlideRef = useRef(1);
  const isAnimatingRef = useRef(false);
  const scrollAllowedRef = useRef(true);
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isTouchActiveRef = useRef(false);

  const totalSlides = slides.length;

  const createSlide = (slideIndex) => {
    const slideData = slides[slideIndex - 1];

    const slide = document.createElement("div");
    slide.className = "slide";

    const slideImg = document.createElement("div");
    slideImg.className = "slide-img";
    const img = document.createElement("img");
    img.src = slideData.slideImg;
    img.alt = "";
    slideImg.appendChild(img);

    const slideHeader = document.createElement("div");
    slideHeader.className = "slide-header";

    const slideTitle = document.createElement("div");
    slideTitle.className = "slide-title";
    const h1 = document.createElement("h1");
    h1.textContent = slideData.slideTitle;
    slideTitle.appendChild(h1);

    const slideDescription = document.createElement("div");
    slideDescription.className = "slide-description";
    const p = document.createElement("p");
    p.textContent = slideData.slideDescription;
    slideDescription.appendChild(p);

    const slideLink = document.createElement("div");
    slideLink.className = "slide-link";
    const a = document.createElement("a");
    a.href = slideData.slideUrl;
    a.textContent = "View Project";
    slideLink.appendChild(a);

    slideHeader.appendChild(slideTitle);
    slideHeader.appendChild(slideDescription);
    slideHeader.appendChild(slideLink);

    const slideInfo = document.createElement("div");
    slideInfo.className = "slide-info";

    const slideTags = document.createElement("div");
    slideTags.className = "slide-tags";
    const tagsLabel = document.createElement("p");
    tagsLabel.textContent = "Tags";
    slideTags.appendChild(tagsLabel);

    slideData.slideTags.forEach((tag) => {
      const tagP = document.createElement("p");
      tagP.textContent = tag;
      slideTags.appendChild(tagP);
    });

    const slideIndexWrapper = document.createElement("div");
    slideIndexWrapper.className = "slide-index-wrapper";
    const slideIndexCopy = document.createElement("p");
    slideIndexCopy.textContent = slideIndex.toString().padStart(2, "0");
    const slideIndexSeparator = document.createElement("p");
    slideIndexSeparator.textContent = "/";
    const slidesTotalCount = document.createElement("p");
    slidesTotalCount.textContent = totalSlides.toString().padStart(2, "0");

    slideIndexWrapper.appendChild(slideIndexCopy);
    slideIndexWrapper.appendChild(slideIndexSeparator);
    slideIndexWrapper.appendChild(slidesTotalCount);

    slideInfo.appendChild(slideTags);
    slideInfo.appendChild(slideIndexWrapper);

    slide.appendChild(slideImg);
    slide.appendChild(slideHeader);
    slide.appendChild(slideInfo);

    return slide;
  };

  const splitText = (slide) => {
    const slideHeader = slide.querySelector(".slide-title h1");
    if (slideHeader) {
      SplitText.create(slideHeader, {
        type: "words",
        wordsClass: "word",
        mask: "words",
      });
    }

    const slideContent = slide.querySelectorAll("p, a");
    slideContent.forEach((element) => {
      SplitText.create(element, {
        type: "lines",
        linesClass: "line",
        mask: "lines",
        reduceWhiteSpace: false,
      });
    });
  };

  const animateSlide = (direction) => {
    if (isAnimatingRef.current || !scrollAllowedRef.current) return;

    isAnimatingRef.current = true;
    scrollAllowedRef.current = false;

    const slider = sliderRef.current;
    const currentSlideElement = slider.querySelector(".slide");

    if (direction === "down") {
      currentSlideRef.current =
        currentSlideRef.current === totalSlides
          ? 1
          : currentSlideRef.current + 1;
    } else {
      currentSlideRef.current =
        currentSlideRef.current === 1
          ? totalSlides
          : currentSlideRef.current - 1;
    }

    const exitY = direction === "down" ? "-200vh" : "200vh";
    const entryY = direction === "down" ? "100vh" : "-100vh";
    const entryClipPath =
      direction === "down"
        ? "polygon(20% 20%, 80% 20%, 80% 100%, 20% 100%)"
        : "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)";

    gsap.to(currentSlideElement, {
      scale: 0.25,
      opacity: 0,
      rotation: 30,
      y: exitY,
      duration: 2,
      ease: "power4.inOut",
      force3D: true,
      onComplete: () => {
        currentSlideElement.remove();
      },
    });

    setTimeout(() => {
      const newSlide = createSlide(currentSlideRef.current);

      gsap.set(newSlide, {
        y: entryY,
        clipPath: entryClipPath,
        force3D: true,
      });

      slider.appendChild(newSlide);

      splitText(newSlide);

      const words = newSlide.querySelectorAll(".word");
      const lines = newSlide.querySelectorAll(".line");

      gsap.set([...words, ...lines], {
        y: "100%",
        force3D: true,
      });

      gsap.to(newSlide, {
        y: 0,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "power4.out",
        force3D: true,
        onStart: () => {
          const tl = gsap.timeline();

          const headerWords = newSlide.querySelectorAll(".slide-title .word");
          tl.to(
            headerWords,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
              force3D: true,
            },
            0.75
          );

          const tagsLines = newSlide.querySelectorAll(".slide-tags .line");
          const indexLines = newSlide.querySelectorAll(
            ".slide-index-wrapper .line"
          );
          const descriptionLines = newSlide.querySelectorAll(
            ".slide-description .line"
          );

          tl.to(
            tagsLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            },
            "-=0.75"
          );

          tl.to(
            indexLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            },
            "<"
          );

          tl.to(
            descriptionLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            },
            "<"
          );

          const linkLines = newSlide.querySelectorAll(".slide-link .line");
          tl.to(
            linkLines,
            {
              y: "0%",
              duration: 1,
              ease: "power4.out",
            },
            "-=1"
          );
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          setTimeout(() => {
            scrollAllowedRef.current = true;
            lastScrollTimeRef.current = Date.now();
          }, 100);
        },
      });
    }, 750);
  };

  const handleScroll = (direction) => {
    const now = Date.now();

    if (isAnimatingRef.current || !scrollAllowedRef.current) return;
    if (now - lastScrollTimeRef.current < 1000) return;

    lastScrollTimeRef.current = now;
    animateSlide(direction);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const initialSlide = createSlide(1);
    slider.appendChild(initialSlide);
    splitText(initialSlide);

    const words = initialSlide.querySelectorAll(".word");
    const lines = initialSlide.querySelectorAll(".line");

    gsap.set([...words, ...lines], {
      y: "100%",
      force3D: true,
    });

    gsap.to([...words, ...lines], {
      y: "0%",
      duration: 1,
      ease: "power4.out",
      stagger: 0.1,
      force3D: true,
    });

    const handleWheel = (e) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? "down" : "up";
      handleScroll(direction);
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
      isTouchActiveRef.current = true;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (
        !isTouchActiveRef.current ||
        isAnimatingRef.current ||
        !scrollAllowedRef.current
      )
        return;

      const touchCurrentY = e.touches[0].clientY;
      const difference = touchStartYRef.current - touchCurrentY;

      if (Math.abs(difference) > 50) {
        isTouchActiveRef.current = false;
        const direction = difference > 0 ? "down" : "up";
        handleScroll(direction);
      }
    };

    const handleTouchEnd = () => {
      isTouchActiveRef.current = false;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return <div ref={sliderRef} className="slider"></div>;
};

export default Slider;
