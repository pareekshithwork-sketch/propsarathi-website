'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

interface SavePropertyButtonProps {
  slug: string
  className?: string
}

export default function SavePropertyButton({ slug, className = '' }: SavePropertyButtonProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const meRes = await fetch('/api/auth/client/me')
        const { user } = await meRes.json()
        if (!user) { setLoading(false); return }
        setLoggedIn(true)
        const savedRes = await fetch('/api/client/saved-properties')
        const { saved: list } = await savedRes.json()
        setSaved(list?.some((s: any) => s.slug === slug) ?? false)
      } catch {}
      setLoading(false)
    }
    check()
  }, [slug])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!loggedIn) {
      window.location.href = `/client/login?redirect=/properties/${slug}`
      return
    }
    const wasSaved = saved
    setSaved(!wasSaved)
    try {
      if (wasSaved) {
        await fetch(`/api/client/saved-properties/${slug}`, { method: 'DELETE' })
      } else {
        await fetch('/api/client/saved-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
      }
    } catch {
      setSaved(wasSaved) // revert on error
    }
  }

  if (loading) return null

  return (
    <button
      onClick={toggle}
      title={saved ? 'Remove from saved' : 'Save property'}
      className={`p-2 rounded-full transition-colors ${saved ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white'} ${className}`}
    >
      <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
