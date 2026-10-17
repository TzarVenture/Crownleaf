"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero-section"
      aria-label="CrownLeaf Corporate Gifting Atelier"
      className="relative w-full overflow-hidden bg-[#FAF8F5] select-none border-b border-[#D1B2B2]/60 h-[calc(100svh-96px)] sm:h-[calc(100dvh-116px)]"
      style={{ height: "calc(100dvh - var(--navbar-height, 116px))" }}
    >
      {/* 1. Background studio table tone matching the photo */}
      <div className="absolute inset-0 bg-[#FAF6ED] pointer-events-none" />

      {/* 2. Uncropped Hamper Image pinned to the right and scaled to fit container height */}
      <div className="absolute right-0 top-0 bottom-0 h-full flex items-center justify-end pointer-events-none select-none py-1 sm:py-2.5 lg:py-3.5 pr-0 sm:pr-2 lg:pr-3">
        <Image
          src="/images/hero-showcase.jpg"
          alt="CrownLeaf Luxury Executive Corporate Gifting Hamper"
          width={1024}
          height={576}
          priority
          className="h-full w-auto max-w-none object-contain object-right select-none [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_15%)] [mask-image:linear-gradient(to_right,transparent_0%,black_15%)]"
        />
      </div>

      {/* 3. Hero Content Container (Positioned in the Open Left Studio Space) */}
      <div className="relative z-10 max-w-[1300px] mx-auto w-full h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-[380px] xs:max-w-[420px] sm:max-w-[450px] lg:max-w-[480px]">
            {/* Eyebrow Tag */}
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#A67D44] block mb-2 sm:mb-2.5">
              Premium Corporate Gifting
            </span>

            {/* Display Headline */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#003108] leading-[1.14]">
              Thoughtful Gifts.{" "}
              <span className="text-[#A67D44] block sm:inline">Strong Impressions.</span>
            </h1>

            {/* Subtle Atelier Divider */}
            <div className="flex items-center gap-2 my-3 sm:my-3.5">
              <div className="h-px w-8 bg-[#A67D44]/40" />
              <div className="w-1.5 h-1.5 rotate-45 border border-[#A67D44]" />
              <div className="h-px w-8 bg-[#A67D44]/40" />
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm lg:text-[15px] text-stone-700 leading-relaxed font-normal max-w-md">
              Elevate relationships and show appreciation with curated, branded gifts that leave a lasting impact on employees, clients, and partners.
            </p>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#inventory"
                className="inline-flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3.5 bg-[#A67D44] hover:bg-[#8E6935] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
              >
                <span>Explore Corporate Gifts</span>
                <span className="ml-2 text-xs">→</span>
              </a>

              <a
                href="https://wa.me/917760775875?text=Hi%20Crownleaf,%20I%20would%20like%20to%20request%20a%20corporate%20gifting%20quote."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white/90 hover:bg-white text-[#003108] border border-[#003108]/30 hover:border-[#003108] text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
              >
                Request a Quote
              </a>
            </div>

            {/* 3. Trust Badges Strip with Prominent Sized Icons */}
            <div className="mt-7 sm:mt-9 pt-4 sm:pt-5 border-t border-[#D1B2B2]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Badge 1: Bulk Orders */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#A67D44] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="leading-tight">
                  <div className="text-[11px] sm:text-xs font-bold text-[#003108]">Bulk Orders</div>
                  <div className="text-[10px] sm:text-[10.5px] text-stone-500 font-normal">Made Easy</div>
                </div>
              </div>

              {/* Badge 2: Brand Customization */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#A67D44] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div className="leading-tight">
                  <div className="text-[11px] sm:text-xs font-bold text-[#003108]">Brand</div>
                  <div className="text-[10px] sm:text-[10.5px] text-stone-500 font-normal">Customization</div>
                </div>
              </div>

              {/* Badge 3: Premium Quality */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#A67D44] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <div className="leading-tight">
                  <div className="text-[11px] sm:text-xs font-bold text-[#003108]">Premium</div>
                  <div className="text-[10px] sm:text-[10.5px] text-stone-500 font-normal">Quality</div>
                </div>
              </div>

              {/* Badge 4: Nationwide Delivery */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#A67D44] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <div className="leading-tight">
                  <div className="text-[11px] sm:text-xs font-bold text-[#003108]">Nationwide</div>
                  <div className="text-[10px] sm:text-[10.5px] text-stone-500 font-normal">Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
