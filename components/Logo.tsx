import Link from 'next/link'
import { Building2 } from 'lucide-react'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

/**
 * Shared PropSarathi logo component.
 * variant="full"  — purple icon square + "PropSarathi" text (default)
 * variant="icon"  — purple icon square only
 * size="sm"       — 7x7 square, text-base
 * size="md"       — 9x9 square, text-lg  (default)
 * size="lg"       — 11x11 square, text-xl
 */
export default function Logo({ variant = 'full', size = 'md', href = '/', className = '' }: LogoProps) {
  const sizes = {
    sm: { box: 'w-7 h-7', icon: 'w-3.5 h-3.5', text: 'text-base', rounded: 'rounded-lg' },
    md: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-lg', rounded: 'rounded-xl' },
    lg: { box: 'w-11 h-11', icon: 'w-6 h-6', text: 'text-xl', rounded: 'rounded-xl' },
  }
  const s = sizes[size]

  const content = (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className={`${s.box} bg-[#422D83] ${s.rounded} flex items-center justify-center flex-shrink-0`}>
        <Building2 className={`${s.icon} text-white`} />
      </span>
      {variant === 'full' && (
        <span className={`font-bold text-gray-900 ${s.text}`}>PropSarathi</span>
      )}
    </span>
  )

  if (!href) return content
  return <Link href={href}>{content}</Link>
}
