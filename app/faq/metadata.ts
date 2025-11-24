import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo-config';

export const metadata: Metadata = generateMetadata({
  title: 'Frequently Asked Questions - Pinecrest',
  description: 'Find answers to common questions about Pinecrest. Learn how to earn points, claim rewards, and get the most out of our platform.',
  path: '/faq',
  keywords: ['pinecrest faq', 'help', 'support', 'how to earn', 'questions', 'answers']
});

