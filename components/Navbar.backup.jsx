"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Desktop Navigation Links (Unchanged)
const DESKTOP_NAV_ITEMS = [
  { label: "Corporate Gifts", href: "#inventory", hasDropdown: false },
  { label: "Collections", href: "#inventory", hasDropdown: true },
  { label: "Our Services", href: "#enquiry", hasDropdown: true },
  { label: "About Us", href: "#about", hasDropdown: false },
];

// Mobile Drawer Navigation Links (With Home and Expandable Categories)
const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", hasDropdown: false },
  { label: "Corporate Gifts", href: "#inventory", hasDropdown: false },
  {
    label: "Collections",
    href: "#inventory",
    hasDropdown: true,
    subItems: [
      { label: "Luxury Gift Hampers", href: "#inventory" },
      { label: "Executive Welcome Kits", href: "#inventory" },
      { label: "Eco-Friendly & Sustainable", href: "#inventory" },
      { label: "Drinkware & Desk Essentials", href: "#inventory" },
    ],
  },
  {
    label: "Our Services",
    href: "#enquiry",
    hasDropdown: true,
    subItems: [
      { label: "Bulk Corporate Gifting", href: "#enquiry" },
      { label: "Custom Logo Branding", href: "#enquiry" },
      { label: "Pan-India White-Glove Dispatch", href: "#enquiry" },
    ],
  },
  { label: "About Us", href: "#about", hasDropdown: false },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const pathname = usePathname();

  // Toggle category expansion inside drawer
  const toggleCategory = (label) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Ensure body scrollbar remains intact and never disappears
  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Sticky Main Header Wrapper */}
      <header className="sticky top-0 z-40 w-full select-none">
        <div className="w-full pt-2 sm:pt-2.5 pb-2 px-3 sm:px-6 bg-[#F4EFE6]/95 backdrop-blur-md transition-colors">
          <div className="max-w-[1280px] mx-auto space-y-2">

            {/* 1. Main Navigation Floating Pill (Soft Ivory Surface: #FAF7F0) */}
            <nav
              className="bg-[#FAF7F0] border border-[#E4DCCF] rounded-full shadow-xs px-3.5 sm:px-7 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-6 relative"
              aria-label="Main Navigation"
            >

              {/* Mobile / Tablet: Hamburger Button (Left-aligned) */}
              <div className="flex lg:hidden flex-1 items-center justify-start min-w-[36px]">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 -ml-1 text-[#17472F] hover:text-[#A47A3C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] rounded-md transition-colors cursor-pointer"
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation-drawer"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    viewBox="0 0 24 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M0 1.5C0 0.671573 0.671573 0 1.5 0H22.5C23.3284 0 24 0.671573 24 1.5C24 2.32843 23.3284 3 22.5 3H1.5C0.671573 3 0 2.32843 0 1.5ZM0 8C0 7.17157 0.671573 6.5 1.5 6.5H22.5C23.3284 6.5 24 7.17157 24 8C24 8.82843 23.3284 9.5 22.5 9.5H1.5C0.671573 9.5 0 8.82843 0 8ZM0 14.5C0 13.6716 0.671573 13 1.5 13H15C15.8284 13 16.5 13.6716 16.5 14.5C16.5 15.3284 15.8284 16 15 16H1.5C0.671573 16 0 15.3284 0 14.5Z" />
                  </svg>
                </button>
              </div>

              {/* Centre Column: Brand Logo (Centered on mobile/tablet; Left-aligned on lg desktop) */}
              <div className="flex shrink-0 items-center justify-center lg:justify-start">
                <Link
                  href="/"
                  className="flex flex-col group text-center lg:text-left select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] rounded-sm"
                >
                  <span className="text-base sm:text-xl lg:text-2xl font-bold tracking-[0.18em] sm:tracking-[0.2em] text-[#17472F] leading-none whitespace-nowrap">
                    CROWNLEAF
                  </span>
                  <span className="text-[7px] sm:text-[9px] tracking-[0.24em] sm:tracking-[0.28em] uppercase text-[#A47A3C] font-semibold mt-0.5 sm:mt-1 whitespace-nowrap">
                    Corporate Gifting
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation Links (Unchanged Desktop Layout) */}
              <div className="hidden lg:flex items-center gap-7 xl:gap-8 text-[14px] font-medium text-[#17472F]">
                {DESKTOP_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-1.5 hover:text-[#A47A3C] transition-colors py-1 whitespace-nowrap group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A47A3C]"
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                  <svg
                    className="w-3.5 h-3.5 text-[#A47A3C] transition-transform duration-200 group-hover:translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                    )}
                  </Link>
                ))}
              </div>

              {/* Right Action Column: "Request a Quote" Button (#17472F with #FFFFFF text) */}
              <div className="flex flex-1 lg:flex-initial items-center justify-end min-w-[36px]">
                <a
                  href="#enquiry"
                  className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-[13.5px] font-semibold sm:font-medium tracking-normal bg-[#17472F] text-[#FFFFFF] hover:bg-[#123825] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] transition-colors shadow-xs whitespace-nowrap"
                >
                  <span className="inline sm:hidden">Quote</span>
                  <span className="hidden sm:inline">Request a Quote</span>
                </a>
              </div>
            </nav>

            {/* 2. Sub-Bar Floating Pill (Primary Brand Forest Green: #17472F) */}
            <div className="bg-[#17472F] text-[#FFFFFF] rounded-full px-4 sm:px-8 py-2 sm:py-2.5 flex flex-col md:flex-row items-center justify-between gap-1 sm:gap-4 select-none shadow-xs text-center md:text-left">

              {/* Left: Bulk Custom Gifting Across India: +91 7760775875 */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-[10.5px] sm:text-xs">
                <span className="font-semibold tracking-wider uppercase text-[#A47A3C]">
                  Bulk Custom Gifting Across India:
                </span>
                <a
                  href="tel:+917760775875"
                  className="text-[#FFFFFF] hover:text-[#A47A3C] transition-colors whitespace-nowrap font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A47A3C]"
                >
                  +91 7760775875
                </a>
              </div>

              {/* Right: Direct Inquiries: +91 7304056607 | +91 9004250252 */}
              <div className="text-[10px] sm:text-xs text-white/90 tracking-wide flex items-center justify-center gap-1.5">
                <span className="text-[#A47A3C] font-semibold tracking-wider">Direct Inquiries:</span>
                <a
                  href="tel:+917304056607"
                  className="text-[#FFFFFF] hover:text-[#A47A3C] transition-colors whitespace-nowrap font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A47A3C]"
                >
                  +91 7304056607
                </a>
                <span className="text-[#A47A3C]/50">|</span>
                <a
                  href="tel:+919004250252"
                  className="text-[#FFFFFF] hover:text-[#A47A3C] transition-colors whitespace-nowrap font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A47A3C]"
                >
                  +91 9004250252
                </a>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. Independent Viewport Overlay & LEFT-SIDE Slide-out Drawer              */}
      {/* ========================================================================= */}

      {/* Full-screen Dark Backdrop (Z-index 9998 ensures complete isolation) */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Left Slide-out Drawer Panel (Fully opaque #FAF7F0 surface at Z-index 9999) */}
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        style={{ backgroundColor: "#FAF7F0" }}
        className={`fixed inset-y-0 left-0 z-[9999] w-[310px] sm:w-[360px] max-w-[85vw] bg-[#FAF7F0] shadow-2xl flex flex-col justify-between border-r border-[#E4DCCF] transition-transform duration-300 ease-out lg:hidden overscroll-contain ${
          mobileMenuOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Top Scrollable Navigation Area with Solid Opaque Background */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#FAF7F0]" style={{ backgroundColor: "#FAF7F0" }}>

          {/* Drawer Header with Crownleaf Logo and Upper-Right Close Icon */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4DCCF] bg-[#FAF7F0] sticky top-0 z-10" style={{ backgroundColor: "#FAF7F0" }}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col select-none focus:outline-none"
            >
              <span className="text-lg font-bold tracking-[0.2em] text-[#17472F] leading-none">
                CROWNLEAF
              </span>
              <span className="text-[8px] tracking-[0.26em] uppercase text-[#A47A3C] font-semibold mt-1">
                Corporate Gifting
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#17472F] hover:text-[#A47A3C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] rounded-md transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Generously Spaced Navigation Links */}
          <nav className="px-6 py-4 space-y-1 bg-[#FAF7F0]" style={{ backgroundColor: "#FAF7F0" }}>
            {MOBILE_NAV_ITEMS.map((item) => {
              const isExpanded = expandedCategories[item.label];
              const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              if (item.hasDropdown) {
                return (
                  <div key={`drawer-cat-${item.label}`} className="border-b border-[#E4DCCF]">
                    <button
                      type="button"
                      onClick={() => toggleCategory(item.label)}
                      className="w-full flex items-center justify-between py-3.5 text-sm font-medium text-[#17472F] hover:text-[#A47A3C] transition-colors focus:outline-none cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            isActive ? "bg-[#A47A3C]" : "bg-transparent"
                          }`}
                        />
                        <span className={isActive ? "font-semibold text-[#17472F]" : ""}>{item.label}</span>
                      </span>
                      <svg
                        className={`w-4 h-4 text-[#A47A3C] transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expandable Sub-Categories */}
                    {isExpanded && item.subItems && (
                      <div className="pl-6 pb-3 space-y-2 border-l-2 border-[#A47A3C]/40 ml-2 mb-2 bg-[#FAF7F0]">
                        {item.subItems.map((sub) => (
                          <Link
                            key={`drawer-sub-${sub.label}`}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1.5 text-xs text-[#17472F]/85 hover:text-[#A47A3C] transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={`drawer-link-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-3.5 text-sm font-medium text-[#17472F] hover:text-[#A47A3C] border-b border-[#E4DCCF] transition-colors"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isActive ? "bg-[#A47A3C]" : "bg-transparent"
                    }`}
                  />
                  <span className={isActive ? "font-semibold text-[#17472F]" : ""}>{item.label}</span>
                </Link>
              );
            })}

            {/* Kids Gifting Solution Link (External) */}
            <a
              href="https://titepo.com/return-gift/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3.5 text-sm font-medium text-[#17472F] hover:text-[#A47A3C] border-b border-[#E4DCCF] transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                <span>Kids Gifting Solution</span>
              </span>
              <span className="text-[10px] text-[#A47A3C] tracking-wider uppercase font-semibold">
                External ↗
              </span>
            </a>
          </nav>
        </div>

        {/* Drawer Footer Area: Full-width CTA & Direct Inquiries */}
        <div className="p-6 bg-[#FAF7F0] border-t border-[#E4DCCF] space-y-4" style={{ backgroundColor: "#FAF7F0" }}>

          {/* Full-width Forest-Green "Request a Quote" Button */}
          <a
            href="#enquiry"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center w-full px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#17472F] text-[#FFFFFF] hover:bg-[#123825] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A47A3C] transition-colors shadow-xs"
          >
            Request a Quote
          </a>

          {/* Contact Details Matching Desktop Sub-Bar */}
          <div className="pt-2 text-center space-y-2 border-t border-[#E4DCCF]/60">
            <div>
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#A47A3C] block mb-0.5">
                Bulk Custom Gifting Across India
              </span>
              <a
                href="tel:+917760775875"
                className="text-xs font-semibold text-[#17472F] hover:text-[#A47A3C] transition-colors"
              >
                +91 7760775875
              </a>
            </div>
            <div>
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#A47A3C] block mb-0.5">
                Direct Inquiries
              </span>
              <div className="flex items-center justify-center gap-2 text-xs text-[#17472F] font-medium">
                <a href="tel:+917304056607" className="hover:text-[#A47A3C] transition-colors">
                  +91 7304056607
                </a>
                <span className="text-[#A47A3C]/50">|</span>
                <a href="tel:+919004250252" className="hover:text-[#A47A3C] transition-colors">
                  +91 9004250252
                </a>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}


