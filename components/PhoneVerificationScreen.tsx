'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Phone, Mail, Shield, RefreshCw } from 'lucide-react'

interface Props {
  fingerprint: string
  userEmail?: string
  onVerified: () => void
  onDismiss?: () => void
}

type Step = 'phone' | 'otp_whatsapp' | 'email_fallback' | 'otp_email'

export default function PhoneVerificationScreen({ fingerprint, userEmail, onVerified, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [waFailures, setWaFailures] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function startCooldown(secs: number) {
    setCooldown(secs)
    timerRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
  }

  async function sendWhatsAppOTP() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); setLoading(false); return }
      setStep('otp_whatsapp')
      startCooldown(30)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  async function verifyWhatsAppOTP() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/client/verify-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, fingerprint }),
      })
      const data = await res.json()
      if (data.success) { onVerified(); return }
      const failures = waFailures + 1
      setWaFailures(failures)
      if (failures >= 3) {
        setError('Too many incorrect attempts. Please verify via email instead.')
        setStep('email_fallback')
      } else {
        setError(data.error || 'Incorrect OTP. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  async function sendEmailOTP() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/client/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send email'); setLoading(false); return }
      setStep('otp_email')
      startCooldown(30)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  async function verifyEmailOTP() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/client/verify-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // email OTP stored under phone = 'email:<email>'
        body: JSON.stringify({ phone: `email:${userEmail}`, otp, fingerprint }),
      })
      const data = await res.json()
      if (data.success) { onVerified(); return }
      setError(data.error || 'Invalid OTP.')
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {onDismiss && (
          <button onClick={onDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Verify your identity</h2>
            <p className="text-xs text-gray-500">One-time verification for secure documents</p>
          </div>
        </div>

        {/* STEP: phone input */}
        {step === 'phone' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter your WhatsApp number to receive a verification code.</p>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="WhatsApp number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => e.key === 'Enter' && sendWhatsAppOTP()}
              />
              <button
                onClick={sendWhatsAppOTP}
                disabled={loading || !phone.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Phone size={14} />
                {loading ? '…' : 'Send'}
              </button>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}

        {/* STEP: WhatsApp OTP */}
        {step === 'otp_whatsapp' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to <strong>{phone}</strong> on WhatsApp.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => e.key === 'Enter' && verifyWhatsAppOTP()}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              onClick={verifyWhatsAppOTP}
              disabled={loading || otp.length < 6}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <button
                onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                className="underline"
              >
                Change number
              </button>
              <button
                onClick={sendWhatsAppOTP}
                disabled={cooldown > 0}
                className="flex items-center gap-1 disabled:opacity-40"
              >
                <RefreshCw size={12} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: email fallback prompt */}
        {step === 'email_fallback' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Too many WhatsApp attempts. We&apos;ll send a code to <strong>{userEmail}</strong> instead.
            </p>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              onClick={sendEmailOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail size={14} />
              {loading ? 'Sending…' : 'Send code to email'}
            </button>
          </div>
        )}

        {/* STEP: email OTP */}
        {step === 'otp_email' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to <strong>{userEmail}</strong>.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => e.key === 'Enter' && verifyEmailOTP()}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              onClick={verifyEmailOTP}
              disabled={loading || otp.length < 6}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            <button
              onClick={sendEmailOTP}
              disabled={cooldown > 0}
              className="w-full text-xs text-gray-500 flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <RefreshCw size={12} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
