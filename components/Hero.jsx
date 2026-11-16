"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

const LIFESTYLE_BANNER = {
  image: "/images/banners/home-hero.webp",
  alt: "Colleagues opening a corporate gift box with a notebook, drinkware and eco-friendly gifts",
  mobilePos: "object-[68%_50%]",
  desktopPos: "lg:object-center",
};

// Each slide can carry its own banner image and crop. The crop classes are written out in full
// so Tailwind picks them up. Slides without an image use the lifestyle banner.
const SLIDES = [
  {
    id: "welcome-kits",
    headline: "Welcome Kits for New Hires",
    text: "Custom-branded onboarding kits.",
    cta: "Shop Welcome Kits",
    href: "/products?category=welcome-kit",
    ...LIFESTYLE_BANNER,
  },
  {
    id: "executive-gifts",
    headline: "Gifts for Clients and Leaders",
    text: "Curated executive gift sets.",
    cta: "Shop Executive Gifts",
    href: "/products?category=executive-gifts",
    image: "/images/banners/home-hero-2.webp",
    alt: "Black and white flasks, bamboo-lid mugs, cork notebooks and a pen arranged with eucalyptus leaves",
    mobilePos: "object-[88%_50%]",
    desktopPos: "lg:object-[center_45%]",
  },
  {
    id: "drinkware",
    headline: "Branded Drinkware",
    text: "Flasks and mugs with your logo.",
    cta: "Shop Drinkware",
    href: "/products?category=drinkware",
    image: "/images/banners/home-hero-3.webp",
    alt: "Flat lay of black and white flasks, bamboo-lid mugs, glass tumblers, cork notebooks, coasters and pens",
    mobilePos: "object-center",
    desktopPos: "lg:object-center",
    // This image has products across the whole width, so the desktop text sits on a soft cream panel.
    panel: "lg:bg-[#FAF8F5]/90 lg:p-7 lg:-ml-7",
  },
  {
    id: "employee-gifts",
    headline: "Gifts for Every Milestone",
    text: "Hampers for employee recognition.",
    cta: "Shop Employee Gifts",
    href: "/products?category=employee-gifts",
    image: "/images/banners/home-hero-4-clean.webp",
    alt: "Three CrownLeaf employee gift hampers: a branded notebook and drinkware set, an executive set with a keychain and gourmet jars, and a wellness gift box",
    mobilePos: "object-[80%_50%]",
    desktopPos: "lg:object-center",
  },
];

const TOTAL = SLIDES.length;
// Track = [clone of last, ...real slides, clone of first]; real slides sit at index 1..TOTAL.
const TRACK = [SLIDES[TOTAL - 1], ...SLIDES, SLIDES[0]];
const AUTOPLAY_MS = 6000;
const SLIDE_MS = 500;
const SWIPE_PX = 50;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

// Small screens: outlined, no fill (sits on the cream page background).
// Desktop: translucent green glass so it reads on both the light and dark parts of the banner.
const arrowButtonClass =
  "w-11 h-11 shrink-0 rounded-full border border-[#003108]/40 text-[#003108] hover:bg-[#003108]/10 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E6935] lg:bg-[#003108]/30 lg:border-white/60 lg:text-white lg:backdrop-blur-sm lg:hover:bg-[#003108]/55";

/**
 * Hero
 *
 * Full-width banner slider. The same banner image is repeated on four slides,
 * each with its own category text and CTA. The loop is infinite: clones of the
 * last and first slide sit at the ends of the track, and after reaching a clone
 * the track jumps back (without transition) to the matching real slide.
 */
