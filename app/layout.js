import { Montserrat, Alex_Brush } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { SITE_URL } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

// Script face used for the "Distinguished Brands" tagline (it was referenced but never loaded before)
const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alex-brush",
  display: "swap",
});

const DESCRIPTION =
  "Premium corporate gifts, employee hampers, and customized business gifting solutions for every occasion across India";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CrownLeaf | Premium Corporate Gifting Solutions",
    template: "%s | CrownLeaf",
  },
  description: DESCRIPTION,
  applicationName: "CrownLeaf",
  openGraph: {
    type: "website",
    siteName: "CrownLeaf",
    locale: "en_IN",
    title: "CrownLeaf | Premium Corporate Gifting Solutions",
    description: DESCRIPTION,
    images: [{ url: "/images/banners/home-hero.webp", width: 2000, height: 667, alt: "CrownLeaf corporate gifts" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${alexBrush.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#003108] focus:text-white focus:text-xs focus:font-bold focus:uppercase focus:tracking-wider"
        >
          Skip to main content
        </a>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
