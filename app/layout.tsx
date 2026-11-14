import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import "./components.css";
import "./pages.css";
import "./sections.css";
import "./fit.css";
import "./maison.css";
import "./commerce.css";
import "./theme.css";
import { Providers } from "@/components/shell/Providers";
import { Nav } from "@/components/shell/Nav";
import { BagDrawer } from "@/components/shell/Bag";
import { Loader } from "@/components/shell/Loader";
import { WorldMount } from "@/components/shell/WorldMount";
import { SITE_URL } from "@/lib/site";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Quatréa — A year you can wear", template: "%s — Quatréa" },
  description: "Four seasons. Four states of being. Quatréa is a niche maison de parfum composing the year in four fragrances: Aubade, Azur, Velours and Givre.",
  openGraph: {
    type: "website",
    siteName: "Quatréa",
    title: "Quatréa — A year you can wear",
    description: "Four seasons. One essence. A maison de parfum composing the year in four fragrances.",
    images: [{ url: "/img/bottles/product-house.webp" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#15120f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} data-tone="dark">
      <body>
        <Providers>
          <WorldMount />
          <Nav />
          {children}
          <BagDrawer />
          <Loader />
        </Providers>
      </body>
    </html>
  );
}
