import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import { siteConfig } from "@/lib/seo-config";

const homepageTitle = "Pinecrest - Earn Rewards from Social Media Tasks";
const homepageDescription = "Join Pinecrest to earn points from social media tasks, climb weekly leaderboards, and redeem real rewards with a secure AI-verified platform.";
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