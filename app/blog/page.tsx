import Link from 'next/link'
import { Clock, Tag, ArrowRight, BookOpen } from 'lucide-react'
import sql from '@/lib/db'
import SharedFooter from '@/components/SharedFooter'
import { LogoCompact } from '@/components/Logo'

export const metadata = {
  title: 'Blog & Insights | Real Estate Investment Guide - PropSarathi',
  description: 'Expert insights on Bangalore and Dubai real estate. Pre-launch tips, investment guides, market trends, NRI property investment advice.',
  openGraph: {
    title: 'PropSarathi Blog - Real Estate Insights',
    description: 'Expert real estate insights for Bangalore and Dubai markets.',
  },
}

async function getPosts() {
  try {
    return await sql`
      SELECT id, slug, title, excerpt, cover_image, author_name, category, tags, reading_time, published_at, related_project_slug
      FROM blog_posts WHERE status = 'published'
      ORDER BY published_at DESC
    `
  } catch { return [] }
}

const CATEGORIES = ['All', 'Investment Guide', 'Market Trends', 'NRI Investment', 'Bangalore', 'Dubai', 'Legal & Finance']

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <LogoCompact />
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link href="/properties" className="hover:text-[#422D83] transition">Properties</Link>
            <Link href="/blog" className="text-[#422D83] font-medium">Blog</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-900 to-gray-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#422D83]/20 border border-[#422D83]/30 rounded-full px-4 py-1.5 mb-4">
            <BookOpen className="w-4 h-4 text-[#a99de0]" />
            <span className="text-[#a99de0] text-sm font-medium">Expert Real Estate Insights</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Blog & Market Insights</h1>
          <p className="text-gray-300 text-lg">Investment guides, market trends, and expert advice for Bangalore & Dubai real estate</p>
        </div>
      </section>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Insights Coming Soon</h2>
            <p className="text-gray-400 text-sm mb-6">We're working on expert guides for Bangalore & Dubai real estate investors.</p>
            <Link href="/properties" className="inline-flex items-center gap-2 bg-[#422D83] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#2d1a60] transition text-sm">
              Browse Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {post.cover_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img src={post.cover_image} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-[#422D83] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-[#422D83] transition line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span>{post.author_name || 'PropSarathi Team'}</span>
                    <div className="flex items-center gap-3">
                      {post.reading_time && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time} min</span>
                      )}
                      {post.published_at && (
                        <span>{new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SharedFooter />
    </div>
  )
}
