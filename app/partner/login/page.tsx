'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PhoneInput } from '@/components/PhoneInput'
import { Loader2 } from 'lucide-react'

type Step = 'phone' | 'otp'

export default function PartnerLoginPage() {
  const router = useRouter()
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setStep('otp')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setError('')
    if (!otp.trim()) { setError('Enter the OTP'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/partner/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: countryCode + phone, otp }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error || 'Invalid OTP')
      router.replace('/partner')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="PropSarathi" width={56} height={56} className="rounded-xl mb-3" />
          <h1 className="text-xl font-bold text-gray-900">Partner Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your partner account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
          {step === 'phone' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  countryCode={countryCode}
                  onCountryChange={setCountryCode}
                  placeholder="Enter your number"
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
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                <p className="text-xs text-gray-500 mb-3">Sent to {countryCode} {phone} via WhatsApp</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 tracking-widest text-center text-lg font-semibold"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify & Sign In
              </button>
              <button onClick={() => { setStep('phone'); setOtp(''); setError('') }} className="w-full text-xs text-gray-500 hover:text-gray-700">
                Change number
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Not a partner?{' '}
          <a href="mailto:partners@propsarathi.com" className="text-violet-600 hover:underline">
            Contact your RM
          </a>
        </p>
      </div>
    </div>
  )
}
