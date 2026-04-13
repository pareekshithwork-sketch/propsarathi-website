import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Building2, Clock, Calendar, Tag, ArrowLeft, Share2, MessageCircle, Linkedin, Twitter } from 'lucide-react'
import sql from '@/lib/db'
import SharedFooter from '@/components/SharedFooter'

async function getPost(slug: string) {
  try {
    const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} AND status = 'published'`
    if (rows[0]) {
      // Increment views
      await sql`UPDATE blog_posts SET views = views + 1 WHERE slug = ${slug}`
    }
    return rows[0] || null
  } catch { return null }
}

async function getRelatedPosts(slug: string, category: string) {
  try {
    return await sql`
      SELECT id, slug, title, cover_image, reading_time, published_at
      FROM blog_posts WHERE status = 'published' AND slug != ${slug}
      AND category = ${category} LIMIT 3
    `
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.seo_title || `${post.title} | PropSarathi Blog`,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: [post.og_image || post.cover_image || '/propsarathi-og.jpg'],
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(slug, post.category)
  const url = `https://www.propsarathi.com/blog/${slug}`

  // FAQ schema if exists
  let faqSchema = null
  if (post.schema_faq) {
    try { faqSchema = JSON.parse(post.schema_faq) } catch {}
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Schema markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.cover_image,
        author: { '@type': 'Person', name: post.author_name || 'PropSarathi Team' },
        publisher: { '@type': 'Organization', name: 'PropSarathi', url: 'https://www.propsarathi.com' },
        datePublished: post.published_at,
        dateModified: post.updated_at,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      })}} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqSchema.map((f: any) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
          }))
        })}} />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:block">All Articles</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#422D83] rounded-lg flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">PropSarathi</span>
          </Link>
          {/* Share */}
          <div className="flex items-center gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`} target="_blank"
              className="w-8 h-8 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 transition">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank"
              className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`} target="_blank"
              className="w-8 h-8 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-center text-sky-500 hover:bg-sky-100 transition">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.category && (
            <span className="bg-[#ede9f8] text-[#371f6e] text-xs font-semibold px-3 py-1 rounded-full">{post.category}</span>
          )}
          {post.reading_time && (
            <span className="flex items-center gap-1 text-gray-400 text-xs"><Clock className="w-3 h-3" />{post.reading_time} min read</span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <Calendar className="w-3 h-3" />
              {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          {post.author_image ? (
            <img src={post.author_image} alt={post.author_name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-[#ede9f8] rounded-full flex items-center justify-center text-[#371f6e] font-bold">
              {(post.author_name || 'P')[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 text-sm">{post.author_name || 'PropSarathi Team'}</p>
            <p className="text-gray-400 text-xs">Real Estate Expert</p>
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
            <img src={post.cover_image} alt={post.title} className="w-full object-cover max-h-96" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-[#422D83] prose-strong:text-gray-800 prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content || '<p>Content coming soon.</p>' }}
        />

        {/* Tags */}
        {post.tags && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
            {post.tags.split(',').map((tag: string) => (
              <span key={tag.trim()} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full hover:bg-[#f5f3fd] hover:text-[#371f6e] cursor-pointer transition">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Related project CTA */}
        {post.related_project_slug && (
          <div className="mt-8 bg-[#f5f3fd] border border-[#c4b8ef] rounded-2xl p-6">
            <p className="text-sm text-[#371f6e] font-medium mb-1">📍 Related Project</p>
            <p className="text-gray-600 text-sm mb-3">Interested in this type of property? Check out our featured project.</p>
            <Link href={`/properties/${post.related_project_slug}`}
              className="inline-flex items-center gap-2 bg-[#422D83] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#2d1a60] transition">
              View Project <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        )}

        {/* FAQ */}
        {faqSchema && faqSchema.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqSchema.map((faq: any, i: number) => (
                <details key={i} className="bg-gray-50 rounded-xl border border-gray-100 group">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-gray-800 text-sm list-none">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((p: any) => (
              <Link key={p.id} href={`/blog/${p.slug}`}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">
                {p.cover_image && (
                  <img src={p.cover_image} alt={p.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-[#422D83] transition line-clamp-2">{p.title}</h3>
                  {p.reading_time && <p className="text-xs text-gray-400 mt-1">{p.reading_time} min read</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <SharedFooter />
    </div>
  )
}
