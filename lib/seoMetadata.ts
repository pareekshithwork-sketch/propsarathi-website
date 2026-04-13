export interface PageMetadata {
  title: string
  description: string
  keywords: string[]
  canonical: string
  ogType?: string
  ogImage?: string
  twitterCard?: string
  schema?: Record<string, any>
  altTags?: Record<string, string> // Reference for image alt tags used on the page
}

export interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultImage: string
  defaultTwitterHandle: string
  pages: Record<string, PageMetadata>
}

// Centralized SEO Configuration
export const seoConfig: SEOConfig = {
  siteName: "PropSarathi - Dubai & Bangalore Real Estate Investment Advisors",
  siteUrl: "https://propsarathi.com", // Update with actual domain
  defaultImage: "/og-image.jpg", // Update with actual OG image
  defaultTwitterHandle: "@propsarathi", // Update with actual Twitter handle

  pages: {
    home: {
      title: "PropSarathi - Your Strategic Navigator in Dubai & Bangalore Real Estate Investments",
      description:
        "Stop guessing. Start growing. PropSarathi offers expert real estate investment advisory services in Dubai and Bangalore. Discover high-ROI properties with 8-12% rental yields and strategic portfolio management.",
      keywords: [
        "Dubai real estate investment",
        "Bangalore property investment",
        "real estate advisory",
        "property investment Dubai",
        "Bangalore real estate advisor",
        "high ROI properties",
        "rental yield properties",
        "real estate portfolio management",
        "Dubai property advisor",
        "Bangalore property consultant",
      ],
      canonical: "/",
      ogType: "website",
      ogImage: "/images/home-og.jpg",
      twitterCard: "summary_large_image",
      schema: {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: "PropSarathi",
        description: "Strategic Real Estate Investment Advisory in Dubai and Bangalore",
        url: "https://propsarathi.com",
        logo: "https://propsarathi.com/logo.png",
        address: [
          {
            "@type": "PostalAddress",
            addressLocality: "Dubai",
            addressCountry: "UAE",
          },
          {
            "@type": "PostalAddress",
            addressLocality: "Bangalore",
            addressCountry: "India",
          },
        ],
        areaServed: ["Dubai", "Bangalore", "Mumbai", "UAE", "India"],
        priceRange: "$$$$",
      },
      altTags: {
        heroImage: "Dubai skyline at night with illuminated skyscrapers",
        dubaiProperties: "Luxury properties in Dubai Marina and Downtown",
        bangaloreProperties: "Premium residential properties in Bangalore",
      },
    },

    about: {
      title: "About PropSarathi - Leading Real Estate Investment Advisors in Dubai & Bangalore",
      description:
        "Learn about PropSarathi's mission to guide strategic real estate investments. With 200+ Cr in assets advised, 200+ clients served, and partnerships with 30+ trusted developers across Dubai and Bangalore.",
      keywords: [
        "PropSarathi about",
        "real estate advisory company",
        "Dubai property experts",
        "Bangalore real estate consultants",
        "property investment advisors",
        "real estate portfolio management",
        "trusted property advisors",
      ],
      canonical: "/about",
      ogType: "website",
      ogImage: "/images/about-og.jpg",
      twitterCard: "summary_large_image",
      schema: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About PropSarathi",
        description:
          "PropSarathi is a specialized Real Estate Investment Portfolio Management Company serving forward-thinking individuals across India and the globe.",
        mainEntity: {
          "@type": "Organization",
          name: "PropSarathi",
          foundingDate: "2020",
          numberOfEmployees: "50+",
          slogan: "Wealth isn't just built—it's guided",
        },
      },
      altTags: {
        aboutHero: "PropSarathi team of real estate investment advisors",
        dubaiSkyline: "Dubai skyline showcasing luxury real estate market",
        teamPhoto: "PropSarathi leadership team",
      },
    },

    contact: {
      title: "Contact PropSarathi - Get Expert Real Estate Investment Advice in Dubai & Bangalore",
      description:
        "Ready to invest in Dubai or Bangalore real estate? Contact PropSarathi for personalized investment advisory. Call +971588660220 (Dubai) or +917090303535 (Bangalore). Free consultation available.",
      keywords: [
        "contact PropSarathi",
        "Dubai real estate contact",
        "Bangalore property advisor contact",
        "real estate consultation",
        "property investment inquiry",
        "Dubai property advisor phone",
        "Bangalore real estate consultant",
      ],
      canonical: "/contact",
      ogType: "website",
      ogImage: "/images/contact-og.jpg",
      twitterCard: "summary",
      schema: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact PropSarathi",
        description: "Get in touch with PropSarathi for expert real estate investment advice",
        mainEntity: {
          "@type": "Organization",
          name: "PropSarathi",
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+971588660220",
              contactType: "Customer Service",
              areaServed: "UAE",
              availableLanguage: ["English", "Hindi", "Arabic"],
            },
            {
              "@type": "ContactPoint",
              telephone: "+917090303535",
              contactType: "Customer Service",
              areaServed: "India",
              availableLanguage: ["English", "Hindi", "Kannada"],
            },
          ],
        },
      },
      altTags: {
        officeMap: "PropSarathi office locations in Dubai and Bangalore",
        contactForm: "Contact form for real estate investment inquiries",
      },
    },

    blog: {
      title: "PropSarathi Blog - Real Estate Investment Insights for Dubai & Bangalore",
      description:
        "Expert insights on Dubai and Bangalore real estate markets. Learn about investment strategies, market trends, property analysis, and wealth-building through strategic real estate investments.",
      keywords: [
        "real estate blog",
        "Dubai property market insights",
        "Bangalore real estate trends",
        "property investment tips",
        "real estate investment strategies",
        "Dubai market analysis",
        "Bangalore property news",
      ],
      canonical: "/blog",
      ogType: "website",
      ogImage: "/images/blog-og.jpg",
      twitterCard: "summary_large_image",
      schema: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "PropSarathi Real Estate Blog",
        description: "Expert insights and analysis on Dubai and Bangalore real estate investments",
        publisher: {
          "@type": "Organization",
          name: "PropSarathi",
          logo: {
            "@type": "ImageObject",
            url: "https://propsarathi.com/logo.png",
          },
        },
      },
      altTags: {
        blogHero: "Real estate investment insights and market analysis",
        featuredArticle: "Latest real estate market trends in Dubai and Bangalore",
      },
    },

    partner: {
      title: "Partner Portal - PropSarathi Developer & Agent Partnership Program",
      description:
        "Join PropSarathi's exclusive partner network. Connect with trusted developers and agents in Dubai and Bangalore. Access exclusive listings, co-marketing opportunities, and grow your real estate business.",
      keywords: [
        "real estate partnership",
        "developer partnership Dubai",
        "property agent network",
        "real estate collaboration",
        "PropSarathi partners",
        "developer network Bangalore",
        "real estate agent portal",
      ],
      canonical: "/partner",
      ogType: "website",
      ogImage: "/images/partner-og.jpg",
      twitterCard: "summary",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Partner Portal",
        description: "Join PropSarathi's partner network for exclusive real estate opportunities",
        provider: {
          "@type": "Organization",
          name: "PropSarathi",
        },
      },
      altTags: {
        partnerLogos: "Trusted developer partners in Dubai and Bangalore",
        partnershipBenefits: "Benefits of partnering with PropSarathi",
      },
    },
  },
}

// Helper function to get metadata for a specific page
export const getPageMetadata = (pageName: string): PageMetadata => {
  return seoConfig.pages[pageName] || seoConfig.pages.home
}

// Helper function to generate full title
export const getFullTitle = (pageTitle: string): string => {
  return pageTitle
}

// Helper function to generate canonical URL
export const getCanonicalUrl = (path: string): string => {
  return `${seoConfig.siteUrl}${path}`
}

// Helper function to add new page metadata dynamically
export const addPageMetadata = (pageName: string, metadata: PageMetadata): void => {
  seoConfig.pages[pageName] = metadata
}
