'use client'

import { useState, useEffect, useRef } from 'react'
import { X, UserCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  shareCode: string
  redirectPath: string
  sharerName?: string
  rmName?: string
}

type Phase = 'soft' | 'hard'

export default function ReferralTimer({ shareCode, redirectPath, sharerName, rmName }: Props) {
  const [phase, setPhase] = useState<Phase>('soft')
  const [seconds, setSeconds] = useState(30)
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          if (phase === 'soft') {
            // move to hard wall at 60s
            setPhase('hard')
            setSeconds(30) // another 30s before hard wall
            timerRef.current = setInterval(() => {
              setSeconds(s2 => {
                if (s2 <= 1) {
                  clearInterval(timerRef.current!)
                  return 0
                }
                return s2 - 1
              })
            }, 1000)
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loginUrl = `/client/login?redirect=${encodeURIComponent(redirectPath)}&ref=${shareCode}`

  if (dismissed) return null

  // Hard wall — full-screen overlay, cannot dismiss
  if (phase === 'hard' && seconds === 0) {
    return (
      <div className="fixed inset-0 z-[190] bg-white/95 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <UserCircle size={32} className="text-blue-600" />
          </div>
          <div>
            {sharerName && (
              <p className="text-sm text-gray-500 mb-1">
                <strong>{sharerName}</strong> shared this property with you
              </p>
            )}
            <h2 className="text-xl font-bold text-gray-900">Create a free account to continue</h2>
            <p className="text-sm text-gray-500 mt-2">
              {rmName ? `Your advisor ${rmName} is ready to help.` : 'Get personalised advice from our team.'}
            </p>
          </div>
          <Link
            href={loginUrl}
            className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Login / Sign up — Free
          </Link>
          <p className="text-xs text-gray-400">No spam. No credit card needed.</p>
        </div>
      </div>
    )
  }

  // Soft banner — bottom strip, dismissible
  return (
    <div className="fixed bottom-0 inset-x-0 z-[180] bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        <Clock size={18} className="shrink-0" />
        <p className="text-sm truncate">
          {sharerName ? (
            <><strong>{sharerName}</strong> shared this property — </>
          ) : (
            'You were invited to view this — '
          )}
          <Link href={loginUrl} className="underline font-semibold">
            Login to unlock all details
          </Link>
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs opacity-75 font-mono">{seconds}s</span>
        <button onClick={() => setDismissed(true)} className="opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
