import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CategoryShowcase from "@/components/CategoryShowcase";
import OccasionShowcase from "@/components/OccasionShowcase";
import { wcApi } from "@/lib/woocommerce";

export const revalidate = 60; // Revalidate inventory cache every 60 seconds (ISR)

async function getInventory() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      wcApi.get("products", {
        status: "publish", // Mandatory rule: Published products only
        per_page: 18,
      }),
      wcApi.get("products/categories", {
        hide_empty: true,
        per_page: 10,
      }),
    ]);

    return {
      products: productsRes.data || [],
      categories: categoriesRes.data || [],
      error: null,
    };
  } catch (err) {
    console.error("WooCommerce API fetch error:", err?.response?.data || err?.message);
    return {
      products: [],
      categories: [],
      error: "Unable to retrieve real-time inventory from WooCommerce. Please try again shortly.",
    };
  }
}

export default async function HomePage() {
  const { products, categories, error } = await getInventory();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-1">
        <Hero />

        {/* Curated Category Showcase */}
        <CategoryShowcase />

        {/* Brand Highlights & Occasion Showcase */}
        <OccasionShowcase />

        {/* Category Navigation Strip */}
        {categories.length > 0 && (
          <section id="categories" className="py-5 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E2D9CF]">
            <div className="max-w-[1300px] mx-auto">
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 whitespace-nowrap mr-2">
                  Category:
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#003108] text-white whitespace-nowrap cursor-pointer shadow-xs">
                  All ({products.length})
                </span>
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#EFE8E0] hover:bg-[#D1B2B2]/40 text-[#003108] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {cat.name} ({cat.count})
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Live Product Showcase Grid */}
        <section id="inventory" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1300px] mx-auto w-full">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-4 border-b border-[#E2D9CF] gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#A67D44] block mb-1">
                Verified Inventory
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003108] tracking-tight">
                Featured Corporate Gifts &amp; Hampers
              </h2>
            </div>
            <div className="text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-md border border-[#E2D9CF]">
              Showing {products.length} published products
            </div>
          </div>

          {/* Diagnostic Error Notice */}
          {error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-1">API Notice</h3>
              <p className="text-sm">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E2D9CF]">
              <p className="text-slate-500 text-sm font-medium">
                No published products currently available in this collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#003108] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-black/20">
        <div className="max-w-[1300px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/70">
          <div>
            <span className="font-bold uppercase tracking-wider text-white">CrownLeaf Corporate Gifting</span> — Bespoke Corporate Hampers &amp; Executive Solutions Across India
          </div>
          <div>
            &copy; {new Date().getFullYear()} CrownLeaf. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
