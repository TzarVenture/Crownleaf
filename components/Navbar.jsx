"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import SearchModal from "@/components/SearchModal";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { cart, openCart } = useCart();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dynamically set --navbar-height CSS variable on root for exact sticky offsets
  useEffect(() => {
    const updateNavHeight = () => {
      const header = document.getElementById("site-header");
      if (header) {
        document.documentElement.style.setProperty("--navbar-height", `${header.offsetHeight}px`);
      }
    };
    updateNavHeight();
    window.addEventListener("resize", updateNavHeight);
    return () => window.removeEventListener("resize", updateNavHeight);
  }, []);

  return (
    <>
      <header id="site-header" className="sticky top-0 z-40 w-full shadow-xs bg-[#EFE8E0]">
        {/* 1. Top Announcement Bar */}
        <div className="bg-[#003108] text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-4 border-b border-black/10 select-none">
          <div className="max-w-[1300px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wider uppercase text-[10.5px] sm:text-[11px] text-[#A67D44]">
                Corporate Service:
              </span>
              <span className="text-white/90">Bulk &amp; Custom Gifting Across India: +91 7760775875</span>
            </div>
            <div className="text-white/80 tracking-wide hidden sm:block">
              Direct Inquiries:{" "}
              <a href="tel:+917304056607" className="underline hover:text-white transition-colors">
                +91 7304056607
              </a>{" "}
              |{" "}
              <a href="tel:+919004250252" className="underline hover:text-white transition-colors">
                +91 9004250252
              </a>
            </div>
          </div>
        </div>

        {/* 2. Main Navigation Bar */}
        <nav className="border-b border-[#D1B2B2] relative bg-[#EFE8E0]">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center group focus:outline-none">
                <Image
                  src="/images/logo.png"
                  alt="Crown Leaf - Corporate Gifting"
                  width={180}
                  height={55}
                  priority
                  className="w-32 sm:w-40 md:w-44 h-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#003108]">
              <Link
                href="/products"
                className={`hover:text-[#A67D44] transition-colors py-2 border-b-2 ${
                  pathname === "/products" ? "border-[#A67D44] text-[#A67D44]" : "border-transparent"
                }`}
              >
                Corporate Gifts
              </Link>
              <Link
                href="/products"
                className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
              >
                Collections
              </Link>
              <Link
                href="/#about"
                className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
              >
                About Us
              </Link>
              <Link
                href="/#enquiry"
                className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
              >
                Bulk Enquiry
              </Link>
            </div>

            {/* Right: Desktop Action CTAs (Search, Cart, Quote) */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Search Trigger Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2.5 rounded-full border border-[#D1B2B2] bg-white/70 hover:bg-white text-[#003108] hover:text-[#A67D44] transition-all flex items-center justify-center shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[#A67D44]/30"
                aria-label="Search products (Ctrl+K)"
                title="Search products (Ctrl+K)"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 rounded-full border border-[#D1B2B2] bg-white/70 hover:bg-white text-[#003108] hover:text-[#A67D44] transition-all flex items-center justify-center shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[#A67D44]/30"
                aria-label={`Open shopping cart with ${cart.itemsCount} items`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cart.itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#003108] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#EFE8E0] shadow-xs">
                    {cart.itemsCount}
                  </span>
                )}
              </button>

              {/* Request Quote CTA */}
              <a
                href="/#enquiry"
                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white hover:bg-[#8E6935] transition-all shadow-xs"
              >
                Request Quote
              </a>
            </div>

            {/* Mobile Actions: Search + Cart + Hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2 rounded-full border border-[#D1B2B2] bg-white/80 text-[#003108] transition-colors flex items-center justify-center shadow-2xs"
                aria-label="Search products"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile Cart Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 rounded-full border border-[#D1B2B2] bg-white/80 text-[#003108] transition-colors flex items-center justify-center shadow-2xs"
                aria-label={`Open shopping cart with ${cart.itemsCount} items`}
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cart.itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#003108] text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#EFE8E0]">
                    {cart.itemsCount}
                  </span>
                )}
              </button>

              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#003108] focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 3. Mobile Slide-down Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-[#FAF8F5] border-t border-[#D1B2B2] px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
              {/* Mobile Search Bar Quick Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#E4DCCF] text-stone-500 text-xs text-left"
              >
                <svg className="w-4 h-4 text-[#A67D44]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search products, categories...</span>
              </button>

              <div className="pt-2 divide-y divide-[#D1B2B2]/30">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2.5"
                >
                  Corporate Gifts
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2.5"
                >
                  Collections
                </Link>
                <Link
                  href="/#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2.5"
                >
                  About Us
                </Link>
                <Link
                  href="/#enquiry"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2.5"
                >
                  Bulk Enquiry
                </Link>
              </div>

              {/* Direct Inquiries phone in mobile drawer */}
              <div className="pt-2 text-[11px] text-stone-600 space-y-1">
                <div>Direct Call: <a href="tel:+917760775875" className="font-semibold text-[#003108] underline">+91 7760775875</a></div>
                <div>WhatsApp: <a href="https://wa.me/917760775875" className="font-semibold text-[#003108] underline">+91 7760775875</a></div>
              </div>

              {/* Request Quote Button */}
              <div className="pt-2">
                <a
                  href="/#enquiry"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white hover:bg-[#8E6935] shadow-xs"
                >
                  Request Quote
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* 4. Global Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
