'use client'

import { useState } from 'react'
import { Share2, Check, Copy, Loader2 } from 'lucide-react'

interface Props {
  projectSlug: string
  projectName: string
  isLoggedIn: boolean
  redirectPath: string
}

export default function ShareButton({ projectSlug, projectName, isLoggedIn, redirectPath }: Props) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    if (!isLoggedIn) {
      // Guest — share plain URL
      const url = window.location.href
      await copyToClipboard(url)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/share/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug }),
      })
      const data = await res.json()
      if (data.url) {
        await copyToClipboard(data.url)
      }
    } catch {
      await copyToClipboard(window.location.href)
    }
    setLoading(false)
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      title={`Share ${projectName}`}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : copied ? (
        <Check size={15} className="text-green-600" />
      ) : (
        <Share2 size={15} />
      )}
      {copied ? 'Link copied!' : 'Share'}
    </button>
  )
}
