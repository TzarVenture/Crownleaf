import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GiftingCategories from "@/components/GiftingCategories";
import CategorySection from "@/components/CategorySection";
import OccasionEnquiryForm from "@/components/OccasionEnquiryForm";
import Footer from "@/components/Footer";
import { wcApi } from "@/lib/woocommerce";

export const revalidate = 60; // Revalidate inventory cache every 60 seconds (ISR)

async function getInventory() {
  try {
    const [corporateRes, drinkwareRes] = await Promise.all([
      wcApi.get("products", {
        status: "publish", // Mandatory rule: Published products only
        per_page: 16,
      }),
      wcApi.get("products", {
        status: "publish",
        category: "39", // Drinkware category ID from WooCommerce backend
        per_page: 16,
      }),
    ]);

    // Prioritize complete gift sets and executive hampers over standalone diaries/notebooks
    const rawCorporate = corporateRes.data || [];
    const corporateGiftSets = rawCorporate.filter((p) => {
      const lower = p.name.toLowerCase();
      return (
        !lower.includes("notebook") &&
        !lower.includes("notepads") &&
        !lower.includes("diary") &&
        !lower.includes("paper notebook")
      );
    });

    return {
      corporateProducts: corporateGiftSets.length > 0 ? corporateGiftSets : rawCorporate,
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
    <div className="min-h-screen flex flex-col bg-[#F4EFE6]">
      <Navbar />
      <main className="flex-1">
        <Hero />

        {/* Curated Gifting Collections Discovery */}
        <GiftingCategories title="Gifting Categories" />

        {/* Diagnostic Error Notice */}
        {error ? (
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1300px] mx-auto w-full">
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-1">API Notice</h3>
              <p className="text-sm">{error}</p>
            </div>
          </section>
        ) : (
          <div id="inventory">
            {/* Section 1: Corporate Gifts Online - For Client & Employee */}
            <CategorySection
              title="Corporate Gifts Online - For Client & Employee"
              description="One Stop Solution for unique and premium corporate gift hampers. Explore our top high quality gifting options for employees and clients at affordable prices across India."
              products={corporateProducts}
              categoryHref="https://crownleaf.co/product-category/welcome-kit/"
            />

            {/* Section 2: Drink Ware */}
            <CategorySection
              title="Drink Ware"
              description="From stylish mugs to sleek water bottles and tumblers, our drinkware options are perfect for everyday use and ensure brand recall value."
              products={drinkwareProducts}
              categoryHref="https://crownleaf.co/product-category/drinkware/"
            />
          </div>
        )}

        {/* Occasion Gifting Enquiry Form Section */}
        <OccasionEnquiryForm />
      </main>

      {/* Comprehensive Atelier Footer */}
      <Footer />
    </div>
  );
}
