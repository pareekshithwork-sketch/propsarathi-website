# SEO Metadata Management Guide

## Overview
This project uses a centralized SEO metadata system that manages all page metadata in one place (`lib/seoMetadata.ts`).

## File Structure
- `lib/seoMetadata.ts` - Centralized SEO configuration for all pages
- `hooks/useSEO.ts` - Custom hook to apply SEO metadata to pages
- `App.tsx` - Main app file that uses the SEO hook

## How to Add a New Page

### Step 1: Add Metadata to `lib/seoMetadata.ts`

\`\`\`typescript
export const seoConfig: SEOConfig = {
  // ... existing config ...
  pages: {
    // ... existing pages ...
    
    // Add your new page here
    newPage: {
      title: "Your Page Title - PropSarathi",
      description: "Your page description (150-160 characters recommended)",
      keywords: [
        "keyword 1",
        "keyword 2",
        "keyword 3"
      ],
      canonical: "/new-page",
      ogType: "website",
      ogImage: "/images/new-page-og.jpg",
      twitterCard: "summary_large_image",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Your Page Name",
        "description": "Your page description"
      },
      altTags: {
        heroImage: "Description of hero image",
        featureImage: "Description of feature image"
      }
    }
  }
}
\`\`\`

### Step 2: Apply SEO Hook in Your Component

\`\`\`typescript
import { useSEO } from '../hooks/useSEO'

const YourNewPage: React.FC = () => {
  useSEO('newPage') // Use the key from seoMetadata.ts
  
  return (
    <div>
      {/* Your page content */}
    </div>
  )
}
\`\`\`

### Step 3: Add Route in App.tsx

\`\`\`typescript
case "#/new-page":
  return <YourNewPageWrapper />

// Create wrapper component
const YourNewPageWrapper: React.FC = () => {
  useSEO('newPage')
  return <YourNewPage />
}
\`\`\`

## Metadata Fields Explained

### Required Fields
- **title**: Page title (50-60 characters recommended)
- **description**: Meta description (150-160 characters recommended)
- **keywords**: Array of relevant keywords
- **canonical**: Canonical URL path

### Optional Fields
- **ogType**: Open Graph type (default: "website")
- **ogImage**: Open Graph image URL
- **twitterCard**: Twitter card type (default: "summary_large_image")
- **schema**: Schema.org structured data (JSON-LD)
- **altTags**: Reference object for image alt tags used on the page

## Best Practices

1. **Title**: Keep under 60 characters, include primary keyword
2. **Description**: 150-160 characters, compelling and descriptive
3. **Keywords**: 5-10 relevant keywords, avoid keyword stuffing
4. **Images**: Use high-quality OG images (1200x630px recommended)
5. **Schema**: Use appropriate schema types for better search results
6. **Alt Tags**: Descriptive, keyword-rich but natural

## Dynamic Page Metadata

For dynamic pages (like blog posts), you can use the `addPageMetadata` function:

\`\`\`typescript
import { addPageMetadata } from '../lib/seoMetadata'

// Add metadata dynamically
addPageMetadata('blog-post-123', {
  title: "Blog Post Title - PropSarathi",
  description: "Blog post description",
  keywords: ["blog", "real estate"],
  canonical: "/blog/123",
  // ... other fields
})

// Then use it
useSEO('blog-post-123')
\`\`\`

## Testing SEO

1. Check meta tags in browser DevTools (Elements > head)
2. Use Google's Rich Results Test: https://search.google.com/test/rich-results
3. Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
4. Use Twitter Card Validator: https://cards-dev.twitter.com/validator

## Updating Existing Pages

Simply edit the metadata in `lib/seoMetadata.ts`. Changes will automatically apply to all pages using that metadata.
