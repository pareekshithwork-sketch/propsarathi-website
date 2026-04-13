import Link from "next/link"
import { Building2, Phone, Mail, MapPin, Instagram, Linkedin } from "lucide-react"

export default function SharedFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300" id="contact">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#422D83] rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">PropSarathi</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your trusted charioteer in real estate. Expert advisory for Bangalore &amp; Dubai markets.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/propsarathi" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#371f6e] transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/propsarathi" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#371f6e] transition">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: "All Properties", href: "/properties" },
                { label: "Bangalore Projects", href: "/properties?city=Bangalore" },
                { label: "Dubai Projects", href: "/properties?city=Dubai" },
                { label: "Pre-Launch Deals", href: "/properties?status=Pre-Launch" },
                { label: "Blog & Insights", href: "/blog" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-[#8b78d4] transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About Us", href: "/about" },
                { label: "Partner Program", href: "/partner-portal" },
                { label: "Careers", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-[#8b78d4] transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#8b78d4] shrink-0" />
                <a href="tel:+917090303535" className="hover:text-[#8b78d4] transition">+91 70903 03535</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#8b78d4] shrink-0" />
                <a href="mailto:enquiry@propsarathi.com" className="hover:text-[#8b78d4] transition">enquiry@propsarathi.com</a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#8b78d4] shrink-0 mt-0.5" />
                <span>Bangalore, Karnataka &amp;<br />Dubai, UAE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 PropSarathi. All rights reserved. Inspired by the Sanskrit word Sarathi — your trusted guide.</p>
          <p className="text-xs text-gray-600">Built with ❤️ for smart property investors</p>
        </div>
      </div>
    </footer>
  )
}
