"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

// Official CrownLeaf logo
const LOGO_SRC = "https://crownleaf.co/wp-content/uploads/2026/07/Adshalaa_Logo-4.png";

// Navigation items matching https://crownleaf.co/
const NAV_ITEMS = [
  {
    label: "Corporate Gifts",
    href: "#inventory",
    hasDropdown: true,
    subItems: [
      { label: "Executive Welcome Kits", href: "#inventory" },
      { label: "Luxury Gift Hampers", href: "#inventory" },
      { label: "Drinkware & Desk Essentials", href: "#inventory" },
      { label: "Tech & Accessories", href: "#inventory" },
    ],
  },
  { label: "Bulk Gifting", href: "#inventory", hasDropdown: false },
  { label: "Vegan Free", href: "#inventory", hasDropdown: false },
  { label: "About Us", href: "#about", hasDropdown: false },
  {
    label: "Kids Gifting Solution",
    href: "https://titepo.com/return-gift/",
    isExternal: true,
    hasDropdown: false,
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const pathname = usePathname();
  const { cart, openCart } = useCart();

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
      <header className="sticky top-0 z-40 w-full select-none shadow-xs">


        {/* Tier 2: Main Navigation Bar (Matching https://crownleaf.co/ Theme) */}
        <nav
          className="bg-[#EFE8E0] border-b border-[#D1B2B2] w-full"
          aria-label="Main Navigation"
        >
          <div className="max-w-[1300px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
            {/* Mobile / Tablet: Hamburger Toggle (Left-aligned) */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 -ml-1 text-[#003108] hover:text-[#A67D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A67D44] rounded-md transition-colors cursor-pointer"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            {/* Brand Logo: Official Crownleaf Image (Responsive for mobile & desktop) */}
            <div className="flex shrink-0 items-center">
              <Link
                href="/"
                className="flex items-center group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A67D44] rounded-xs"
              >
                <Image
                  src={LOGO_SRC}
                  alt="CrownLeaf Corporate Gifting"
                  width={216}
                  height={108}
                  priority
                  className="w-28 xs:w-36 sm:w-44 md:w-48 lg:w-[210px] h-auto object-contain -my-2 sm:-my-4"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#003108]">
              {/* Corporate Gifts (with dropdown) */}
              <div className="relative group/menu">
                <Link
                  href="#inventory"
                  className="flex items-center gap-1 hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
                >
                  <span>Corporate Gifts</span>
                  <svg
                    className="w-3.5 h-3.5 text-[#003108] group-hover/menu:text-[#A67D44] transition-transform duration-200 group-hover/menu:translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 pt-2 w-56 opacity-0 translate-y-1 invisible group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:visible transition-all duration-200 z-50">
                  <div className="bg-[#FAF8F5] border border-[#D1B2B2] shadow-lg rounded-sm py-2">
                    <Link
                      href="#inventory"
                      className="block px-4 py-2 text-xs font-semibold text-[#003108] hover:bg-[#EFE8E0] hover:text-[#A67D44] transition-colors"
                    >
                      Executive Welcome Kits
                    </Link>
                    <Link
                      href="#inventory"
                      className="block px-4 py-2 text-xs font-semibold text-[#003108] hover:bg-[#EFE8E0] hover:text-[#A67D44] transition-colors"
                    >
                      Luxury Gift Hampers
                    </Link>
                    <Link
                      href="#inventory"
                      className="block px-4 py-2 text-xs font-semibold text-[#003108] hover:bg-[#EFE8E0] hover:text-[#A67D44] transition-colors"
                    >
                      Drinkware &amp; Desk Essentials
                    </Link>
                    <Link
                      href="#inventory"
                      className="block px-4 py-2 text-xs font-semibold text-[#003108] hover:bg-[#EFE8E0] hover:text-[#A67D44] transition-colors"
                    >
                      Tech &amp; Accessories
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="#inventory"
                className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
              >
                Bulk Gifting
              </Link>

              <Link
                href="#inventory"
                className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
              >
                Vegan Free
              </Link>

              <Link
                href="#about"
                className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
              >
                About Us
              </Link>

              <a
                href="https://titepo.com/return-gift/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#A67D44] transition-colors py-2 border-b-2 border-transparent hover:border-[#A67D44]"
              >
                Kids Gifting Solution
              </a>
            </div>

            {/* Right Column: BULK ENQUIRY Button & Utility Icons */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
              {/* Solid Crown Gold "BULK ENQUIRY" Button - Responsive padding & compact on mobile */}
              <a
                href="#enquiry"
                className="hidden xs:inline-flex items-center px-3 sm:px-5 py-1.5 sm:py-2.5 bg-[#A67D44] hover:bg-[#8E6935] text-white text-[10.5px] sm:text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs whitespace-nowrap"
              >
                Bulk Enquiry
              </a>

              {/* Utility Icons (Search, User, Wishlist, Cart) */}
              <div className="flex items-center gap-2 sm:gap-3 text-[#003108]">
                {/* Search Icon */}
                <button
                  type="button"
                  aria-label="Search"
                  className="p-1.5 hover:text-[#A67D44] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Account / User Icon (Desktop/Tablet) */}
                <button
                  type="button"
                  aria-label="Account"
                  className="hidden sm:block p-1.5 hover:text-[#A67D44] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* Wishlist Heart Icon with "0" Badge */}
                <button
                  type="button"
                  aria-label="Wishlist"
                  className="relative p-1.5 hover:text-[#A67D44] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#CC0000] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    0
                  </span>
                </button>

                {/* Shopping Bag / Cart Icon with Live Badge */}
                <button
                  type="button"
                  onClick={openCart}
                  aria-label={`Shopping Cart with ${cart.itemsCount} items`}
                  className="relative p-1.5 hover:text-[#A67D44] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cart.itemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#17472F] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {cart.itemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Tier 1: Top Announcement Bar - Sleek Single-Line Responsive Layout */}
        <div className="bg-[#003108] text-white text-[10.5px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-black/10">
          <div className="max-w-[1300px] mx-auto flex flex-row justify-between items-center gap-2">
            {/* Left: We do Bulk & Corporate Gifting */}
            <div className="flex items-center gap-1.5 text-[10px] xs:text-[11px] sm:text-xs truncate">
              <span className="text-[#A67D44] font-medium hidden sm:inline">
                We do Bulk &amp; Corporate Gifting:
              </span>
              <a
                href="tel:+917760775875"
                className="text-white font-medium hover:text-[#A67D44] transition-colors whitespace-nowrap"
              >
                +91 7760775875
              </a>
            </div>

            {/* Right: Direct Inquiries */}
            <div className="text-[10px] xs:text-[10.5px] sm:text-xs text-white/80 tracking-wide flex items-center justify-end gap-1.5 whitespace-nowrap">
              <span className="text-[#A67D44] font-medium hidden sm:inline">Direct Inquiries:</span>
              <a
                href="tel:+917304056607"
                className="hover:text-white transition-colors"
              >
                +91 7304056607
              </a>
              <span className="text-white/40 hidden xs:inline">|</span>
              <a
                href="tel:+919004250252"
                className="hover:text-white transition-colors hidden xs:inline"
              >
                +91 9004250252
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. Independent Viewport Overlay & LEFT-SIDE Slide-out Drawer              */}
      {/* ========================================================================= */}

      {/* Full-screen Dark Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden ${mobileMenuOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileMenuOpen(false)}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Left Slide-out Drawer Panel matching #EFE8E0 theme */}
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        style={{ backgroundColor: "#EFE8E0" }}
        className={`fixed inset-y-0 left-0 z-[9999] w-[310px] sm:w-[360px] max-w-[85vw] bg-[#EFE8E0] shadow-2xl flex flex-col justify-between border-r border-[#D1B2B2] transition-transform duration-300 ease-out lg:hidden overscroll-contain ${mobileMenuOpen
          ? "translate-x-0 pointer-events-auto"
          : "-translate-x-full pointer-events-none"
          }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Top Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#EFE8E0]" style={{ backgroundColor: "#EFE8E0" }}>
          {/* Drawer Header with Crownleaf Logo and Close Icon */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#D1B2B2] bg-[#EFE8E0] sticky top-0 z-10" style={{ backgroundColor: "#EFE8E0" }}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center select-none focus:outline-none"
            >
              <Image
                src={LOGO_SRC}
                alt="CrownLeaf Corporate Gifting"
                width={180}
                height={90}
                className="w-36 sm:w-40 h-auto object-contain -my-2.5"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#003108] hover:text-[#A67D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A67D44] rounded-md transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-6 py-4 space-y-1 bg-[#EFE8E0]" style={{ backgroundColor: "#EFE8E0" }}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#003108] hover:text-[#A67D44] border-b border-[#D1B2B2]/60 transition-colors"
            >
              <span>Home</span>
            </Link>

            {NAV_ITEMS.map((item) => {
              const isExpanded = expandedCategories[item.label];
              const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              if (item.hasDropdown) {
                return (
                  <div key={`drawer-cat-${item.label}`} className="border-b border-[#D1B2B2]/60">
                    <button
                      type="button"
                      onClick={() => toggleCategory(item.label)}
                      className="w-full flex items-center justify-between py-3.5 text-sm font-semibold uppercase tracking-wider text-[#003108] hover:text-[#A67D44] transition-colors focus:outline-none cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? "bg-[#A67D44]" : "bg-transparent"
                            }`}
                        />
                        <span>{item.label}</span>
                      </span>
                      <svg
                        className={`w-4 h-4 text-[#A67D44] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
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
                      <div className="pl-6 pb-3 space-y-2 border-l-2 border-[#A67D44]/40 ml-2 mb-2 bg-[#EFE8E0]">
                        {item.subItems.map((sub) => (
                          <Link
                            key={`drawer-sub-${sub.label}`}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1.5 text-xs text-[#003108]/85 hover:text-[#A67D44] font-medium transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.isExternal) {
                return (
                  <a
                    key={`drawer-ext-${item.label}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3.5 text-sm font-semibold uppercase tracking-wider text-[#003108] hover:text-[#A67D44] border-b border-[#D1B2B2]/60 transition-colors"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-[#A67D44] tracking-wider uppercase font-semibold">
                      ↗
                    </span>
                  </a>
                );
              }

              return (
                <Link
                  key={`drawer-link-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#003108] hover:text-[#A67D44] border-b border-[#D1B2B2]/60 transition-colors"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? "bg-[#A67D44]" : "bg-transparent"
                      }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer Area: BULK ENQUIRY Button & Direct Inquiries */}
        <div className="p-6 bg-[#EFE8E0] border-t border-[#D1B2B2] space-y-4" style={{ backgroundColor: "#EFE8E0" }}>
          {/* Solid Crown Gold "BULK ENQUIRY" Button */}
          <a
            href="#enquiry"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center w-full px-5 py-3 rounded-xs text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white hover:bg-[#8E6935] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003108] transition-colors shadow-xs"
          >
            Bulk Enquiry
          </a>

          {/* Contact Details Matching Top Bar */}
          <div className="pt-2 text-center space-y-2 border-t border-[#D1B2B2]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A67D44] block mb-0.5">
                We do Bulk &amp; Corporate Gifting
              </span>
              <a
                href="tel:+917760775875"
                className="text-xs font-semibold text-[#003108] hover:text-[#A67D44] transition-colors"
              >
                +91 7760775875
              </a>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A67D44] block mb-0.5">
                Direct Inquiries
              </span>
              <div className="flex items-center justify-center gap-2 text-xs text-[#003108] font-medium">
                <a href="tel:+917304056607" className="hover:text-[#A67D44] transition-colors">
                  +91 7304056607
                </a>
                <span className="text-[#A67D44]/50">|</span>
                <a href="tel:+919004250252" className="hover:text-[#A67D44] transition-colors">
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
