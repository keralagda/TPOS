import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelplanet.voyage8.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/crm/', '/erp/', '/finance/', '/operations/', '/agent/', '/partner/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
