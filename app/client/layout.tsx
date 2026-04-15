import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account | PropSarathi',
  description: 'Sign in to your PropSarathi account to save properties, track enquiries, and manage your profile.',
  robots: { index: false, follow: false },
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return children
}
