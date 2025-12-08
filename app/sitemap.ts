import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pinecrest.com';

  // Static pages with their priorities and change frequencies
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Fetch dynamic news articles
  let newsArticles: Array<{ url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }> = [];
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.up.railway.app';
    const response = await fetch(`${apiBase}/api/news?limit=100`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.data?.articles) {
        newsArticles = result.data.articles.map((article: any) => ({
          url: `${baseUrl}/news/${article.slug}`,
          lastModified: new Date(article.updated_at || article.published_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching news articles for sitemap:', error);
  }

  return [...staticPages, ...newsArticles];
}

