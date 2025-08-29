import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SharedHeader from "@/components/shared-header";
import SharedFooter from "@/components/shared-footer";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Pinecrest - Gamified Rewards Platform",
  description:
    "Earn points, climb the leaderboard, and win rewards through engaging activities and challenges. Transform your social media engagement into real rewards.",
  openGraph: {
    title: "Pinecrest - Gamified Rewards Platform",
    description:
      "Earn points, climb the leaderboard, and win rewards through engaging activities and challenges.",
    url: "pinecrest.com",
    siteName: "Pinecrest",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "Pinecrest - Gamified Rewards Platform",
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-[-apple-system,BlinkMacSystemFont]antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          forcedTheme="light"
          disableTransitionOnChange
        >
          <SharedHeader />
          <main>
            {children}
          </main>
          <SharedFooter />
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
