"use client"

import type React from "react"
import Link from "next/link"
import { blogData } from "../data/blogData"
import Header from "./Header"
import Footer from "./Footer"

const BlogCard: React.FC<{ post: (typeof blogData)[0] }> = ({ post }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group">
    <Link href={`/blog/${post.id}`}>
      <img className="w-full h-56 object-cover" src={post.image || "/placeholder.svg"} alt={post.title} />
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-brand-dark mb-2 group-hover:text-brand-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-brand-muted text-sm mb-4">{post.excerpt}</p>
        <div className="flex items-center">
          <img className="w-10 h-10 rounded-full mr-4" src={post.authorImage || "/placeholder.svg"} alt={post.author} />
          <div>
            <p className="text-brand-dark font-semibold">{post.author}</p>
            <p className="text-brand-muted text-xs">{post.date}</p>
          </div>
        </div>
      </div>
    </Link>
  </div>
)

const BlogPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="pt-24 bg-brand-light">
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-serif font-bold text-brand-dark">Insights & Market Analysis</h1>
              <p className="text-brand-muted max-w-2xl mx-auto mt-4">
                Stay ahead of the curve with our expert analysis of the real estate markets in the UAE and India.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogData.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

export default BlogPage
