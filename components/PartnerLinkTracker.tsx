'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PartnerLinkTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (!ref) return

    const pageUrl = window.location.href
    const sessionKey = `ps_ref_tracked_${ref}`

    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')

    const sessionId = sessionStorage.getItem('ps_session_id') || (() => {
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('ps_session_id', id)
      return id
    })()

    function track(type: 'soft' | 'hard') {
      fetch('/api/partner/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: ref, pageUrl, sessionId, type }),
      }).catch(() => {})
    }

    const softTimer = setTimeout(() => track('soft'), 30_000)
    const hardTimer = setTimeout(() => track('hard'), 60_000)

    return () => {
      clearTimeout(softTimer)
      clearTimeout(hardTimer)
    }
  }, [searchParams])

  return null
}
