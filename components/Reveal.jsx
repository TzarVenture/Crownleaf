"use client";

import { useEffect, useRef } from "react";

// One shared observer for every Reveal on the page. Each element is released as soon
// as it has appeared, so nothing keeps being watched after its animation has played.
let sharedObserver = null;

function getObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("reveal-in");
        sharedObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  return sharedObserver;
}

/**
 * Reveal
 *
 * Fades its content in with a small upward drift the first time it scrolls into view.
 * - The server renders it fully visible. The hidden state is added in the browser, and only
 *   for elements that are still below the fold, so nothing flashes and nothing depends on JS.
 * - `index` staggers siblings (capped at 8 steps so long grids never feel slow).
 * - Does nothing when the visitor prefers reduced motion.
 * Pass layout classes through `className`; it renders `as` (default div).
 */
export default function Reveal({ as: Tag = "div", index = 0, className = "", style, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const rect = el.getBoundingClientRect();
    // Already on screen when the page loaded: leave it alone.
    if (rect.top < window.innerHeight * 0.92) return undefined;
    // Off to the side in a horizontal swipe row: also leave it alone, so swiping never shows blanks.
    if (rect.left >= window.innerWidth || rect.right <= 0) return undefined;

    el.classList.add("reveal-hidden");
    const observer = getObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <Tag ref={ref} className={className} style={{ "--reveal-i": Math.min(index, 7), ...style }} {...rest}>
      {children}
    </Tag>
  );
}
