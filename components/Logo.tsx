"use client"

import Link from "next/link"

/**
 * PropSarathi brand logo — pure SVG icon + styled HTML text.
 * Matches the official logo exactly:
 *   • Open purple chevron (∧) with a small orange triangle inside the left arm
 *   • "Prop" in bold purple (#422D83) + "Sarathi" in bold orange (#F97316)
 *   • Tagline: "Behind Every Confident" purple + "Investment" orange
 *
 * LogoFull    — icon + text + tagline (landing headers, footer)
 * LogoCompact — icon + text only (sticky / small headers)
 * default export → LogoCompact (for legacy <Logo /> usage)
 */

const PURPLE = "#422D83"
const ORANGE  = "#F97316"

function ChevronIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 58 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Purple open chevron ∧ — thick stroke, open at bottom */}
      <path
        d="M 2,54 L 29,5 L 56,54 L 47,54 L 29,20 L 11,54 Z"
        fill={PURPLE}
      />
      {/* Small orange triangle — inside the left arm of the chevron */}
      <polygon points="13,55 23,55 18,44" fill={ORANGE} />
    </svg>
  )
}

interface LogoProps {
  href?: string
  className?: string
  /** dark=true — renders "Prop" and tagline text in white instead of purple (for dark backgrounds) */
  dark?: boolean
}

function LogoContent({
  showTagline,
  dark = false,
  iconSize,
  className = "",
}: {
  showTagline: boolean
  dark?: boolean
  iconSize: number
  className?: string
}) {
  const propColor   = dark ? "#ffffff" : PURPLE
  const taglineMain = dark ? "#e2daf5" : PURPLE

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <ChevronIcon size={iconSize} />
      <span className="flex flex-col leading-none">
        {/* "Prop" + "Sarathi" */}
        <span
          className="font-extrabold leading-none tracking-tight"
          style={{ fontSize: showTagline ? "1.6rem" : "1.25rem" }}
        >
          <span style={{ color: propColor }}>Prop</span>
          <span style={{ color: ORANGE }}>Sarathi</span>
        </span>

        {/* Tagline */}
        {showTagline && (
          <span
            className="font-semibold leading-snug mt-1"
            style={{ fontSize: "0.72rem", letterSpacing: "0.01em" }}
          >
            <span style={{ color: taglineMain }}>Behind Every Confident </span>
            <span style={{ color: ORANGE }}>Investment</span>
          </span>
        )}
      </span>
    </span>
  )
}

/** Full logo — icon + text + tagline. For hero / landing headers and footer. */
export function LogoFull({ href = "/", className = "", dark = false }: LogoProps) {
  const content = <LogoContent showTagline={true} dark={dark} iconSize={52} className={className} />
  if (!href) return content
  return <Link href={href}>{content}</Link>
}

/** Compact logo — icon + text, no tagline. For sticky / small headers. */
export function LogoCompact({ href = "/", className = "", dark = false }: LogoProps) {
  const content = <LogoContent showTagline={false} dark={dark} iconSize={36} className={className} />
  if (!href) return content
  return <Link href={href}>{content}</Link>
}

/** Default export — LogoCompact (keeps existing <Logo /> usage working) */
export default function Logo({ href = "/", className = "", dark = false }: LogoProps) {
  return <LogoCompact href={href} className={className} dark={dark} />
}
