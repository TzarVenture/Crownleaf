import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "welcome-kits",
    titleLine1: "WELCOME KITS &",
    titleLine2: "ONBOARDING",
    image: "https://crownleaf.co/wp-content/uploads/2026/02/Customized-Employee-Welcome-kit.webp",
    href: "#inventory",
    tag: "Welcome Kit",
  },
  {
    id: "executive-gifts",
    titleLine1: "EXECUTIVE &",
    titleLine2: "CLIENT GIFTS",
    image: "https://crownleaf.co/wp-content/uploads/2026/02/luxury-business-corporate-gift-set-with-customized-logo.jpg",
    href: "#inventory",
    tag: "Executive Gifts",
  },
  {
    id: "wellness-hampers",
    titleLine1: "WELLNESS &",
    titleLine2: "SCENTED HAMPERS",
    image: "https://crownleaf.co/wp-content/uploads/2026/02/No_Respansabilities_1b28863f-8fe2-4a61-9c34-2a80329e1000_480x480.webp",
    href: "#inventory",
    tag: "Client Gifts",
  },
  {
    id: "festive-boxes",
    titleLine1: "FESTIVE &",
    titleLine2: "CELEBRATION BOXES",
    image: "https://crownleaf.co/wp-content/uploads/2026/02/corporate-holiday-gift-ideas-chocolate-scaled.jpg",
    href: "#inventory",
    tag: "Employee Gifts",
  },
  {
    id: "drinkware-flasks",
    titleLine1: "DRINKWARE &",
    titleLine2: "VACUUM FLASKS",
    image: "https://crownleaf.co/wp-content/uploads/2026/08/Crown-A1.jpg.jpeg",
    href: "#inventory",
    tag: "Drinkware",
  },
];

export default function CategoryShowcase({ onSelectCategory }) {
  return (
    <section
      aria-label="Gift Categories"
      className="py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-[#EFE8E0] via-[#FAF8F5] to-white border-b border-[#E2D9CF]"
    >
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Flanking Architectural Hairlines */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-5 sm:mb-6">
          <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#003108] text-center whitespace-normal">
            Beautiful Gifts They’ll Actually Love
          </h2>
          <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
        </div>

        {/* Responsive Showcase Stage: Horizontal swipe on mobile, 5-col grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none pb-2 sm:pb-0 gap-3 sm:gap-4 lg:gap-4.5 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="flex-shrink-0 w-[58vw] max-w-[210px] sm:w-auto snap-start block bg-[#FAF6F0] rounded-none border border-[#E8E0D5] overflow-hidden shadow-2xs"
            >
              {/* Compact Product Stage */}
              <div className="relative aspect-square sm:aspect-[4/4.3] w-full bg-[#FAF6F0] overflow-hidden">
                <Image
                  src={category.image}
                  alt={`${category.titleLine1} ${category.titleLine2}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>

              {/* Two-Line Centered Label in Lighter Refined Cream Surface */}
              <div className="py-2.5 px-2 sm:py-3 text-center bg-[#F6F1EA] border-t border-[#E8E0D5]">
                <span className="block text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-[#5D4632] leading-tight">
                  {category.titleLine1}
                </span>
                <span className="block text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-[#5D4632] leading-tight mt-0.5">
                  {category.titleLine2}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
