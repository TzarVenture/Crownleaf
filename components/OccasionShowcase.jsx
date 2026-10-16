import Image from "next/image";
import Link from "next/link";

export default function OccasionShowcase() {
  const whyPoints = [
    "High Executive Quality",
    "Aesthetic Brand Packaging",
    "Useful & Functional Gifts",
    "Perfect for Any Occasion",
  ];

  const occasions = [
    {
      title: "Employee Onboarding",
      icon: (
        <svg className="w-5 h-5 text-[#9E7B54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: "Client Appreciation",
      icon: (
        <svg className="w-5 h-5 text-[#9E7B54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2m-14 0v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      title: "Milestones & Recognition",
      icon: (
        <svg className="w-5 h-5 text-[#9E7B54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: "Festive & Holiday Gifting",
      icon: (
        <svg className="w-5 h-5 text-[#9E7B54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-label="Why Choose CrownLeaf" className="bg-[#F4EFEA] border-b border-[#E5DDD2] overflow-hidden py-0">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr_1fr] items-stretch gap-6 lg:gap-8">
          {/* Left Column: Why They'll Love It */}
          <div className="w-full flex flex-col justify-start py-6 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-6 order-2 lg:order-1">
            <div>
              {/* Centered Header (Identical height to right header) */}
              <div className="text-center mb-5 sm:mb-6 flex flex-col items-center justify-start min-h-[68px] sm:min-h-[80px]">
                <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-[0.16em] text-[#33251A] text-center leading-snug">
                  Why They’ll
                  <br />
                  Love It
                </h3>
                <div className="flex items-center justify-center gap-3 mt-2.5">
                  <div className="h-px w-12 bg-[#C9BEB0]" />
                  <svg className="w-3.5 h-3.5 text-[#9E7B54]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <div className="h-px w-12 bg-[#C9BEB0]" />
                </div>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 sm:space-y-3.5">
                {whyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border-[1.5px] border-[#9E7B54] text-[#9E7B54] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium text-[#423326]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-6 sm:mt-7 flex justify-center lg:justify-start">
              <Link
                href="#inventory"
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 bg-[#2B3828] text-white text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] hover:bg-[#1E271C] transition-colors shadow-2xs text-center"
              >
                <span>Gift Beautifully</span>
                <svg className="w-4 h-4 text-[#C9BEB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Center Column: Proportional on mobile, Full-Height on desktop */}
          <div className="w-full order-1 lg:order-2 self-stretch relative h-[250px] sm:h-[320px] lg:h-full lg:min-h-full">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/images/bespoke-gift-box.jpg"
                alt="CrownLeaf Bespoke Gift Box with Olive Silk Ribbon"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Subtle Mobile Divider between stacked columns */}
          <div className="w-24 h-px bg-[#D9CEBF] mx-auto my-2 lg:hidden order-2" />

          {/* Right Column: Make Every Occasion Special */}
          <div className="w-full flex flex-col justify-between py-6 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-6 order-3">
            <div>
              {/* Centered Header (Identical height to left header) */}
              <div className="text-center mb-5 sm:mb-6 flex flex-col items-center justify-start min-h-[68px] sm:min-h-[80px]">
                <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-[0.16em] text-[#33251A] text-center leading-snug">
                  Make Every
                  <br />
                  Occasion Special
                </h3>
                <div className="flex items-center justify-center gap-3 mt-2.5">
                  <div className="h-px w-12 bg-[#C9BEB0]" />
                  <svg className="w-3.5 h-3.5 text-[#9E7B54]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <div className="h-px w-12 bg-[#C9BEB0]" />
                </div>
              </div>

              {/* Occasion List */}
              <ul className="space-y-3 sm:space-y-3.5">
                {occasions.map((occ, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="flex items-center justify-center flex-shrink-0">
                      {occ.icon}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium text-[#423326]">
                      {occ.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Tagline */}
            <div className="pt-4 text-center lg:text-left border-t border-[#D9CEBF]">
              <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#8A6D4B]">
                Curated Corporate Gifts For
              </span>
              <span className="block text-[28px] sm:text-4xl lg:text-5xl text-[#2B3828] mt-1 font-cursive leading-none whitespace-normal">
                Distinguished Brands
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
