'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Lock, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface DocMeta {
  id: number
  label: string
  docType: string
  token: string
}

interface Props {
  projectSlug: string
  docType: 'floor_plan' | 'payment_plan' | 'brochure'
  title: string
  isLoggedIn: boolean
  isDeviceVerified: boolean
  redirectPath: string
}

type ViewerState = 'checking' | 'locked_login' | 'locked_verify' | 'loading' | 'viewing' | 'empty'

const WATERMARK_TEXT = 'PropSarathi · For Viewing Only'

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, userLabel: string) {
  ctx.save()
  // Tile diagonally at -35°
  const angle = -35 * (Math.PI / 180)
  const step = 200
  ctx.font = 'bold 13px sans-serif'
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#1e3a5f'
  ctx.textAlign = 'center'

  for (let x = -w; x < w * 2; x += step) {
    for (let y = -h; y < h * 2; y += step) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillText(WATERMARK_TEXT, 0, 0)
      ctx.fillText(userLabel, 0, 18)
      ctx.restore()
    }
  }
  ctx.restore()
}

export default function SecureDocumentViewer({
  projectSlug,
  docType,
  title,
  isLoggedIn,
  isDeviceVerified,
  redirectPath,
}: Props) {
  const [state, setState] = useState<ViewerState>('checking')
  const [docs, setDocs] = useState<DocMeta[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [userLabel, setUserLabel] = useState('PropSarathi User')

  useEffect(() => {
    if (!isLoggedIn) { setState('locked_login'); return }
    if (!isDeviceVerified) { setState('locked_verify'); return }
    loadDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isDeviceVerified])

  async function loadDocs() {
    setState('loading')
    try {
      const [docsRes, meRes] = await Promise.all([
        fetch(`/api/documents/${projectSlug}/${docType}`),
        fetch('/api/auth/client/me'),
      ])
      const { docs: fetched } = await docsRes.json()
      if (meRes.ok) {
        const me = await meRes.json()
        setUserLabel(me.email ?? me.name ?? 'PropSarathi User')
      }
      if (!fetched || fetched.length === 0) { setState('empty'); return }
      setDocs(fetched)
      setState('viewing')
    } catch {
      setState('empty')
    }
  }

  const renderToCanvas = useCallback(async (doc: DocMeta) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width * zoom
      canvas.height = img.height * zoom
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      drawWatermark(ctx, canvas.width, canvas.height, userLabel)
    }
    img.src = `/api/documents/serve/${doc.token}`
  }, [zoom, userLabel])

  useEffect(() => {
    if (state === 'viewing' && docs[currentIndex]) {
      renderToCanvas(docs[currentIndex])
    }
  }, [state, currentIndex, zoom, docs, renderToCanvas])

  // Block right-click, keyboard save shortcuts
  useEffect(() => {
    if (state !== 'viewing') return
    const block = (e: Event) => e.preventDefault()
    const blockKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', block)
    document.addEventListener('keydown', blockKey)
    return () => {
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('keydown', blockKey)
    }
  }, [state])

  const loginUrl = `/client/login?redirect=${encodeURIComponent(redirectPath)}`

  if (state === 'checking') {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span className="text-sm">Loading…</span>
      </div>
    )
  }

  if (state === 'locked_login') {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <Lock size={24} className="text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Login to view {title}</p>
          <p className="text-sm text-gray-500 mt-1">Free. Takes 30 seconds.</p>
        </div>
        <Link
          href={loginUrl}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Login to view
        </Link>
      </div>
    )
  }

  if (state === 'locked_verify') {
    return (
      <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
          <Lock size={24} className="text-orange-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Verify your phone to view {title}</p>
          <p className="text-sm text-gray-500 mt-1">One-time WhatsApp verification required.</p>
        </div>
        {/* Parent handles showing PhoneVerificationScreen — this just signals need */}
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('ps:show-verify'))}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
        >
          Verify now
        </button>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span className="text-sm">Loading documents…</span>
      </div>
    )
  }

  if (state === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
        <FileText size={32} />
        <p className="text-sm">No {title.toLowerCase()} available yet.</p>
      </div>
    )
  }

  // state === 'viewing'
  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {docs.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">{currentIndex + 1} / {docs.length}</span>
              <button
                onClick={() => setCurrentIndex(i => Math.min(docs.length - 1, i + 1))}
                disabled={currentIndex === docs.length - 1}
                className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {docs[currentIndex]?.label && (
            <span className="text-sm font-medium text-gray-700 ml-1">{docs[currentIndex].label}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-50"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.25))}
            className="p-1.5 rounded border border-gray-200 hover:bg-gray-50"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* Canvas viewer */}
      <div className="overflow-auto rounded-xl border border-gray-200 bg-gray-100 max-h-[520px]">
        <canvas
          ref={canvasRef}
          className="block mx-auto"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        />
      </div>

      <p className="text-xs text-gray-400 text-center select-none">
        🔒 Secured by PropSarathi · Downloading or screenshotting is prohibited
      </p>
    </div>
  )
}
