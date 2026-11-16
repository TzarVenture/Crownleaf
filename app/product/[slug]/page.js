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
import { SITE_URL, formatINR } from "@/lib/site";

export const revalidate = 60; // ISR cache revalidation every 60 seconds

// Memoize per request pass (prevents duplicate API calls between metadata and page render).
// A failed WooCommerce request THROWS (so the error page is shown and the last good page stays cached)
// instead of returning null, which would have been cached as a 404 for a minute.
const getProductBySlug = cache(async (slug) => {
  try {
    const response = await wcApi.get("products", {
      slug,
      status: "publish", // Strictly published products only
    });
    return response.data && response.data.length > 0 ? response.data[0] : null;
  } catch (err) {
    console.error("Error fetching product by slug:", err?.message);
    throw new Error("Unable to load this product right now.");
  }
});

// Variations for variable products (colour, etc.). Empty for simple products.
const getVariations = cache(async (product) => {
  if (product.type !== "variable") return [];
  try {
    const response = await wcApi.get(`products/${product.id}/variations`, { per_page: 100 });
    return (response.data || [])
      .filter((v) => v.status === "publish")
      .map((v) => ({
        id: v.id,
        price: v.price,
        regular_price: v.regular_price,
        attributes: (v.attributes || []).map((a) => ({ name: a.name, option: a.option })),
        stock_status: v.stock_status,
        stock_quantity: v.stock_quantity,
        purchasable: v.purchasable,
        image: v.image?.src || null,
      }));
  } catch (err) {
    console.error("Error fetching product variations:", err?.message);
    throw new Error("Unable to load this product right now.");
  }
});

// Fetch related items from the same category
async function getRelatedProducts(categoryId, currentProductId) {
  if (!categoryId) return [];
  try {
    const response = await wcApi.get("products", {
      category: categoryId,
      status: "publish",
      stock_status: "instock", // Strictly in-stock products
      per_page: 4,
    });
    return (response.data || []).filter((p) => p.id !== currentProductId).slice(0, 3);
  } catch (err) {
    console.error("Error fetching related products:", err?.message);
    return [];
  }
}

// Pre-render published products at build time for near-instant navigation
export async function generateStaticParams() {
  try {
    const response = await wcApi.get("products", {
      status: "publish",
      stock_status: "instock", // Strictly in-stock products
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

const stripTags = (html) => (html || "").replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();

// Dynamic SEO metadata from WordPress
export async function generateMetadata({ params }) {
  const { slug } = await params;
  let product = null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    return { title: "CrownLeaf Corporate Gifting" };
  }

  if (!product) {
    return { title: "Product Not Found", robots: { index: false } };
  }

  const description =
    stripTags(product.short_description) ||
    stripTags(product.description).slice(0, 160) ||
    "Bespoke corporate gift from CrownLeaf.";
  const title = `${product.name} | CrownLeaf Corporate Gifting`;
  const image = product.images?.[0]?.src;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/product/${product.slug}`,
      images: image ? [image] : [],
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
          <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#8E6935] block mb-1">
            More From This Collection
          </span>
          <h2 className="text-2xl font-bold text-[#003108] tracking-tight">Complementary Corporate Gifts</h2>
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

  const variations = await getVariations(product);

  const primaryCategory = product.categories && product.categories.length > 0 ? product.categories[0] : null;
  const hasDimensions =
    product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height);

  // Price shown in the header. Variable products show the lowest option price.
  const optionPrices = variations.map((v) => Number.parseFloat(v.price)).filter(Number.isFinite);
  const isVariable = product.type === "variable";
  const priceValue = isVariable && optionPrices.length ? Math.min(...optionPrices) : Number.parseFloat(product.price);
  const hasPrice = Number.isFinite(priceValue) && priceValue > 0 && product.purchasable !== false;
  const hasPriceRange = isVariable && optionPrices.length > 1 && Math.max(...optionPrices) !== Math.min(...optionPrices);

  // Structured data so search engines can show price and availability
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripTags(product.short_description) || stripTags(product.description).slice(0, 300) || undefined,
    image: (product.images || []).map((i) => i.src),
    sku: product.sku || undefined,
    category: primaryCategory?.name,
    url: `${SITE_URL}/product/${product.slug}`,
    brand: { "@type": "Brand", name: "CrownLeaf" },
    ...(hasPrice
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: String(priceValue),
            availability:
              product.stock_status === "instock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${SITE_URL}/product/${product.slug}`,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <script
        type="application/ld+json"
        // Escape "<" so product text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <main id="main-content" className="flex-1 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-8 overflow-x-auto scrollbar-none">
          <ol className="flex items-center gap-2 text-xs text-stone-600 font-medium whitespace-nowrap">
            <li className="flex-shrink-0">
              <Link href="/" className="hover:text-[#003108] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex-shrink-0 text-stone-400">/</li>
            {primaryCategory && (
              <>
                <li className="flex-shrink-0">
                  <Link
                    href={`/products?category=${primaryCategory.slug}`}
                    className="text-stone-600 font-semibold hover:text-[#003108] transition-colors"
                  >
                    {primaryCategory.name}
                  </Link>
                </li>
                <li className="flex-shrink-0 text-stone-400">/</li>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-start pb-6 sm:pb-10 lg:pb-16 border-b border-[#E4DCCF]">
          <div>
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          <div className="flex flex-col">
            {primaryCategory && (
              <span className="text-xs uppercase tracking-[0.16em] font-bold text-[#8E6935] mb-1.5 sm:mb-2">
                {primaryCategory.name}
              </span>
            )}

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003108] tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price header */}
            <div className="mt-3 sm:mt-4 flex items-baseline gap-3 pb-3 sm:pb-4 border-b border-[#E4DCCF]">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#003108] tracking-tight">
                {hasPrice ? (
                  <>
                    {hasPriceRange && <span className="text-sm font-semibold text-stone-500 mr-1.5">From</span>}
                    {formatINR(priceValue)}
                  </>
                ) : (
                  "Available on request"
                )}
              </div>
              {!isVariable && hasPrice && product.regular_price && product.regular_price !== product.price && (
                <div className="text-sm line-through text-stone-500 font-light">{formatINR(product.regular_price)}</div>
              )}
            </div>
            {hasPrice && <p className="mt-1.5 text-[11px] text-stone-500">Prices exclude shipping. Taxes, if applicable, are shown at payment.</p>}

            {product.sku && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-mono text-stone-600 bg-[#FAF7F0] px-2.5 py-1 rounded border border-[#E4DCCF]">
                  SKU: {product.sku}
                </span>
              </div>
            )}

            {product.short_description && (
              <div
                className="mt-6 text-sm text-stone-700 leading-relaxed font-light"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

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

            {/* Options, quantity, add to cart / buy now, or quote request */}
            <div className="mt-6">
              <ProductActions product={product} variations={variations} />
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#E4DCCF]">
              <ShareButtons title={product.name} />
            </div>
          </div>
        </div>

        {/* Detailed description from WordPress (post_content) */}
        {product.description && (
          <section className="py-8 sm:py-12 border-b border-[#E4DCCF]">
            <h2 className="text-xl font-bold text-[#003108] mb-6 tracking-tight">Product Overview &amp; Specifications</h2>
            <div
              className="prose prose-sm max-w-none text-stone-700 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Related products (same category), streamed asynchronously */}
        {primaryCategory && (
          <Suspense fallback={null}>
            <RelatedProductsSection categoryId={primaryCategory.id} currentProductId={product.id} />
          </Suspense>
        )}
      </main>

      <Footer />
    </div>
  );
}
