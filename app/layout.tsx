import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SharedHeader from "@/components/shared-header";
import SharedFooter from "@/components/shared-footer";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL('https://pinecrest.com'),
  title: {
    default: "Pinecrest - Share and Earn Rewards | Social Media Engagement Platform",
    template: "%s | Pinecrest"
  },
  description:
    "Earn points, climb the leaderboard, and win real rewards through social media activities. Share content, complete tasks, and get paid. Join thousands earning daily!",
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
    title: "Pinecrest - Share and Earn Rewards",
    description:
      "Earn points, climb the leaderboard, and win real rewards through social media activities. Share content, complete tasks, and get paid!",
    url: "https://pinecrest.com",
    siteName: "Pinecrest",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
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
    title: "Pinecrest - Share and Earn Rewards",
    description: "Earn points, climb the leaderboard, and win real rewards through social media activities.",
    images: ["https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png"],
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
    canonical: 'https://pinecrest.com',
  },
  icons: {
    // Next.js 13+ automatically handles icon.png in app directory
    // These are fallbacks for older browsers
    icon: [
      { url: '/Icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/Icon.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/Icon.png',
    apple: '/Icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="font-sans antialiased h-full m-0 p-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
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
