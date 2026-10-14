"use client";

import { useState, useEffect } from "react";

export default function ShareButtons({ title = "" }) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const shareText = encodeURIComponent(`${title} — CrownLeaf Corporate Gifting`);
  const encodedUrl = encodeURIComponent(currentUrl);

  const shareLinks = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`,
      icon: (
        <svg className="w-4.5 h-4.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.769-5.768-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-2.222-.553-1.848-.763-3.033-2.645-3.125-2.768-.093-.122-.748-.995-.748-1.9 0-.906.474-1.35.643-1.534.169-.184.368-.23.491-.23.123 0 .245.001.353.007.113.005.263-.043.412.316.153.367.52 1.272.566 1.365.046.092.077.2.015.323-.061.123-.092.2-.184.307-.092.108-.194.241-.277.323-.092.092-.188.192-.081.376.107.184.478.788 1.025 1.275.706.628 1.301.822 1.486.914.184.092.292.077.4-.046.108-.123.46-1.058.583-1.242.123-.184.246-.153.414-.092.169.061 1.074.507 1.258.599.184.092.307.138.353.215.046.077.046.445-.098.85zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.39A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.587 0-3.07-.461-4.32-1.258l-.31-.194-2.82.787.799-2.738-.207-.328A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg className="w-4.5 h-4.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0 0-3.36 1.68 1.68 0 0 0 0 3.36m1.4 10.74v-8.37H5.06v8.37h2.8z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
      icon: (
        <svg className="w-4.5 h-4.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg className="w-4.5 h-4.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2.5 pt-3 sm:pt-4 text-xs">
      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] sm:text-[11px] mr-0.5">
        Share:
      </span>

      <div className="flex items-center gap-2 sm:gap-1.5">
        {shareLinks.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${item.name}`}
            className="w-9.5 h-9.5 sm:w-8 sm:h-8 rounded-full border border-[#E2D9CF] bg-white text-slate-600 hover:text-[#003108] hover:border-[#003108] transition-all flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95"
          >
            {item.icon}
          </a>
        ))}

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy page link"
          className="h-9.5 sm:h-8 px-3 sm:px-2.5 rounded-full border border-[#E2D9CF] bg-white text-slate-600 hover:text-[#003108] hover:border-[#003108] transition-all flex items-center gap-1.5 text-xs sm:text-[11px] font-medium shadow-2xs active:scale-95"
        >
          <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
