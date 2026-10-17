"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "https://crownleaf.co/wp-content/uploads/2026/07/Adshalaa_Logo-4.png";

const COLLECTIONS_LINKS = [
  { label: "Corporate Gifts", href: "https://crownleaf.co/product-category/welcome-kit/" },
  { label: "Bulk Gifting", href: "https://crownleaf.co/bulk-enquiry/" },
  { label: "Vegan Free", href: "https://crownleaf.co/product-category/vegan-free/" },
  { label: "About Us", href: "https://crownleaf.co/about-us/" },
  { label: "Kids Gifting Solution", href: "https://titepo.com/return-gift/", isExternal: true },
  { label: "Bulk Enquiry", href: "https://crownleaf.co/bulk-enquiry/" },
];

const HELP_LINKS = [
  { label: "Privacy Policy", href: "https://crownleaf.co/privacy-policy/" },
  { label: "Refund and Returns Policy", href: "https://crownleaf.co/refund-and-returns-policy/" },
  { label: "Shipping Policy", href: "https://crownleaf.co/shipping-policy/" },
  { label: "Terms & Conditions", href: "https://crownleaf.co/terms-conditions/" },
  { label: "Track Your Order", href: "https://crownleaf.co/track-order/" },
  { label: "Blog", href: "https://crownleaf.co/blog/" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      <footer className="bg-[#FAF7F0] text-[#17472F] border-t border-[#E4DCCF] select-none">
        {/* Main 4-Column Footer Section */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: Brand Info & Contact Details (col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="inline-block group focus:outline-none">
                <Image
                  src={LOGO_SRC}
                  alt="Crownleaf Corporate Gifting"
                  width={180}
                  height={60}
                  className="w-36 sm:w-44 h-auto object-contain -ml-1.5"
                />
              </Link>

              <div className="space-y-2 text-xs sm:text-[13px] text-stone-600 leading-relaxed max-w-sm">
                <p>
                  <strong className="font-semibold text-[#17472F]">Address:</strong>{" "}
                  B, Ground Floor, Andheri East, Mumbai, Maharashtra 400072
                </p>
                <p>
                  <strong className="font-semibold text-[#17472F]">Email:</strong>{" "}
                  <a
                    href="mailto:crownleaf@tzar.co"
                    className="hover:text-[#A67D44] transition-colors underline-offset-2 hover:underline"
                  >
                    crownleaf@tzar.co
                  </a>
                </p>
                <p>
                  <strong className="font-semibold text-[#17472F]">Phone:</strong>{" "}
                  <a
                    href="tel:+917760775875"
                    className="hover:text-[#A67D44] transition-colors"
                  >
                    + 91 7760775875
                  </a>
                </p>
              </div>

              {/* Social Media Outlined Circle Icons */}
              <div className="flex items-center gap-2.5 pt-1">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CrownLeaf on Facebook"
                  className="w-8 h-8 rounded-full border border-[#D1B2B2] flex items-center justify-center text-[#17472F] hover:bg-[#A67D44] hover:text-white hover:border-[#A67D44] transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CrownLeaf on X"
                  className="w-8 h-8 rounded-full border border-[#D1B2B2] flex items-center justify-center text-[#17472F] hover:bg-[#A67D44] hover:text-white hover:border-[#A67D44] transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CrownLeaf on Instagram"
                  className="w-8 h-8 rounded-full border border-[#D1B2B2] flex items-center justify-center text-[#17472F] hover:bg-[#A67D44] hover:text-white hover:border-[#A67D44] transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CrownLeaf on Pinterest"
                  className="w-8 h-8 rounded-full border border-[#D1B2B2] flex items-center justify-center text-[#17472F] hover:bg-[#A67D44] hover:text-white hover:border-[#A67D44] transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.174.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Collections (col-span-2) */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-[#17472F] tracking-tight">
                Collections
              </h3>
              <ul className="space-y-2 text-xs sm:text-[13px]">
                {COLLECTIONS_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      className="text-stone-600 hover:text-[#A67D44] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Help (col-span-2) */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-[#17472F] tracking-tight">
                Help
              </h3>
              <ul className="space-y-2 text-xs sm:text-[13px]">
                {HELP_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-[#A67D44] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Sign Up for Email (col-span-4) */}
            <div className="lg:col-span-4 space-y-3.5">
              <h3 className="font-bold text-sm sm:text-base text-[#17472F] tracking-tight">
                Sign Up for Email
              </h3>
              <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed max-w-sm">
                Sign up to get first dibs on new arrivals, sales, exclusive content, events and more!
              </p>

              {/* Newsletter Subscription Pill */}
              {isSubscribed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 text-center">
                  Thank you for subscribing!
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-stretch rounded-full border border-[#D1B2B2] bg-white overflow-hidden max-w-[340px] sm:max-w-md shadow-xs focus-within:border-[#A67D44] focus-within:ring-2 focus-within:ring-[#A67D44]/20 transition-all"
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 pl-3.5 sm:pl-5 pr-2 py-2 sm:py-2.5 bg-transparent text-xs sm:text-sm text-[#17472F] placeholder:text-stone-400 placeholder:text-xs sm:placeholder:text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#A67D44] hover:bg-[#8E6935] text-white text-[11px] sm:text-xs font-semibold tracking-wide flex items-center justify-center gap-1 transition-colors cursor-pointer select-none active:scale-[0.98]"
                  >
                    <span>Subscribe</span>
                    <span className="text-[10px] sm:text-xs">↗</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Footer / Copyright & Payment Icons */}
        <div className="border-t border-[#E4DCCF] bg-[#FAF7F0]">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
            <div>
              &copy; {new Date().getFullYear()} Crownleaf. All Rights Reserved. | Designed &amp; developed by{" "}
              <a
                href="https://tzar.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#17472F] font-semibold hover:text-[#A67D44] transition-colors"
              >
                Tzar Digital Agency
              </a>
            </div>

            {/* Payment Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Google Pay */}
              <span className="px-2 py-1 bg-white rounded border border-[#E4DCCF] text-[10px] font-bold text-slate-700 shadow-2xs flex items-center gap-1">
                <span className="text-blue-500">G</span> Pay
              </span>

              {/* Paytm */}
              <span className="px-2 py-1 bg-white rounded border border-[#E4DCCF] text-[10px] font-bold text-[#002E6E] shadow-2xs">
                pay<span className="text-[#00B9F1]">tm</span>
              </span>

              {/* RuPay */}
              <span className="px-2 py-1 bg-white rounded border border-[#E4DCCF] text-[10px] font-bold text-[#14532D] shadow-2xs">
                RuPay<span className="text-[#F97316]">❯</span>
              </span>

              {/* VISA */}
              <span className="px-2 py-1 bg-white rounded border border-[#E4DCCF] text-[10px] font-bold tracking-wider text-[#1A1F71] shadow-2xs italic">
                VISA
              </span>

              {/* Mastercard */}
              <span className="px-2 py-1 bg-white rounded border border-[#E4DCCF] text-[10px] font-bold shadow-2xs flex items-center gap-1">
                <span className="inline-flex -space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B]/90" />
                </span>
                <span className="text-slate-700 text-[9px]">mastercard</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/917760775875?text=Hi%20Crownleaf,%20I%20would%20like%20to%20enquire%20about%20corporate%20gifting."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with CrownLeaf"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    </>
  );
}
