import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo-config';

export const metadata: Metadata = generateMetadata({
  title: 'News & Updates - Pinecrest',
  description: 'Stay up to date with the latest news, updates, and announcements from Pinecrest. Learn about new features, rewards, and community highlights.',
  path: '/news',
  keywords: ['pinecrest news', 'updates', 'announcements', 'platform news', 'community updates']
});

