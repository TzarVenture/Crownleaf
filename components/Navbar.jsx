"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#003108] text-white text-xs py-2 px-4 border-b border-black/10">
        <div className="max-w-[1300px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wider uppercase text-[11px] text-[#A67D44]">
              Corporate Service:
            </span>
            <span className="text-white/90">Bulk &amp; Custom Gifting Across India: +91 7760775875</span>
          </div>
          <div className="text-white/80 tracking-wide">
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

      {/* Main Navigation Bar */}
      <nav className="bg-[#EFE8E0] border-b border-[#D1B2B2] relative">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex flex-col group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-[0.12em] text-[#003108] leading-none">
              CROWNLEAF
            </span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#A67D44] font-semibold mt-1">
              Corporate Gifting
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#003108]">
            <Link
              href="#inventory"
              className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
            >
              Corporate Gifts
            </Link>
            <Link
              href="#categories"
              className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
            >
              Collections
            </Link>
            <Link
              href="#about"
              className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
            >
              About Us
            </Link>
            <Link
              href="#enquiry"
              className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
            >
              Bulk Enquiry
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="#enquiry"
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white hover:bg-[#8E6935] transition-all shadow-xs"
            >
              Request Quote
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-3">
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#EFE8E0] border-t border-[#D1B2B2] px-4 pt-3 pb-6 space-y-3">
            <Link
              href="#inventory"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2 border-b border-[#D1B2B2]/40"
            >
              Corporate Gifts
            </Link>
            <Link
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2 border-b border-[#D1B2B2]/40"
            >
              Collections
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2 border-b border-[#D1B2B2]/40"
            >
              About Us
            </Link>
            <Link
              href="#enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-[#003108] py-2 border-b border-[#D1B2B2]/40"
            >
              Bulk Enquiry
            </Link>
            <div className="pt-2">
              <a
                href="#enquiry"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white"
              >
                Request Quote
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
