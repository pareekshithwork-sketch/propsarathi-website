"use client"

import { usePathname } from 'next/navigation'

export default function WhatsAppButton() {
  const pathname = usePathname()
  if (pathname?.startsWith('/crm')) return null

  return (
    <a
      href="https://wa.me/917090303535"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[9990] flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
      style={{ background: "#25D366" }}
    >
      {/* WhatsApp SVG icon — no external image dependency */}
      <svg viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <path d="M16.002 3C9.374 3 4 8.373 4 15c0 2.385.68 4.61 1.86 6.5L4 29l7.74-1.82A11.94 11.94 0 0 0 16.002 28C22.63 28 28 22.627 28 16S22.63 3 16.002 3Zm0 21.818a9.793 9.793 0 0 1-5.01-1.376l-.358-.214-3.71.874.928-3.614-.235-.373A9.77 9.77 0 0 1 6.182 16c0-5.415 4.405-9.818 9.82-9.818 5.416 0 9.82 4.403 9.82 9.818 0 5.414-4.404 9.818-9.82 9.818Zm5.39-7.35c-.296-.148-1.748-.863-2.019-.96-.27-.099-.467-.148-.664.148-.197.296-.763.96-.935 1.158-.173.197-.345.222-.64.074-.297-.148-1.252-.461-2.385-1.47-.881-.786-1.476-1.757-1.649-2.053-.172-.296-.018-.456.13-.603.132-.132.296-.345.444-.518.149-.172.198-.296.297-.493.099-.197.05-.37-.025-.518-.074-.148-.663-1.6-.908-2.19-.24-.573-.483-.496-.664-.505l-.566-.01a1.086 1.086 0 0 0-.789.37c-.27.296-1.035 1.012-1.035 2.467s1.059 2.862 1.207 3.06c.148.197 2.083 3.18 5.048 4.459.706.305 1.257.487 1.686.623.709.226 1.354.194 1.863.118.568-.085 1.748-.715 1.995-1.406.247-.69.247-1.281.173-1.406-.074-.124-.27-.197-.566-.345Z"/>
      </svg>
    </a>
  )
}
