import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo-config';

export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service - Pinecrest',
  description: 'Read our terms of service to understand the rules and guidelines for using Pinecrest platform.',
  path: '/terms-of-service',
  keywords: ['terms of service', 'terms and conditions', 'user agreement', 'legal', 'platform rules']
});

