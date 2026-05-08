import type React from 'react'
import GoogleOneTap from '@/components/GoogleOneTap'

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GoogleOneTap type="partner" />
    </>
  )
}
