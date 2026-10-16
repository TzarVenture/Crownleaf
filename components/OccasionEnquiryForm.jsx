"use client";

import { useState } from "react";
import Image from "next/image";

export default function OccasionEnquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    budget: "",
    quantity: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(
          data.message || "Unable to send enquiry. Please check your inputs and try again."
        );
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage(
        "Network connection error. Please try again or email us directly at crownleaf@tzar.co."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="enquiry"
      aria-label="Enquiry Form for Every Occasion"
      className="relative w-full min-h-[410px] xs:min-h-[430px] sm:min-h-[470px] md:min-h-[500px] flex items-center overflow-hidden border-t border-[#E4DCCF]"
    >
      {/* 1. High-Res Background Image Showcase - Locked Constant Position */}
      <Image
        src="https://crownleaf.co/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-08-at-1.16.06-PM.jpeg"
        alt="CrownLeaf Luxury Gift Hampers & Premium Business Gifting for Every Occasion"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center select-none"
      />

      {/* 2. Ambient Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20 lg:from-black/60 lg:via-black/20 lg:to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* 3. Section Container */}
      <div className="relative z-10 max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9">
        <div className="max-w-[390px] sm:max-w-[420px]">
          {/* Top Title */}
          <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight mb-2.5 sm:mb-3">
            We Have Gifts For Every Occasion
          </h2>

          {/* Form Card - Constant Min-Height prevents any background shifting */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3.5 sm:p-4.5 border border-[#E4DCCF] min-h-[305px] sm:min-h-[325px] flex flex-col justify-center">
            {isSubmitted ? (
              <div className="my-auto py-4 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#17472F]/10 text-[#17472F] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#17472F]">Thank You for Your Enquiry</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      company: "",
                      budget: "",
                      quantity: "",
                      consent: false,
                    });
                  }}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white hover:bg-[#8E6935] transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2 my-auto">
                {/* Row 1: Name & Email in 2 columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="occasion-name" className="block text-[10px] sm:text-[11px] font-semibold text-[#17472F] mb-0.5">
                      Name <span className="text-[#A67D44]">*</span>
                    </label>
                    <input
                      id="occasion-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-[#D1B2B2]/70 focus:border-[#A67D44] focus:ring-1 focus:ring-[#A67D44]/30 text-xs text-[#17472F] bg-white placeholder:text-stone-400 placeholder:text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="occasion-email" className="block text-[10px] sm:text-[11px] font-semibold text-[#17472F] mb-0.5">
                      Email <span className="text-[#A67D44]">*</span>
                    </label>
                    <input
                      id="occasion-email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-[#D1B2B2]/70 focus:border-[#A67D44] focus:ring-1 focus:ring-[#A67D44]/30 text-xs text-[#17472F] bg-white placeholder:text-stone-400 placeholder:text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Company in 2 columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="occasion-phone" className="block text-[10px] sm:text-[11px] font-semibold text-[#17472F] mb-0.5">
                      Phone Number
                    </label>
                    <input
                      id="occasion-phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-[#D1B2B2]/70 focus:border-[#A67D44] focus:ring-1 focus:ring-[#A67D44]/30 text-xs text-[#17472F] bg-white placeholder:text-stone-400 placeholder:text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="occasion-company" className="block text-[10px] sm:text-[11px] font-semibold text-[#17472F] mb-0.5">
                      Company
                    </label>
                    <input
                      id="occasion-company"
                      name="company"
                      type="text"
                      placeholder="Company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-[#D1B2B2]/70 focus:border-[#A67D44] focus:ring-1 focus:ring-[#A67D44]/30 text-xs text-[#17472F] bg-white placeholder:text-stone-400 placeholder:text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row 3: Approx. Budget & No. of Gifts in 2 columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="occasion-budget" className="block text-[10px] sm:text-[11px] font-semibold text-[#17472F] mb-0.5 truncate" title="Approx. Budget (per Hamper)">
                      Budget / Hamper
                    </label>
                    <input
                      id="occasion-budget"
                      name="budget"
                      type="text"
                      placeholder="e.g. ₹1000"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-[#D1B2B2]/70 focus:border-[#A67D44] focus:ring-1 focus:ring-[#A67D44]/30 text-xs text-[#17472F] bg-white placeholder:text-stone-400 placeholder:text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="occasion-quantity" className="block text-[10px] sm:text-[11px] font-semibold text-[#17472F] mb-0.5 truncate" title="Approx. No. of Gifts">
                      No. of Gifts
                    </label>
                    <input
                      id="occasion-quantity"
                      name="quantity"
                      type="text"
                      placeholder="e.g. 50"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-[#D1B2B2]/70 focus:border-[#A67D44] focus:ring-1 focus:ring-[#A67D44]/30 text-xs text-[#17472F] bg-white placeholder:text-stone-400 placeholder:text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="pt-0.5">
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-[#17472F] mb-0.5">
                    Consent <span className="text-[#A67D44]">*</span>
                  </span>
                  <label htmlFor="occasion-consent" className="flex items-start gap-1.5 cursor-pointer">
                    <input
                      id="occasion-consent"
                      name="consent"
                      type="checkbox"
                      required
                      checked={formData.consent}
                      onChange={handleChange}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-stone-300 accent-[#A67D44] focus:ring-[#A67D44] cursor-pointer shrink-0"
                    />
                    <span className="text-[9.5px] sm:text-[10.5px] leading-tight text-stone-600">
                      By proceeding, I agree to T&amp;C and Privacy Policy. Yes, I would like to receive updates via WhatsApp.
                    </span>
                  </label>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[10.5px] leading-tight">
                    {errorMessage}
                  </div>
                )}

                {/* Send Message Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 sm:py-2.5 px-4 rounded-lg font-bold uppercase tracking-wider text-[11px] sm:text-xs bg-[#A67D44] hover:bg-[#8E6935] text-white transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer disabled:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17472F]"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
