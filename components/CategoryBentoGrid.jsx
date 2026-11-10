import Image from "next/image";
import Link from "next/link";

const BENTO_CATEGORIES = [
  {
    id: "welcome-kits",
    eyebrow: "Onboarding Kits",
    title: "Employee Welcome & Onboarding",
    ctaText: "Explore Welcome Kits",
    href: "/products?category=welcome-kit",
    image: "/images/bento/bento-welcome-kit.jpg",
    span: "col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 min-h-[360px] sm:min-h-[420px] lg:min-h-[500px]",
    titleSize: "text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px]",
    badge: "Signature Collection",
  },
  {
    id: "executive-gifts",
    eyebrow: "Executive Keepsakes",
    title: "VIP Executive & Client Gifts",
    ctaText: "View Executive Gifts",
    href: "/products?category=client-gifts",
    image: "/images/bento/bento-executive-gifts.jpg",
    span: "col-span-1 md:col-span-1 lg:col-span-2 min-h-[240px] sm:min-h-[260px] lg:min-h-[240px]",
    titleSize: "text-xl sm:text-2xl lg:text-[24px]",
  },
  {
    id: "drinkware",
    eyebrow: "Desk Essentials",
    title: "Executive Drinkware",
    ctaText: "Shop Drinkware",
    href: "/products?category=drinkware",
    image: "/images/bento/bento-drinkware.jpg",
    span: "col-span-1 min-h-[240px] sm:min-h-[260px] lg:min-h-[240px]",
    titleSize: "text-lg sm:text-xl lg:text-[20px]",
  },
  {
    id: "eco-friendly",
    eyebrow: "Conscious Gifting",
    title: "Sustainable & Eco-Friendly",
    ctaText: "View Sustainable",
    href: "/products?category=eco-friendly",
    image: "/images/bento/bento-eco-friendly.jpg",
    span: "col-span-1 min-h-[240px] sm:min-h-[260px] lg:min-h-[240px]",
    titleSize: "text-lg sm:text-xl lg:text-[20px]",
  },
  {
    id: "festive-hampers",
    eyebrow: "Celebration Boxes",
    title: "Festive & Milestone Hampers",
    ctaText: "Explore Festive Hampers",
    href: "/products?category=celebration",
    image: "/images/bento/bento-festive-hampers.jpg",
    span: "col-span-1 md:col-span-2 lg:col-span-4 min-h-[260px] sm:min-h-[280px] lg:min-h-[280px]",
    titleSize: "text-2xl sm:text-3xl lg:text-[28px] xl:text-[30px]",
    panoramic: true,
  },
];

/**
 * CategoryBentoGrid Component
 *
 * Implements an architectural, sharp-cornered Bento Grid above the footer for
 * CrownLeaf's flagship corporate gifting categories.
 *
 * Enhancements:
 * 1. Clean visual hierarchy: descriptions removed for maximum image prominence.
 * 2. Lighter gradient scrim concentrated at the bottom for crisp, bright photography.
 * 3. Entire card is interactive/clickable with smooth hover zoom & CTA arrow nudge.
 * 4. Sharp corners (rounded-none) and B2B luxury atelier palette.
 */
export default function CategoryBentoGrid() {
  return (
    <section
      id="categories-bento"
      aria-label="Product Categories Bento Showcase"
      className="py-10 sm:py-14 lg:py-16 bg-[#FAF8F5] border-t border-[#E2D9CF] select-none"
    >
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Flanking Architectural Hairlines */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
          <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
          <div className="text-center">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#A67D44] block mb-1">
              Bespoke Corporate Collections
            </span>
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#003108] text-center whitespace-normal">
              Curated Gifting Categories
            </h2>
          </div>
          <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {BENTO_CATEGORIES.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative overflow-hidden rounded-none border border-[#E2D9CF] bg-stone-900 flex flex-col justify-end focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A67D44] ${item.span}`}
            >
              {/* Background Product Image with subtle hover zoom */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={
                    item.panoramic
                      ? "100vw"
                      : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority={item.id === "welcome-kits"}
                />
              </div>

              {/* Refined, Lighter Gradient Scrim (Concentrated at the bottom third for text legibility) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/40" />

              {/* Optional Top Badge for Signature Category */}
              {item.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-[#A67D44] text-white text-[10px] font-bold uppercase tracking-wider rounded-none shadow-xs">
                    {item.badge}
                  </span>
                </div>
              )}

              {/* Content Stage (Eyebrow, Title, CTA Button) */}
              <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col justify-end h-full">
                {/* Eyebrow Tag */}
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#E0B880] block mb-1.5 drop-shadow-xs">
                  {item.eyebrow}
                </span>

                {/* Card Title */}
                <h3
                  className={`${item.titleSize} font-bold tracking-tight text-white leading-tight drop-shadow-sm`}
                >
                  {item.title}
                </h3>

                {/* Action CTA Button with Hover Micro-Interaction */}
                <div className="mt-4 sm:mt-5">
                  <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[#A67D44] group-hover:bg-[#8E6935] text-white text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.14em] rounded-none transition-colors shadow-xs w-fit">
                    <span>{item.ctaText}</span>
                    <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
