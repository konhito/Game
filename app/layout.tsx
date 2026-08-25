import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SharedHeader from "@/components/shared-header";
import SharedFooter from "@/components/shared-footer";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Pinecrest | Make the everyday count",
    template: "%s | Pinecrest"
  },
  description:
    "Turn the small things you already do online into clear progress, weekly recognition, and real rewards.",
  keywords: [
    "earn money online",
    "social media rewards",
    "earn points",
    "online rewards platform",
    "share and earn",
    "social engagement",
    "leaderboard competition",
    "earn coins",
    "online tasks",
    "referral rewards",
    "daily rewards",
    "social media platform"
  ],
  authors: [{ name: "Pinecrest Team" }],
  creator: "Pinecrest",
  publisher: "Pinecrest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Pinecrest | Make the everyday count",
    description:
      "Small actions. Clear progress. A fairer way to earn from showing up online.",
    url: siteConfig.url,
    siteName: "Pinecrest",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Pinecrest - Share and Earn Rewards Platform",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinecrest | Make the everyday count",
    description: "Small actions. Clear progress. A fairer way to earn from showing up online.",
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    // Use the Pinecrest brand logo consistently across favicon targets.
    icon: [
      { url: '/Logo1.png', sizes: '32x32', type: 'image/png' },
      { url: '/Logo1.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/Logo1.png',
    apple: '/Logo1.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full overflow-x-hidden">
      <body className="font-sans antialiased min-h-screen m-0 p-0 overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-full">
            <SharedHeader />
            <main className="flex-1">
              {children}
            </main>
            <SharedFooter />
          </div>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
