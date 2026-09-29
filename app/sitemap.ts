import type { MetadataRoute } from 'next';
import { SlugEngine } from '@/lib/vibe/slug-engine';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelplanet.voyage8.com';

const STATIC_PATHS = ['/', '/destinations', '/hotels', '/flights', '/packages', '/experiences', '/visa', '/trip-planner'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(path => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  try {
    const vibePaths = await SlugEngine.sitemapEntries();
    for (const entry of vibePaths) {
      entries.push({
        url: `${SITE_URL}${entry.loc}`,
        lastModified: entry.updatedAt ?? new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } catch {
    // Registry unavailable (fresh environment): ship static sitemap only.
  }

  return entries;
}
