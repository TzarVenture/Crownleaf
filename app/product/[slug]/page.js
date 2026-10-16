import { cache, Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";
import ShareButtons from "@/components/ShareButtons";
import Footer from "@/components/Footer";
import { wcApi } from "@/lib/woocommerce";

export const revalidate = 60; // ISR cache revalidation every 60 seconds

// Memoize getProductBySlug per request pass (prevents duplicate API calls between metadata and page render)
const getProductBySlug = cache(async (slug) => {
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
});

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

// Pre-render published products at build time for near-instant navigation (<100ms)
export async function generateStaticParams() {
  try {
    const response = await wcApi.get("products", {
      status: "publish",
      per_page: 20,
    });
    return (response.data || []).map((product) => ({
      slug: product.slug,
    }));
  } catch (err) {
    console.error("Error generating static params for products:", err?.message);
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

// Asynchronously streamed Related Products section (does not block initial page paint)
async function RelatedProductsSection({ categoryId, currentProductId }) {
  const relatedProducts = await getRelatedProducts(categoryId, currentProductId);
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <section className="py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#A47A3C] block mb-1">
            More From This Collection
          </span>
          <h2 className="text-2xl font-bold text-[#17472F] tracking-tight">
            Complementary Corporate Gifts
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {relatedProducts.map((rel) => (
          <ProductCard key={rel.id} product={rel} />
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryCategory = product.categories && product.categories.length > 0 ? product.categories[0] : null;
  const isInStock = product.stock_status === "instock";
  const hasDimensions =
    product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFE6]">
      <Navbar />

      <main className="flex-1 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-8 overflow-x-auto scrollbar-none">
          <ol className="flex items-center gap-2 text-xs text-stone-500 font-medium whitespace-nowrap">
            <li className="flex-shrink-0">
              <Link href="/" className="hover:text-[#17472F] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex-shrink-0 text-stone-400">/</li>
            {primaryCategory && (
              <>
                <li className="flex-shrink-0">
                  <span className="text-stone-600 font-semibold">{primaryCategory.name}</span>
                </li>
                <li className="flex-shrink-0 text-stone-400">/</li>
              </>
            )}
            <li
              className="text-[#17472F] font-semibold truncate max-w-[140px] sm:max-w-xs md:max-w-md flex-shrink"
              title={product.name}
            >
              {product.name}
            </li>
          </ol>
        </nav>

        {/* 2-Column Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-start pb-6 sm:pb-10 lg:pb-16 border-b border-[#E4DCCF]">
          {/* Left Column: Interactive Borderless Studio Gallery */}
          <div>
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right Column: Live WordPress Data */}
          <div className="flex flex-col">
            {/* Category Tag */}
            {primaryCategory && (
              <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#A47A3C] mb-1.5 sm:mb-2">
                {primaryCategory.name}
              </span>
            )}

            {/* Product Title (Real WordPress Data) */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#17472F] tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Header */}
            <div className="mt-3 sm:mt-4 flex items-baseline gap-3 pb-3 sm:pb-4 border-b border-[#E4DCCF]">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#17472F] tracking-tight">
                {product.price ? `₹${product.price}` : "Price On Request"}
              </div>
              {product.regular_price && product.regular_price !== product.price && (
                <div className="text-sm line-through text-stone-400 font-light">
                  ₹{product.regular_price}
                </div>
              )}
            </div>

            {/* SKU (Real WordPress Data) */}
            {product.sku && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-mono text-stone-600 bg-[#FAF7F0] px-2.5 py-1 rounded border border-[#E4DCCF]">
                  SKU: {product.sku}
                </span>
              </div>
            )}

            {/* Real Short Description from WordPress */}
            {product.short_description && (
              <div
                className="mt-6 text-sm text-stone-700 leading-relaxed font-light"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {/* Real Weight & Dimensions from WordPress */}
            {(product.weight || hasDimensions) && (
              <div className="mt-6 pt-4 border-t border-[#E4DCCF] flex flex-wrap gap-6 text-xs text-stone-600">
                {product.weight && (
                  <div>
                    <span className="font-semibold text-stone-500">Weight: </span>
                    <strong className="text-stone-800 font-medium">{product.weight} kg</strong>
                  </div>
                )}
                {hasDimensions && (
                  <div>
                    <span className="font-semibold text-stone-500">Dimensions: </span>
                    <strong className="text-stone-800 font-medium">
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
            <div className="mt-5 pt-3.5 border-t border-[#E4DCCF]">
              <ShareButtons title={product.name} />
            </div>
          </div>
        </div>

        {/* Real Detailed Description from WordPress (post_content) */}
        {product.description && (
          <section className="py-8 sm:py-12 border-b border-[#E4DCCF]">
            <h2 className="text-xl font-bold text-[#17472F] mb-6 tracking-tight">
              Product Overview &amp; Specifications
            </h2>
            <div
              className="prose prose-sm max-w-none text-stone-700 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Related Products from WordPress (Same Category) - Streamed asynchronously */}
        {primaryCategory && (
          <Suspense fallback={null}>
            <RelatedProductsSection
              categoryId={primaryCategory.id}
              currentProductId={product.id}
            />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
