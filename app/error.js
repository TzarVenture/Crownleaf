"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// Shown when a page fails while rendering, for example when WooCommerce cannot be reached.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md text-center" role="alert">
          <h1 className="text-3xl font-bold text-[#003108] tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            We could not load this page right now. Please try again in a moment. If it keeps happening, message us on
            WhatsApp and we will help you place your order.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-3 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white border border-[#003108] text-[#003108] hover:bg-[#003108] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
