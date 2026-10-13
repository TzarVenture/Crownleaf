import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-[#FAF8F5] border-b border-[#E2D9CF] overflow-hidden">
      {/* Studio Backdrop Accent */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="max-w-3xl">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE8E0] border border-[#D1B2B2] text-[11px] font-bold uppercase tracking-[0.16em] text-[#003108] mb-6">
            Bespoke Business Gifting Atelier
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#003108] leading-[1.12]">
            Curated Corporate Gifting for Modern Enterprises
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
            Distinguished executive hampers, employee onboarding kits, and VIP client presentations customized with your corporate identity and delivered reliably across India.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="#inventory"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#003108] text-white hover:bg-[#002205] transition-all shadow-sm"
            >
              Explore Catalog
            </Link>
            <Link
              href="#enquiry"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-transparent text-[#003108] border border-[#003108] hover:bg-[#EFE8E0] transition-all"
            >
              Request Bulk Quotation
            </Link>
          </div>
        </div>

        {/* Corporate Trust Pillars Strip */}
        <div className="mt-16 pt-10 border-t border-[#E2D9CF] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#A67D44]">
              Custom Branding
            </div>
            <div className="text-sm font-semibold text-[#003108]">
              Laser engraving, UV print, and bespoke packaging
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#A67D44]">
              Volume Pricing
            </div>
            <div className="text-sm font-semibold text-[#003108]">
              Tiered corporate discounts for 25 to 5,000+ units
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#A67D44]">
              Pan-India Logistics
            </div>
            <div className="text-sm font-semibold text-[#003108]">
              Individual employee door delivery and bulk dispatches
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#A67D44]">
              Corporate Concierge
            </div>
            <div className="text-sm font-semibold text-[#003108]">
              Dedicated account manager for sample approvals
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
