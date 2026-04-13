import React from 'react';
import { blogData } from '../data/blogData';
import { marked } from 'marked';

// A simple component to render HTML from markdown string
const Markdown: React.FC<{ content: string }> = ({ content }) => {
    const html = marked(content);
    return <div className="prose lg:prose-xl max-w-none text-brand-dark" dangerouslySetInnerHTML={{ __html: html }} />;
};


const BlogPostPage: React.FC<{ postId: number }> = ({ postId }) => {
    const post = blogData.find(p => p.id === postId);

    if (!post) {
        return (
            <div className="pt-24 bg-brand-light min-h-screen">
                <section className="py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl font-serif font-bold text-brand-dark">Post not found</h1>
                        <p className="text-brand-muted mt-4">The article you are looking for does not exist.</p>
                        <a href="#/blog" className="mt-8 inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all duration-300">
                            Back to Blog
                        </a>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="pt-24 bg-brand-light">
            <article className="py-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4">{post.title}</h1>
                        <div className="flex items-center justify-center space-x-4 text-brand-muted">
                           <div className="flex items-center">
                                <img src={post.authorImage} alt={post.author} className="w-10 h-10 rounded-full mr-3" />
                                <span>By {post.author}</span>
                           </div>
                            <span>&bull;</span>
                            <time dateTime={post.date}>{post.date}</time>
                        </div>
                    </header>
                    <img src={post.image} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-xl mb-12" />
                    
                    <div className="prose-style">
                         <Markdown content={post.content} />
                    </div>

                    <div className="text-center mt-16">
                         <a href="#/blog" className="inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all duration-300">
                            &larr; Back to All Articles
                        </a>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogPostPage;
