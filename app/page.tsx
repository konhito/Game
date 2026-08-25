import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import { siteConfig } from "@/lib/seo-config";

const homepageTitle = "Pinecrest | Make the everyday count";
const homepageDescription = "Turn the small things you already do online into clear progress, weekly recognition, and real rewards.";
const homepageUrl = siteConfig.url;
const homepageImage = siteConfig.ogImage;

export const metadata: Metadata = {
  title: homepageTitle,
  description: homepageDescription,
  keywords: [
    ...siteConfig.keywords,
    "social task rewards",
    "earn pinecoins",
    "weekly leaderboard rewards",
    "ai verified rewards platform",
    "earn from social engagement",
  ],
  alternates: {
    canonical: homepageUrl,
  },
  openGraph: {
    title: homepageTitle,
    description: homepageDescription,
    url: homepageUrl,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: homepageImage,
        width: 1200,
        height: 630,
        alt: "Pinecrest rewards platform homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homepageTitle,
    description: homepageDescription,
    images: [homepageImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
  classification: "Social media rewards platform",
};

export default function Page() {
  return <HomePage />;
}