export default function Hero() {
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const indexRef = useRef(1);
  const busyRef = useRef(false);
  const timerRef = useRef(null);
  const pointerStartX = useRef(null);

  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );

  const commit = useCallback((next) => {
    indexRef.current = next;
    setIndex(next);
  }, []);

  // After a move: if we are on a clone, jump to the matching real slide with no transition.
  const settle = useCallback(() => {
    clearTimeout(timerRef.current);
    const current = indexRef.current;
    if (current === 0 || current === TOTAL + 1) {
      setAnimate(false);
      commit(current === 0 ? TOTAL : 1);
      // Re-enable the transition only after the un-animated jump has painted.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimate(true);
          busyRef.current = false;
        })
      );
    } else {
      busyRef.current = false;
    }
  }, [commit]);

  const startMove = useCallback(
    (target) => {
      if (busyRef.current || target === indexRef.current) return;
      busyRef.current = true;
      setAnimate(true);
      commit(target);
      // Fallback when transitionend never fires (hidden tab, reduced motion).
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(settle, reduced ? 30 : SLIDE_MS + 150);
    },
    [commit, reduced, settle]
  );

  const next = useCallback(() => startMove(indexRef.current + 1), [startMove]);
  const prev = useCallback(() => startMove(indexRef.current - 1), [startMove]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const autoplayActive = !userPaused && !hovered && !focused && !reduced;
  useEffect(() => {
    if (!autoplayActive) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) next();
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoplayActive, next]);

  const activeDot = (((index - 1) % TOTAL) + TOTAL) % TOTAL;

  const handlePointerDown = (e) => {
    pointerStartX.current = e.clientX;
  };
  const handlePointerUp = (e) => {
    if (pointerStartX.current === null) return;
    const dx = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(dx) >= SWIPE_PX) {
      if (dx < 0) next();
      else prev();
    }
  };

  return (
    <section
      id="hero-section"
      aria-roledescription="carousel"
      aria-label="Featured corporate gift collections"
      className="relative w-full bg-[#FAF8F5] border-b border-[#D1B2B2]/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <h1 className="sr-only">CrownLeaf corporate gifting: welcome kits, executive gifts and drinkware</h1>

      <div
        className="overflow-hidden touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate && !reduced ? `transform ${SLIDE_MS}ms ease-out` : "none",
          }}
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget) settle();
          }}
        >
          {TRACK.map((slide, i) => {
            const isClone = i === 0 || i === TOTAL + 1;
            const isActive = i === index;
            const realPosition = isClone ? (i === 0 ? TOTAL : 1) : i;
            return (
              <article
                key={`${i}-${slide.id}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${realPosition} of ${TOTAL}`}
                aria-hidden={!isActive}
                data-current={realPosition - 1 === activeDot}
                className="w-full shrink-0 lg:relative"
              >
                {/* Banner image: tall crop on small screens, full 3:1 on desktop */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[3/1] bg-[#F3EDE4] overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={isClone ? "" : slide.alt}
                    fill
                    priority={i === 1}
                    // Other slides load eagerly too, so a slide is never blank when it slides in.
                    loading={i === 1 ? undefined : "eager"}
                    sizes="100vw"
                    draggable={false}
                    className={`hero-img object-cover ${slide.mobilePos} ${slide.desktopPos} select-none`}
                  />
                </div>

                {/* Text + CTA: below the image on small screens, over the empty left area on desktop */}
                <div className="lg:absolute lg:inset-0">
                  <div className="max-w-[1300px] mx-auto h-full px-4 sm:px-6 lg:px-8 pt-6 lg:pt-0 flex items-center">
                    <div
                      className={`w-full lg:max-w-[340px] xl:max-w-[420px] 2xl:max-w-[470px] ${slide.panel || ""}`}
                    >
                      <h2 style={{ "--hero-i": 0 }} className="hero-anim text-2xl sm:text-3xl lg:text-[28px] xl:text-[36px] 2xl:text-[42px] font-bold tracking-tight text-[#003108] leading-[1.15] text-balance">
                        {slide.headline}
                      </h2>
                      <p style={{ "--hero-i": 1 }} className="hero-anim mt-2 text-sm lg:text-[15px] text-stone-700 leading-relaxed max-w-md">
                        {slide.text}
                      </p>
                      <Link
                        href={slide.href}
                        tabIndex={isActive ? 0 : -1}
                        style={{ "--hero-i": 2 }}
                        className="hero-anim mt-5 lg:mt-6 inline-flex items-center justify-center px-6 py-3 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003108] focus-visible:ring-offset-2"
                      >
                        {slide.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Controls: a row under the slide on small screens, overlaid on the banner on desktop */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 lg:contents">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className={`${arrowButtonClass} lg:absolute lg:left-4 lg:top-1/2 lg:-translate-y-1/2 lg:z-20`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dots + pause: no background; on desktop aligned with the text, on the light left side of the banner */}
        <div className="lg:absolute lg:inset-x-0 lg:bottom-5 lg:z-20 lg:pointer-events-none">
          <div className="flex items-center gap-3 lg:max-w-[1300px] lg:mx-auto lg:px-8 lg:pointer-events-auto">
            <div className="flex items-center gap-2">
              {SLIDES.map((slide, k) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => startMove(k + 1)}
                  aria-label={`Go to slide ${k + 1}: ${slide.headline}`}
                  aria-current={k === activeDot}
                  className={`h-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E6935] ${
                    k === activeDot ? "w-8 bg-[#003108]" : "w-3 bg-[#003108]/35 hover:bg-[#003108]/65"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              className="w-7 h-7 flex items-center justify-center text-[#003108] hover:text-[#8E6935] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E6935]"
            >
              {userPaused ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className={`${arrowButtonClass} lg:absolute lg:right-4 lg:top-1/2 lg:-translate-y-1/2 lg:z-20`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
