'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogoCompact } from '@/components/Logo'

// ─── Shared helpers ───────────────────────────────────────────────────────────

const GOOGLE_ERRORS: Record<string, string> = {
  google_denied: 'Google sign-in was cancelled.',
  google_failed: 'Google sign-in failed. Please try again.',
  google_token_failed: 'Could not complete Google sign-in. Please try again.',
  google_profile_failed: 'Could not fetch your Google profile. Please try again.',
  google_no_email: 'Your Google account has no email address.',
  google_server_error: 'A server error occurred. Please try again.',
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-400 font-medium">{text}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

// ─── Google button ────────────────────────────────────────────────────────────

function GoogleButton({ redirect }: { redirect: string }) {
  return (
    <button
      type="button"
      onClick={() => { window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirect)}` }}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  )
}

// ─── Email + password form ────────────────────────────────────────────────────

function EmailForm({ redirect }: { redirect: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
      router.push(redirect)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/20 focus:border-[#422D83] transition-colors bg-gray-50/50"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/20 focus:border-[#422D83] transition-colors bg-gray-50/50 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#422D83] hover:bg-[#2d1a60] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Signing in…
          </span>
        ) : 'Sign In with Email'}
      </button>
    </form>
  )
}

// ─── WhatsApp OTP flow ────────────────────────────────────────────────────────

const RESEND_COOLDOWN = 30 // seconds

function WhatsAppOTP({ redirect }: { redirect: string }) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const otpRef = useRef<HTMLInputElement>(null)

  // Clean up timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
  }

  // Validate phone: 10 digits (Indian) or E.164
  function validatePhone(val: string) {
    const digits = val.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 13
  }

  async function sendOTP() {
    setError('')
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (e.g. 98800 00000)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); setLoading(false); return }
      setStep('otp')
      setInfo('OTP sent! Check your WhatsApp.')
      startCooldown()
      setTimeout(() => otpRef.current?.focus(), 100)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  async function verifyOTP() {
    setError('')
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid OTP'); setLoading(false); return }
      router.push(redirect)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function resendOTP() {
    if (cooldown > 0) return
    setOtp('')
    setError('')
    setInfo('')
    await sendOTP()
  }

  return (
    <div className="space-y-3">
      {step === 'phone' ? (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">WhatsApp Number</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50/50 text-sm text-gray-600 font-medium select-none whitespace-nowrap">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d\s\-+()]/g, ''))}
                placeholder="98800 00000"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-colors bg-gray-50/50"
                onKeyDown={e => e.key === 'Enter' && sendOTP()}
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>}
          <button
            type="button"
            onClick={sendOTP}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : <WhatsAppIcon />}
            {loading ? 'Sending OTP…' : 'Send OTP via WhatsApp'}
          </button>
        </>
      ) : (
        <>
          {/* Phone display + change */}
          <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <WhatsAppIcon />
              <span className="text-sm text-gray-700 font-medium">+91 {phone}</span>
            </div>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); setInfo('') }}
              className="text-xs text-[#422D83] hover:underline font-medium"
            >
              Change
            </button>
          </div>

          {info && <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-100">{info}</p>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Enter 6-digit OTP</label>
            <input
              ref={otpRef}
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="• • • • • •"
              maxLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-colors bg-gray-50/50 placeholder:tracking-widest placeholder:text-gray-300"
              onKeyDown={e => e.key === 'Enter' && verifyOTP()}
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">{error}</p>}

          <button
            type="button"
            onClick={verifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verifying…
              </span>
            ) : 'Verify OTP & Sign In'}
          </button>

          <div className="text-center">
            {cooldown > 0 ? (
              <p className="text-xs text-gray-400">Resend OTP in <span className="font-semibold text-gray-600">{cooldown}s</span></p>
            ) : (
              <button type="button" onClick={resendOTP} className="text-xs text-[#422D83] hover:underline font-medium">
                Didn&apos;t receive it? Resend OTP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main login page ──────────────────────────────────────────────────────────

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/client'
  const googleError = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoCompact />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to save properties and track enquiries</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          {/* Google OAuth error */}
          {googleError && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2.5 border border-red-100 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {GOOGLE_ERRORS[googleError] || 'Google sign-in failed. Please try again.'}
            </div>
          )}

          {/* ── 1. Google ── */}
          <GoogleButton redirect={redirect} />

          {/* ── Divider ── */}
          <Divider text="or sign in with email" />

          {/* ── 2. Email + password ── */}
          <EmailForm redirect={redirect} />

          {/* ── Divider ── */}
          <Divider text="or continue with WhatsApp" />

          {/* ── 3. WhatsApp OTP ── */}
          <WhatsAppOTP redirect={redirect} />

          {/* Footer links */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              New here?{' '}
              <Link
                href={`/client/register${redirect !== '/client' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-[#422D83] font-semibold hover:underline"
              >
                Create account
              </Link>
            </span>
            <Link href="/" className="hover:text-gray-700 transition-colors">Back to site</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in you agree to our{' '}
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
