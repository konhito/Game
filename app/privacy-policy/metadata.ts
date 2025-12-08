import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo-config';

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy - Pinecrest',
  description: 'Read our privacy policy to understand how Pinecrest collects, uses, and protects your personal information.',
  path: '/privacy-policy',
  keywords: ['privacy policy', 'data protection', 'gdpr', 'privacy', 'user data']
});

