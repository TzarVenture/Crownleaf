import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Images are served from the WordPress uploads folder. Allow whichever host WordPress runs on,
// so moving WordPress to a sub-domain only needs the env var changed.
const wordpressHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://crownleaf.co").hostname;
  } catch {
    return "crownleaf.co";
  }
})();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "crownleaf.co" },
      ...(wordpressHost !== "crownleaf.co" ? [{ protocol: "https", hostname: wordpressHost }] : []),
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    // Pin the project root. A stray package-lock.json in a parent folder made Next pick the wrong one.
    root: projectRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
