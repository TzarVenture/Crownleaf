"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const GIFTING_CATEGORIES = [
  {
    id: "employee-welcome-kits",
    name: "Employee Welcome Kits",
    href: "https://crownleaf.co/product-category/welcome-kit/",
    image: "https://crownleaf.co/wp-content/uploads/2025/10/Products-1-1024x836.webp",
    alt: "Employee Welcome Kits - Executive Employee Onboarding Hampers & New Joiner Gift Sets",
  },
  {
    id: "eco-friendly-gifts",
    name: "Eco Friendly Gifts",
    href: "https://crownleaf.co/product-category/eco-freindly/",
    image: "https://crownleaf.co/wp-content/uploads/2025/10/Products-2-1024x836.webp",
    alt: "Eco Friendly Gifts - Sustainable Bamboo & Organic Corporate Hampers",
  },
  {
    id: "client-gifts",
    name: "Client Gifts",
    href: "https://crownleaf.co/product-category/client-gifts/",
    image: "https://crownleaf.co/wp-content/uploads/2025/10/Products-3-1024x836.webp",
    alt: "Client Gifts - VIP Executive Leather Portfolios & Bespoke Business Gifts",
  },
  {
    id: "promotional-gifts",
    name: "Promotional Gifts",
    href: "https://crownleaf.co/product-category/promotional-gifts/",
    image: "https://crownleaf.co/wp-content/uploads/2025/10/Products-4-1024x836.webp",
    alt: "Promotional Gifts - Custom Branded Merchandise & Event Giveaways",
  },
  {
    id: "vegan-free",
    name: "Vegan Free",
    href: "https://crownleaf.co/product-category/vegan-free/",
    image: "https://crownleaf.co/wp-content/uploads/2026/01/1-3-300x300.jpg",
    alt: "Vegan Free - Ethical & Plant-Based Corporate Gifts",
  },
];

export default function GiftingCategories({
  title = "Gifting Categories",
  description = null,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section
      id="categories"
      aria-label="Gifting Categories"
      className="py-3.5 sm:py-5 px-4 sm:px-6 lg:px-8 bg-[#FAF7F0] border-b border-[#E4DCCF]"
    >
      {/* Section Header - Aligned with CategorySection Design */}
      <div className="max-w-[1300px] mx-auto mb-3.5 sm:mb-4 pb-2 border-b border-[#E4DCCF]">
        <h2 className="text-lg sm:text-xl font-bold text-[#17472F] tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs sm:text-sm font-light text-stone-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="max-w-[1300px] mx-auto relative group/cat">
        {/* Left Scroll Chevron (Tablet & Desktop only; Mobile uses native touch swipe) */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Scroll categories left"
          className={`hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-[#D1B2B2] shadow-sm items-center justify-center text-[#17472F] transition-all duration-200 hover:bg-[#A47A3C] hover:text-white hover:border-[#A47A3C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] ${canScrollLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Scroll Chevron (Tablet & Desktop only) */}
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Scroll categories right"
          className={`hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/95 border border-[#D1B2B2] shadow-sm items-center justify-center text-[#17472F] transition-all duration-200 hover:bg-[#A47A3C] hover:text-white hover:border-[#A47A3C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] ${canScrollRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Single-Line Category Scroll Track - Full-bleed on mobile with smooth momentum */}
        <div
          ref={scrollRef}
          className="flex items-start gap-3.5 sm:gap-6 md:gap-8 lg:gap-10 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 sm:px-2 justify-start sm:justify-center -mx-4 sm:mx-0 overscroll-x-contain"
        >
          {GIFTING_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col items-center shrink-0 w-[100px] sm:w-[115px] lg:w-auto snap-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] rounded-2xl p-1 transition-transform duration-300 hover:-translate-y-0.5"
            >
              {/* Squircle Product Image Stage */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-[18px] sm:rounded-[22px] lg:rounded-[26px] overflow-hidden border border-[#E4DCCF] group-hover:border-[#A47A3C] bg-white shadow-xs group-hover:shadow-md group-hover:shadow-[#17472F]/10 transition-all duration-300">
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
                {/* Subtle ambient lens sheen */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity duration-300"
                  aria-hidden="true"
                />
              </div>

              {/* Category Title */}
              <h3 className="mt-2 text-[11px] sm:text-xs font-semibold text-[#17472F] group-hover:text-[#A47A3C] transition-colors leading-snug tracking-wide line-clamp-2 max-w-[105px] sm:max-w-[120px]">
                {cat.name}
              </h3>

              {/* Subtle expanding indicator line */}
              <div
                className="w-3.5 h-0.5 bg-[#A47A3C] mt-1 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
