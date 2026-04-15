"use client"

import Link from "next/link"

/**
 * PropSarathi brand logo — built entirely in SVG + styled text.
 *
 * LogoFull    — icon + "PropSarathi" text + tagline  (landing headers, footer)
 * LogoCompact — icon + "PropSarathi" text, no tagline (sticky/small headers)
 *
 * Both wrap themselves in a Next.js <Link href="/" />.
 * Pass href="" to suppress the link wrapper (e.g. when already inside a <Link>).
 */

const PURPLE = "#422D83"
const ORANGE = "#F97316"

/** The chevron/roof SVG icon */
function PropSarathiIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer purple chevron/roof shape */}
      <path
        d="M20 4 L36 18 L36 36 L26 36 L26 24 L14 24 L14 36 L4 36 L4 18 Z"
        fill={PURPLE}
      />
      {/* Small orange triangle at bottom center — the "S" accent dot */}
      <polygon points="20,26 24,36 16,36" fill={ORANGE} />
    </svg>
  )
}

interface LogoProps {
  href?: string
  className?: string
  /** dark=true — use white for "Prop" text; for use on dark/navy backgrounds */
  dark?: boolean
}

function LogoContent({ showTagline, dark = false, className = "" }: {
  showTagline: boolean
  dark?: boolean
  className?: string
}) {
  const propColor = dark ? "#ffffff" : PURPLE
  return (
    <span className={`flex items-center gap-2 select-none ${className}`}>
      <PropSarathiIcon size={showTagline ? 36 : 30} />
      <span className="flex flex-col leading-none">
        <span className="font-bold text-base leading-tight tracking-tight">
          <span style={{ color: propColor }}>Prop</span>
          <span style={{ color: ORANGE }}>Sarathi</span>
        </span>
        {showTagline && (
          <span
            className="text-[10px] font-medium leading-tight mt-0.5"
            style={{ color: ORANGE }}
          >
            Behind Every Confident Investment
          </span>
        )}
      </span>
    </span>
  )
}

/** Full logo — icon + text + tagline. For landing headers and footer. */
export function LogoFull({ href = "/", className = "", dark = false }: LogoProps) {
  const content = <LogoContent showTagline={true} dark={dark} className={className} />
  if (!href) return content
  return <Link href={href}>{content}</Link>
}

/** Compact logo — icon + text, no tagline. For sticky/small headers. */
export function LogoCompact({ href = "/", className = "", dark = false }: LogoProps) {
  const content = <LogoContent showTagline={false} dark={dark} className={className} />
  if (!href) return content
  return <Link href={href}>{content}</Link>
}

/** Default export for backward compatibility — renders LogoCompact */
export default function Logo({ href = "/", className = "", dark = false }: LogoProps) {
  return <LogoCompact href={href} className={className} dark={dark} />
}
