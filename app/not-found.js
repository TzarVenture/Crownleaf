import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8E6935]">Error 404</span>
          <h1 className="mt-2 text-3xl font-bold text-[#003108] tracking-tight">We could not find that page</h1>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            The page may have moved, or the product may no longer be available. Browse our corporate gifts or go back to the
            home page.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="px-6 py-3 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Browse Corporate Gifts
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white border border-[#003108] text-[#003108] hover:bg-[#003108] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
