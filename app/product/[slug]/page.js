import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";
import ShareButtons from "@/components/ShareButtons";
import { wcApi } from "@/lib/woocommerce";

export const revalidate = 60; // ISR cache revalidation every 60 seconds

// Fetch product by slug directly from WooCommerce REST API
async function getProductBySlug(slug) {
  try {
    const response = await wcApi.get("products", {
      slug,
      status: "publish", // Strictly published products only
    });
    return response.data && response.data.length > 0 ? response.data[0] : null;
  } catch (err) {
    console.error("Error fetching product by slug:", err?.message);
    return null;
  }
}

// Fetch related items from the same category
async function getRelatedProducts(categoryId, currentProductId) {
  if (!categoryId) return [];
  try {
    const response = await wcApi.get("products", {
      category: categoryId,
      status: "publish",
      per_page: 4,
    });
    return (response.data || []).filter((p) => p.id !== currentProductId).slice(0, 3);
  } catch (err) {
    console.error("Error fetching related products:", err?.message);
    return [];
  }
}

// Dynamic SEO Metadata from WordPress
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | CrownLeaf",
    };
  }

  const cleanDescription = product.short_description
    ? product.short_description.replace(/<[^>]*>?/gm, "").trim()
    : product.description
    ? product.description.replace(/<[^>]*>?/gm, "").slice(0, 160).trim()
    : "Bespoke corporate gift from CrownLeaf.";

  return {
    title: `${product.name} | CrownLeaf Corporate Gifting`,
    description: cleanDescription,
    openGraph: {
      title: `${product.name} | CrownLeaf Corporate Gifting`,
      description: cleanDescription,
      images: product.images && product.images[0]?.src ? [product.images[0].src] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryCategory = product.categories && product.categories.length > 0 ? product.categories[0] : null;
  const relatedProducts = primaryCategory ? await getRelatedProducts(primaryCategory.id, product.id) : [];
  const isInStock = product.stock_status === "instock";
  const hasDimensions =
    product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8 overflow-x-auto scrollbar-none">
          <ol className="flex items-center gap-2 text-xs text-slate-500 font-medium whitespace-nowrap">
            <li className="flex-shrink-0">
              <Link href="/" className="hover:text-[#003108] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex-shrink-0 text-slate-400">/</li>
            {primaryCategory && (
              <>
                <li className="flex-shrink-0">
                  <span className="text-slate-600 font-semibold">{primaryCategory.name}</span>
                </li>
                <li className="flex-shrink-0 text-slate-400">/</li>
              </>
            )}
            <li
              className="text-[#003108] font-semibold truncate max-w-[140px] sm:max-w-xs md:max-w-md flex-shrink"
              title={product.name}
            >
              {product.name}
            </li>
          </ol>
        </nav>

        {/* 2-Column Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start pb-6 sm:pb-10 lg:pb-16 border-b border-[#E2D9CF]">
          {/* Left Column: Interactive Borderless Studio Gallery */}
          <div>
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right Column: Live WordPress Data */}
          <div className="flex flex-col">
            {/* Category Tag */}
            {primaryCategory && (
              <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#A67D44] mb-2">
                {primaryCategory.name}
              </span>
            )}

            {/* Product Title (Real WordPress Data) */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#003108] tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Header */}
            <div className="mt-4 flex items-baseline gap-3 pb-4 border-b border-[#E2D9CF]">
              <div className="text-2xl sm:text-3xl font-normal text-[#003108] tracking-tight">
                {product.price ? `₹${product.price}` : "Price On Request"}
              </div>
              {product.regular_price && product.regular_price !== product.price && (
                <div className="text-sm line-through text-slate-400 font-light">
                  ₹{product.regular_price}
                </div>
              )}
            </div>

            {/* SKU (Real WordPress Data) */}
            {product.sku && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 bg-stone-50 px-2.5 py-1 rounded border border-[#E2D9CF]">
                  SKU: {product.sku}
                </span>
              </div>
            )}

            {/* Real Short Description from WordPress */}
            {product.short_description && (
              <div
                className="mt-6 text-sm text-slate-600 leading-relaxed font-light"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {/* Real Weight & Dimensions from WordPress */}
            {(product.weight || hasDimensions) && (
              <div className="mt-6 pt-4 border-t border-[#E2D9CF] flex flex-wrap gap-6 text-xs text-slate-600">
                {product.weight && (
                  <div>
                    <span className="font-semibold text-slate-500">Weight: </span>
                    <strong className="text-slate-800 font-medium">{product.weight} kg</strong>
                  </div>
                )}
                {hasDimensions && (
                  <div>
                    <span className="font-semibold text-slate-500">Dimensions: </span>
                    <strong className="text-slate-800 font-medium">
                      {product.dimensions.length} &times; {product.dimensions.width} &times; {product.dimensions.height} cm
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* E-Commerce Interactive Actions (Attributes, Quantity Stepper, Add to Cart, Buy Now) */}
            <div className="mt-6">
              <ProductActions product={product} />
            </div>

            {/* Share Icons */}
            <div className="mt-5 pt-3.5 border-t border-[#E2D9CF]">
              <ShareButtons title={product.name} />
            </div>
          </div>
        </div>

        {/* Real Detailed Description from WordPress (post_content) */}
        {product.description && (
          <section className="py-8 sm:py-12 border-b border-[#E2D9CF]">
            <h2 className="text-xl font-bold text-[#003108] mb-6 tracking-tight">
              Product Overview &amp; Specifications
            </h2>
            <div
              className="prose prose-sm max-w-none text-slate-700 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Related Products from WordPress (Same Category) */}
        {relatedProducts.length > 0 && (
          <section className="py-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#A67D44] block mb-1">
                  More From This Collection
                </span>
                <h2 className="text-2xl font-bold text-[#003108] tracking-tight">
                  Complementary Corporate Gifts
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
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
