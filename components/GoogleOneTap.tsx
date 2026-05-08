'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface GoogleOneTapProps {
  type: 'client' | 'partner'
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
          cancel: () => void
        }
      }
    }
  }
}

const SKIP_PATHS = [
  '/crm',
  '/client/login',
  '/client/register',
  '/partner/login',
  '/partner/register',
]

export default function GoogleOneTap({ type }: GoogleOneTapProps) {
  const router = useRouter()
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    // Never show on CRM or auth pages
    if (SKIP_PATHS.some(p => pathname === p || pathname.startsWith('/crm'))) return

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const meEndpoint = type === 'client' ? '/api/auth/client/me' : '/api/auth/partner/me'
    const tapEndpoint =
      type === 'client' ? '/api/auth/google/onetap' : '/api/auth/google/onetap-partner'

    let cancelled = false

    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        const res = await fetch(tapEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
        const data = await res.json()
        if (data.success && data.redirectTo) {
          router.push(data.redirectTo)
        }
      } catch {
        // silent fail — One Tap is non-intrusive
      }
    }

    const initOneTap = () => {
      if (cancelled || initialized.current || !window.google) return
      initialized.current = true
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
        context: 'signin',
      })
      window.google.accounts.id.prompt()
    }

    // Check if already logged in before showing prompt
    fetch(meEndpoint)
      .then(r => r.json())
      .then((data: { user?: unknown; partner?: unknown; success?: boolean }) => {
        if (cancelled) return
        const isLoggedIn = type === 'client' ? !!data.user : !!(data.partner || data.success)
        if (isLoggedIn) return

        if (window.google) {
          initOneTap()
        } else {
          const script = document.createElement('script')
          script.src = 'https://accounts.google.com/gsi/client'
          script.async = true
          script.defer = true
          script.onload = initOneTap
          document.body.appendChild(script)
        }
      })
      .catch(() => {
        // silent fail
      })

    return () => {
      cancelled = true
    }
  }, [pathname, type]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
