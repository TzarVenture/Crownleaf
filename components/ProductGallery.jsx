"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images = [], productName = "Product" }) {
  const [selectedImage, setSelectedImage] = useState(images[0]?.src || null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-white flex items-center justify-center p-8 text-slate-400 text-xs font-semibold uppercase tracking-wider">
        No Images Available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Primary Display Stage - Maximized canvas on mobile with snug padding */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-white p-3 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs border border-[#E4DCCF]">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-2 sm:p-6 transition-all duration-300"
          />
        ) : (
          <div className="text-slate-400 text-xs font-medium">Image Preview Unavailable</div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto p-1 scrollbar-none overscroll-x-contain">
          {images.map((img, index) => {
            const isSelected = selectedImage === img.src;
            return (
              <button
                key={img.id || index}
                type="button"
                onClick={() => setSelectedImage(img.src)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-white p-1.5 flex-shrink-0 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#A67D44] shadow-xs"
                    : "border-[#E4DCCF]/80 opacity-75 hover:opacity-100"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1 rounded-lg"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
