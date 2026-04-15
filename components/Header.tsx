"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { User } from "lucide-react"

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [clientName, setClientName] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/client/me').then(r => r.json()).then(({ user }) => {
      setClientName(user?.name ?? null)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const NavLinks: React.FC<{ className?: string }> = ({ className }) => (
    <nav className={className}>
      <Link
        href="/"
        onClick={() => setMobileMenuOpen(false)}
        className="text-foreground hover:text-secondary transition-colors duration-300 font-medium"
      >
        Home
      </Link>
      <Link
        href="/about"
        onClick={() => setMobileMenuOpen(false)}
        className="text-foreground hover:text-secondary transition-colors duration-300 font-medium"
      >
        About Us
      </Link>
      <Link
        href="/blog"
        onClick={() => setMobileMenuOpen(false)}
        className="text-foreground hover:text-secondary transition-colors duration-300 font-medium"
      >
        Blog
      </Link>
      <Link
        href="/contact"
        onClick={() => setMobileMenuOpen(false)}
        className="text-foreground hover:text-secondary transition-colors duration-300 font-medium"
      >
        Contact
      </Link>
    </nav>
  )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? "glass-header shadow-lg" : "glass-morphism"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex justify-between items-center md:grid md:grid-cols-3 gap-4">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/propsarathi-logo.png"
              alt="PropSarathi"
              width={180}
              height={45}
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Navigation - Center (Desktop only) */}
          <div className="hidden md:flex justify-center">
            <NavLinks className="flex items-center space-x-8" />
          </div>

          {/* Right side — Phone + My Account (Desktop only) */}
          <div className="hidden md:flex justify-end items-center gap-3">
            {clientName ? (
              <Link href="/client" className="flex items-center gap-1.5 text-sm font-medium text-[#422D83] bg-[#f5f3fd] px-4 py-2 rounded-full hover:bg-[#ede9fb] transition-colors">
                <User size={15} />
                {clientName}
              </Link>
            ) : (
              <Link href="/client/login" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#422D83] transition-colors px-3 py-2">
                <User size={15} />
                My Account
              </Link>
            )}
            <a
              href="tel:+917090303535"
              className="relative overflow-hidden bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl border border-secondary/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +91 70903 03535
              </span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-foreground z-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 12h12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-secondary/20 absolute top-full left-0 right-0 p-6 shadow-lg">
          <NavLinks className="flex flex-col space-y-4" />
          <Link href={clientName ? '/client' : '/client/login'} onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors duration-300 font-medium"
          >
            <User size={16} />
            {clientName ? clientName : 'My Account'}
          </Link>
          <a
            href="tel:+917090303535"
            className="mt-4 block text-center bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold border border-secondary/30"
          >
            +91 70903 03535
          </a>
        </div>
      )}
    </header>
  )
}

export default Header
