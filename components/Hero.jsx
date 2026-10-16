"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const SLIDES = [
  {
    id: "slide-1",
    headingLine1: "Thoughtful gifts.",
    headingLine2: "Timeless impressions.",
    description: "Elevate your corporate gifting experience with elegance",
    buttonLabel: "Discover Now",
    buttonHref: "#inventory",
    desktopImage:
      "https://crownleaf.co/wp-content/uploads/2025/10/banner-2-7-scaled.webp",
    mobileImage: "/images/hero/pexels6.jpg",
    alt: "CrownLeaf Black Luxury Gift Box with Gold Ribbon",
  },
  {
    id: "slide-2",
    headingLine1: "Make every gift",
    headingLine2: "unforgettable.",
    description: "Curated with care, wrapped in sophistication.",
    buttonLabel: "Explore Now",
    buttonHref: "#inventory",
    desktopImage:
      "https://crownleaf.co/wp-content/uploads/2025/10/banner-3-5-scaled.webp",
    mobileImage: "/images/hero/pexels4.jpg",
    alt: "CrownLeaf Corporate Colleagues Exchanging Gift Hamper",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative w-full overflow-hidden bg-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Carousel"
    >
      {/* Slides Container */}
      <div className="relative w-full h-[310px] xs:h-[330px] sm:h-[380px] md:h-[450px] lg:h-[520px]">
        {/* Background Image Slides */}
        <div className="absolute inset-0 z-0">
          {SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={`bg-${slide.id}`}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
              >
                {/* Desktop High-Res Banner (Visible on lg and up) */}
                <div className="hidden lg:block absolute inset-0">
                  <Image
                    src={slide.desktopImage}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover object-[28%_center]"
                  />
                </div>

                {/* Cropped Image for md and sm screens: Anchored left so subjects are visible */}
                <div className="block lg:hidden absolute inset-0">
                  <Image
                    src={slide.mobileImage}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover object-[15%_center] xs:object-[18%_center] sm:object-[22%_center]"
                  />
                  {/* Gentle overlay to ensure copy legibility */}
                  <div className="absolute inset-0 bg-black/25 sm:bg-black/20" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Slide Content Overlay - Lean Atelier Card Anchored Right with Snug Proportions */}
        <div className="relative z-10 h-full max-w-[1300px] mx-auto px-3 xs:px-4 sm:px-6 md:pr-24 lg:pr-32 xl:pr-36 flex items-end pb-3.5 sm:pb-0 sm:items-center justify-end pointer-events-none">
          <div className="relative w-[150px] xs:w-[165px] sm:w-[280px] md:w-[335px] lg:w-[350px] h-[122px] xs:h-[130px] sm:h-[168px] md:h-[178px] lg:h-[188px] md:mr-3 lg:mr-4 shrink-0 pointer-events-auto bg-[#FAF7F0]/95 backdrop-blur-md p-2.5 xs:p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-[#E4DCCF] shadow-lg text-left">
            {SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={`text-${slide.id}`}
                  className={`absolute inset-2.5 xs:inset-3 sm:inset-4 md:inset-5 flex flex-col justify-start gap-1 xs:gap-1.5 sm:gap-2.5 transition-opacity duration-400 ease-in-out ${isActive
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                    }`}
                >
                  <div className="space-y-0.5 sm:space-y-1">
                    {/* Headline */}
                    <h1 className="text-[11px] xs:text-[12px] sm:text-base md:text-xl lg:text-[22px] font-bold text-[#17472F] leading-[1.2] tracking-tight">
                      <span className="block">{slide.headingLine1}</span>
                      <span className="block text-[#A47A3C]">{slide.headingLine2}</span>
                    </h1>

                    {/* Subtle hairline rule */}
                    <div className="w-4 sm:w-7 h-0.5 bg-[#A47A3C]/40" />

                    {/* Description */}
                    <p className="text-[8.5px] xs:text-[9px] sm:text-xs font-light text-stone-700 leading-snug line-clamp-2 sm:line-clamp-none">
                      {slide.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-0.5 sm:pt-0">
                    <Link
                      href={slide.buttonHref}
                      className="inline-flex items-center justify-center w-full px-2 py-1.5 sm:px-4 sm:py-2.5 bg-[#17472F] hover:bg-[#123825] text-white text-[9px] xs:text-[9.5px] sm:text-xs font-semibold tracking-wider uppercase rounded-full transition-colors shadow-xs active:scale-95"
                    >
                      <span>{slide.buttonLabel}</span>
                      <span className="ml-1 sm:ml-1.5 text-xs">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Arrows (Desktop & Tablet only to prevent mobile overlap) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#FAF7F0]/90 hover:bg-[#FAF7F0] text-[#17472F] border border-[#E4DCCF] items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#FAF7F0]/90 hover:bg-[#FAF7F0] text-[#17472F] border border-[#E4DCCF] items-center justify-center shadow-xs transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Pagination Dots - Positioned Bottom-Left on Mobile to avoid any card overlap */}
        <div className="absolute bottom-2.5 sm:bottom-5 left-3.5 sm:left-1/2 sm:-translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={`dot-${slide.id}`}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentSlide
                ? "w-6 sm:w-8 h-1.5 sm:h-2.5 bg-[#A47A3C]"
                : "w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 bg-black/30 hover:bg-black/50"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

