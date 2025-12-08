import { Metadata } from 'next';

const siteConfig = {
  name: 'Pinecrest',
  description: 'Earn points, climb the leaderboard, and win real rewards through social media activities and tasks.',
  url: 'https://pinecrest.com',
  ogImage: 'https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png',
  keywords: [
    'earn money online',
    'social media rewards',
    'earn points',
    'online rewards platform',
    'share and earn',
    'social engagement',
    'leaderboard competition',
    'earn coins',
    'online tasks',
    'referral rewards',
    'daily rewards',
    'social media platform'
  ]
};

export function generateMetadata({
  title,
  description,
  image = siteConfig.ogImage,
  path = '',
  type = 'website',
  keywords = [],
  noIndex = false,
}: {
  title: string;
  description: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const allKeywords = [...siteConfig.keywords, ...keywords];

  return {
    title,
    description,
    keywords: allKeywords,
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en-US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

export { siteConfig };

