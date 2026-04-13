"use client"

import { useEffect } from "react"
import { getPageMetadata, getFullTitle, getCanonicalUrl, seoConfig } from "../lib/seoMetadata"

export const useSEO = (pageName: string) => {
  useEffect(() => {
    const metadata = getPageMetadata(pageName)

    // Update document title
    document.title = getFullTitle(metadata.title)

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name"
      let element = document.querySelector(`meta[${attribute}="${name}"]`)

      if (!element) {
        element = document.createElement("meta")
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }

      element.setAttribute("content", content)
    }

    // Basic meta tags
    updateMetaTag("description", metadata.description)
    updateMetaTag("keywords", metadata.keywords.join(", "))

    // Open Graph tags
    updateMetaTag("og:title", metadata.title, true)
    updateMetaTag("og:description", metadata.description, true)
    updateMetaTag("og:type", metadata.ogType || "website", true)
    updateMetaTag("og:url", getCanonicalUrl(metadata.canonical), true)
    updateMetaTag("og:image", metadata.ogImage || seoConfig.defaultImage, true)
    updateMetaTag("og:site_name", seoConfig.siteName, true)

    // Twitter Card tags
    updateMetaTag("twitter:card", metadata.twitterCard || "summary_large_image")
    updateMetaTag("twitter:site", seoConfig.defaultTwitterHandle)
    updateMetaTag("twitter:title", metadata.title)
    updateMetaTag("twitter:description", metadata.description)
    updateMetaTag("twitter:image", metadata.ogImage || seoConfig.defaultImage)

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonicalLink) {
      canonicalLink = document.createElement("link")
      canonicalLink.setAttribute("rel", "canonical")
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute("href", getCanonicalUrl(metadata.canonical))

    // Schema.org structured data
    if (metadata.schema) {
      let schemaScript = document.querySelector('script[type="application/ld+json"]')

      if (!schemaScript) {
        schemaScript = document.createElement("script")
        schemaScript.setAttribute("type", "application/ld+json")
        document.head.appendChild(schemaScript)
      }

      schemaScript.textContent = JSON.stringify(metadata.schema)
    }

    // Cleanup function
    return () => {
      // Optional: Clean up meta tags if needed
    }
  }, [pageName])
}
