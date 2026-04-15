"use client"

import Link from "next/link"
import Image from "next/image"

/**
 * PropSarathi logo — uses the actual /public/propsarathi-logo.png image.
 * No SVG recreation. The image is used as-is everywhere.
 *
 * LogoFull    — larger size, for landing headers and footer
 * LogoCompact — smaller size, for sticky / tight headers
 * default export → LogoCompact
 */

interface LogoProps {
  href?: string
  className?: string
  /** dark — not used with image logo, kept for API compatibility */
  dark?: boolean
}

/** Full size logo — hero headers, footer */
export function LogoFull({ href = "/", className = "" }: LogoProps) {
  const img = (
    <Image
      src="/propsarathi-logo.png"
      alt="PropSarathi"
      width={220}
      height={56}
      className={`h-12 w-auto ${className}`}
      priority
    />
  )
  if (!href) return img
  return <Link href={href} className="inline-flex items-center">{img}</Link>
}

/** Compact logo — sticky / small headers */
export function LogoCompact({ href = "/", className = "" }: LogoProps) {
  const img = (
    <Image
      src="/propsarathi-logo.png"
      alt="PropSarathi"
      width={160}
      height={40}
      className={`h-9 w-auto ${className}`}
      priority
    />
  )
  if (!href) return img
  return <Link href={href} className="inline-flex items-center">{img}</Link>
}

/** Default export — LogoCompact */
export default function Logo({ href = "/", className = "" }: LogoProps) {
  return <LogoCompact href={href} className={className} />
}
