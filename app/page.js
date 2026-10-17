import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CategoryShowcase from "@/components/CategoryShowcase";
import OccasionShowcase from "@/components/OccasionShowcase";
import Footer from "@/components/Footer";
import { wcApi } from "@/lib/woocommerce";

export const revalidate = 60; // Revalidate inventory cache every 60 seconds (ISR)

async function getInventory() {
  try {
    const [corporateRes, drinkwareRes] = await Promise.all([
      wcApi.get("products", {
        status: "publish", // Mandatory rule: Published products only
        per_page: 8,
      }),
      wcApi.get("products", {
        category: "39", // Drinkware collection
        status: "publish",
        per_page: 8,
      }),
    ]);

    return {
      corporateProducts: corporateRes.data || [],
      drinkwareProducts: drinkwareRes.data || [],
      error: null,
    };
  } catch (err) {
    console.error("WooCommerce API fetch error:", err?.response?.data || err?.message);
    return {
      corporateProducts: [],
      drinkwareProducts: [],
      error: "Unable to retrieve real-time inventory from WooCommerce. Please try again shortly.",
    };
  }
}

export default async function HomePage() {
  const { corporateProducts, drinkwareProducts, error } = await getInventory();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-1">
        <Hero />

        {/* Curated Category Showcase */}
        <CategoryShowcase />

        {/* Brand Highlights & Occasion Showcase */}
        <OccasionShowcase />

        {/* Section 1: Featured Corporate Gifts & Hampers */}
        <section id="inventory" className="py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 max-w-[1300px] mx-auto w-full">
          {/* Section Header with Flanking Architectural Hairlines */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#003108] text-center whitespace-normal">
              Featured Corporate Gifts &amp; Hampers
            </h2>
            <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
          </div>

          {/* Diagnostic Error Notice */}
          {error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-1">API Notice</h3>
              <p className="text-sm">{error}</p>
            </div>
          ) : corporateProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E2D9CF]">
              <p className="text-slate-500 text-sm font-medium">
                No published products currently available in this collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
              {corporateProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Executive Drinkware & Desk Essentials */}
        {drinkwareProducts.length > 0 && (
          <section id="drinkware" className="py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 max-w-[1300px] mx-auto w-full border-t border-[#E2D9CF]/60">
            {/* Section Header with Flanking Architectural Hairlines */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
              <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#003108] text-center whitespace-normal">
                Executive Drinkware &amp; Desk Essentials
              </h2>
              <div className="h-px flex-1 max-w-[60px] sm:max-w-[140px] md:max-w-[200px] bg-[#D1B2B2]/80" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
              {drinkwareProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Comprehensive Atelier Footer with WhatsApp Float */}
      <Footer />
    </div>
  );
}
