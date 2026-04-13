"use client"
import { useState } from "react"
import Link from "next/link"
import { Building2, Phone, Mail, MapPin, MessageCircle, Send, CheckCircle, ArrowRight, Instagram, Linkedin } from "lucide-react"
import SharedFooter from "@/components/SharedFooter"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", city: "Bangalore" })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setSent(true)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#422D83] rounded-lg flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">PropSarathi</span>
          </Link>
          <Link href="/properties" className="flex items-center gap-1.5 bg-[#422D83] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#2d1a60] transition">
            Browse Properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-gray-900 to-[#1a0f3d] text-white py-14 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-gray-300 text-lg">Our experts are ready to guide you. Response within 2 hours.</p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Contact info */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
          {[
            { icon: <Phone className="w-5 h-5" />, label: "India (Call / WhatsApp)", value: "+91 70903 03535", href: "tel:+917090303535", color: "bg-green-50 text-green-600" },
            { icon: <Phone className="w-5 h-5" />, label: "UAE (Call / WhatsApp)", value: "+971 58 866 0220", href: "tel:+971588660220", color: "bg-green-50 text-green-600" },
            { icon: <MessageCircle className="w-5 h-5" />, label: "WhatsApp Chat", value: "Chat with us instantly", href: "https://wa.me/917090303535", color: "bg-green-50 text-green-600" },
            { icon: <Mail className="w-5 h-5" />, label: "Email", value: "Contact@propsarathi.com", href: "mailto:Contact@propsarathi.com", color: "bg-blue-50 text-blue-600" },
            { icon: <MapPin className="w-5 h-5" />, label: "Bangalore Office", value: "Bangalore, Karnataka 560001", href: "#", color: "bg-amber-50 text-amber-600" },
            { icon: <MapPin className="w-5 h-5" />, label: "Dubai Office", value: "Dubai, UAE", href: "#", color: "bg-purple-50 text-purple-600" },
          ].map(c => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#c4b8ef] hover:shadow-sm transition group">
              <div className={`w-11 h-11 ${c.color} rounded-xl flex items-center justify-center shrink-0`}>{c.icon}</div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{c.label}</p>
                <p className="font-semibold text-gray-800 group-hover:text-[#422D83] transition">{c.value}</p>
              </div>
            </a>
          ))}

          <div className="flex gap-3 pt-2">
            <a href="https://instagram.com/propsarathi" target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              <Instagram className="w-4 h-4" />Instagram
            </a>
            <a href="https://linkedin.com/company/propsarathi" target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              <Linkedin className="w-4 h-4" />LinkedIn
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {sent ? (
            <div className="text-center py-10">
              <CheckCircle className="w-14 h-14 text-[#422D83] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm">Our advisor will contact you within 2 hours.</p>
              <Link href="/properties" className="mt-6 inline-flex items-center gap-2 bg-[#422D83] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d1a60] transition">
                Browse Properties <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input required placeholder="Your Full Name *" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                <input required type="tel" placeholder="Phone Number *" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                <input type="email" placeholder="Email Address" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] bg-white">
                  <option>Bangalore</option>
                  <option>Dubai</option>
                  <option>Both</option>
                  <option>Other</option>
                </select>
                <textarea required placeholder="Your message or property requirement *" value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83] resize-none" />
                <button type="submit" disabled={loading}
                  className="w-full bg-[#422D83] hover:bg-[#2d1a60] text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <SharedFooter />
    </div>
  )
}
