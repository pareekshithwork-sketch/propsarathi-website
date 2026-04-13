import { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/projectsDb'
import sql from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.propsarathi.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Project pages
  let projectPages: MetadataRoute.Sitemap = []
  try {
    const projects = await getAllProjects()
    projectPages = projects.map(p => ({
      url: `${base}/properties/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p.isFeatured ? 0.9 : 0.8,
    }))
  } catch {}

  // Blog pages
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await sql`SELECT slug, updated_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`
    blogPages = posts.map((p: any) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {}

  return [...staticPages, ...projectPages, ...blogPages]
}
