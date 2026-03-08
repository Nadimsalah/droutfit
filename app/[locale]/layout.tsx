import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { i18n, Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale as any);

  return {
    metadataBase: new URL("https://droutfit.com"),
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: [
      "AI Virtual Try-On",
      "Virtual Fitting Room",
      "Clothing Try-Ons",
      "AI Dressing Room",
      "Virtual Try-On for Shopify",
      "E-commerce AI Widget",
      "Online Clothing Fit",
      "Augmented Reality Fashion",
      "Digital Storefront AI",
      "Reduce Returns Fashion"
    ],
    openGraph: {
      title: dict.metadata.title,
      description: dict.metadata.description,
      url: "https://droutfit.com",
      siteName: "DrOutfit",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "DrOutfit AI Virtual Try-On Platform",
        },
      ],
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
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
    alternates: {
      canonical: "https://droutfit.com",
    },
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const params = await props.params;
  const locale = params.locale as Locale;
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script src="https://unpkg.com/@shopify/app-bridge@latest/umd/index.js" defer></script>
        {props.children}
      </body>
    </html>
  );
}
