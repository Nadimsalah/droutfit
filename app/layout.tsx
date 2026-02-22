import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DrOutfit - #1 AI Virtual Try-On for E-commerce Brands",
  description: "Boost sales and reduce returns with DrOutfit's AI Virtual Try-On widget. Seamlessly integrates with Shopify, WooCommerce, and custom stores. Try it free.",
  keywords: ["AI Virtual Try-On", "Virtual Dressing Room", "Fashion Tech", "E-commerce Widget", "Shopify App", "Reduce Returns", "Clothing Try-On"],
  openGraph: {
    title: "DrOutfit - AI Virtual Try-On for E-commerce",
    description: "Empower your customers to try before they buy. The highest fidelity AI try-on engine for modern fashion brands.",
    url: "https://droutfit.com",
    siteName: "DrOutfit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DrOutfit AI Virtual Try-On Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DrOutfit - AI Virtual Try-On",
    description: "Boost conversion rates by +35% with our AI try-on widget.",
    creator: "@droutfit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
