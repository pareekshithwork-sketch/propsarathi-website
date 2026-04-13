"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Linkedin, Instagram, Facebook, Youtube } from "lucide-react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary border-t border-secondary/30">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Image
              src="/propsarathi-logo.png"
              alt="PropSarathi"
              width={200}
              height={50}
              className="h-10 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-white/90 max-w-sm leading-relaxed">
              Your strategic navigator for confident real estate investments in Dubai, Bangalore, and beyond. Behind
              every confident investment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/80 hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/80 hover:text-secondary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-secondary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/partner-portal" className="text-white/80 hover:text-secondary transition-colors">
                  Partner Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2 text-white/80">
              <li>Bangalore | Mumbai | Dubai</li>
              <li>
                <a href="mailto:enquiry@propsarathi.com" className="hover:text-secondary transition-colors">
                  enquiry@propsarathi.com
                </a>
              </li>
              <li>
                <a href="tel:+917090303535" className="hover:text-secondary transition-colors">
                  Ph: +91 70903 03535
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary/30 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            &copy; 2025 PropSarathi and Kushal J Rawal. All Rights Reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="https://www.linkedin.com/company/propsarathi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-secondary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/propsarathi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-secondary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://www.facebook.com/share/1A8jiuDiVe/?mibextid=qi2Omg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-secondary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a
              href="https://youtube.com/@propsarathi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-secondary transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
