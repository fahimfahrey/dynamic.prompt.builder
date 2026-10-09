import { MetadataRoute } from 'next';
import { BUILT_IN_TEMPLATES } from '@/lib/data/default-templates';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://promptforge.dev';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/optimizer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];

  const templateRoutes: MetadataRoute.Sitemap = BUILT_IN_TEMPLATES.map((tmpl) => ({
    url: `${baseUrl}/?template=${tmpl.id}`,
    lastModified: new Date(tmpl.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7
  }));

  return [...staticRoutes, ...templateRoutes];
}
