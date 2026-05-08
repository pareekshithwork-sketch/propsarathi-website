import type React from 'react'
import GoogleOneTap from '@/components/GoogleOneTap'
import PartnerPortalShell from '@/components/PartnerPortalShell'

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleOneTap type="partner" />
      <PartnerPortalShell>{children}</PartnerPortalShell>
    </>
  )
}
