'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { PhoneInput } from '@/components/PhoneInput'
import { OtpInput } from '@/components/OtpInput'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

type Mode = 'google' | 'whatsapp'
type OtpStep = 'phone' | 'otp'

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [partnerName, setPartnerName] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  const [mode, setMode] = useState<Mode>('whatsapp')
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpStep, setOtpStep] = useState<OtpStep>('phone')

  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setTokenValid(false); setVerifying(false); return }
    fetch(`/api/partner/auth/setup?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setPartnerName(d.name || ''); setTokenValid(true) }
        else setTokenValid(false)
      })
      .catch(() => setTokenValid(false))
      .finally(() => setVerifying(false))
  }, [token])

  async function sendOtp() {
    setError('')
    if (!phone.trim()) { setError('Enter your phone number'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: countryCode + phone }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error || 'Failed to send OTP')
      setOtpStep('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function completeSetup(payload: Record<string, string>) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/partner/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...payload }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error || 'Setup failed')
      router.replace('/partner')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Invalid or expired link</h2>
        <p className="text-sm text-gray-500 mt-2 text-center">This setup link has expired or is invalid. Please contact your RM for a new invite.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="PropSarathi" width={56} height={56} className="rounded-xl mb-3" />
          <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
          <h1 className="text-xl font-bold text-gray-900">Welcome{partnerName ? `, ${partnerName.split(' ')[0]}` : ''}!</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">Set up your partner account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Mode tabs */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['whatsapp', 'google'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-xs font-medium transition-colors capitalize ${mode === m ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {m === 'whatsapp' ? 'WhatsApp OTP' : 'Google'}
              </button>
            ))}
          </div>

          {mode === 'whatsapp' && otpStep === 'phone' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your WhatsApp Number</label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  countryCode={countryCode}
                  onCountryChange={setCountryCode}
                  placeholder="Enter your number"
                  context="partner"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send OTP via WhatsApp
              </button>
            </>
          )}

          {mode === 'whatsapp' && otpStep === 'otp' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                <p className="text-xs text-gray-500 mb-3">Sent to {countryCode} {phone}</p>
                <OtpInput length={6} disabled={loading}
                  onComplete={(code) => { setOtp(code); completeSetup({ phone: countryCode + phone, otp: code }) }} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={() => completeSetup({ phone: countryCode + phone, otp })}
                disabled={loading}
                className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Complete Setup
              </button>
              <button onClick={() => { setOtpStep('phone'); setOtp(''); setError('') }} className="w-full text-xs text-gray-500 hover:text-gray-700">
                Change number
              </button>
            </>
          )}

          {mode === 'google' && (
            <>
              <p className="text-sm text-gray-600 text-center">
                Click below to sign in with your Google account and complete setup.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div id="g_id_setup_btn" className="flex justify-center">
                <div
                  className="g_id_signin"
                  data-type="standard"
                  data-size="large"
                  data-theme="outline"
                  data-text="continue_with"
                  data-shape="rectangular"
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Google sign-in will appear automatically via One Tap
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PartnerSetupPage() {
  return (
    <Suspense>
      <SetupContent />
    </Suspense>
  )
}
