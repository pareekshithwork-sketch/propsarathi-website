"use client"
import { useState, useRef, useEffect } from "react"
import { X, Mail, Shield, CheckCircle2 } from "lucide-react"
import { PhoneInput } from "@/components/PhoneInput"

interface Props {
  onSuccess: (viewer: any) => void
  onClose?: () => void
  forced?: boolean
  projectName?: string
}

const PURPOSE_OPTIONS = [
  { value: "investor", label: "🏦 Investor", desc: "Looking to invest for returns" },
  { value: "self-use", label: "🏠 Self Use", desc: "Buying for personal use" },
  { value: "both", label: "🎯 Both", desc: "Investor + self use" },
  { value: "nri", label: "✈️ NRI Investor", desc: "Non-resident Indian investor" },
  { value: "commercial", label: "🏢 Commercial", desc: "Looking for commercial property" },
]

const RESEND_COOLDOWN = 30

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
}

function OtpInput({
  value,
  onChange,
  onComplete,
}: {
  value: string
  onChange: (v: string) => void
  onComplete?: () => void
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
    onChange(v)
    if (v.length === 6 && onComplete) onComplete()
  }
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      placeholder="• • • • • •"
      maxLength={6}
      autoFocus
      className="w-full border border-gray-200 rounded-xl px-3 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#422D83]/30 focus:border-[#422D83] transition-colors bg-gray-50/50 placeholder:tracking-widest placeholder:text-gray-200"
    />
  )
}

function ResendButton({ onResend, disabled }: { onResend: () => void; disabled: boolean }) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0 }
        return c - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  if (cooldown > 0) {
    return <p className="text-xs text-gray-400 text-center">Resend in <strong>{cooldown}s</strong></p>
  }
  return (
    <button
      type="button"
      onClick={onResend}
      disabled={disabled}
      className="w-full text-xs text-[#422D83] hover:underline disabled:opacity-50 text-center"
    >
      Resend OTP
    </button>
  )
}

export default function PortalLoginModal({ onSuccess, onClose, forced = false, projectName }: Props) {
  type Step = "method" | "phone-otp" | "email-otp" | "profile" | "email-only-input" | "email-only-otp"
  const [step, setStep] = useState<Step>("method")

  // Phone OTP state
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [phoneSent, setPhoneSent] = useState(false)

  // Email OTP state
  const [email, setEmail] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // Profile state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [purpose, setPurpose] = useState("")
  const [viewerData, setViewerData] = useState<any>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function clearError() { setError("") }

  // ── Step indicator ─────────────────────────────────────────────────────────
  const showSteps = step === "phone-otp" || step === "email-otp"
  const phoneVerified = step === "email-otp"

  // ── GOOGLE ─────────────────────────────────────────────────────────────────
  function handleGoogleLogin() {
    window.location.href = "/api/auth/google?redirect=/client"
  }

  // ── PHONE OTP ──────────────────────────────────────────────────────────────
  async function sendPhoneOtp() {
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      setError("Enter a valid phone number"); return
    }
    setLoading(true); clearError()
    try {
      const res = await fetch("/api/auth/otp/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), countryCode, action: "send" }),
      })
      const d = await res.json()
      if (d.success) { setPhoneSent(true); setPhoneOtp("") }
      else setError(d.error || "Failed to send OTP")
    } catch { setError("Network error. Try again.") }
    setLoading(false)
  }

  async function verifyPhoneOtp() {
    if (phoneOtp.length < 6) { setError("Enter 6-digit OTP"); return }
    setLoading(true); clearError()
    try {
      const res = await fetch("/api/auth/otp/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), countryCode, action: "verify", otp: phoneOtp }),
      })
      const d = await res.json()
      if (d.success) { setStep("email-otp"); setEmailSent(false); setEmailOtp("") }
      else setError(d.error || "Invalid OTP")
    } catch { setError("Network error. Try again.") }
    setLoading(false)
  }

  // ── EMAIL OTP (within combined flow) ────────────────────────────────────────
  async function sendEmailOtp() {
    if (!email || !email.includes("@")) { setError("Enter a valid email"); return }
    setLoading(true); clearError()
    try {
      const res = await fetch("/api/auth/otp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "send" }),
      })
      const d = await res.json()
      if (d.success) { setEmailSent(true); setEmailOtp("") }
      else setError(d.error || "Failed to send OTP")
    } catch { setError("Network error. Try again.") }
    setLoading(false)
  }

  async function verifyEmailOtpAndComplete() {
    if (emailOtp.length < 6) { setError("Enter 6-digit OTP"); return }
    setLoading(true); clearError()
    try {
      // First verify the email OTP
      const verifyRes = await fetch("/api/auth/otp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "verify", otp: emailOtp }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) { setError(verifyData.error || "Invalid OTP"); setLoading(false); return }

      // Then call complete to create session
      const completeRes = await fetch("/api/auth/otp/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), countryCode, email }),
      })
      const completeData = await completeRes.json()
      if (completeData.success) {
        onSuccess({ phone, email, verified: true })
        if (completeData.redirectTo) window.location.href = completeData.redirectTo
      } else {
        setError(completeData.error || "Login failed")
      }
    } catch { setError("Network error. Try again.") }
    setLoading(false)
  }

  // ── EMAIL-ONLY OTP flow (fallback) ─────────────────────────────────────────
  async function sendEmailOnlyOtp() {
    if (!email || !email.includes("@")) { setError("Enter a valid email"); return }
    setLoading(true); clearError()
    try {
      const res = await fetch("/api/portal/auth/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email }),
      })
      const d = await res.json()
      if (d.success) setStep("email-only-otp")
      else setError(d.error || d.message || "Failed to send OTP")
    } catch { setError("Network error. Try again.") }
    setLoading(false)
  }

  async function verifyEmailOnlyOtp() {
    if (!emailOtp || emailOtp.length < 6) { setError("Enter 6-digit OTP"); return }
    setLoading(true); clearError()
    try {
      const res = await fetch("/api/portal/auth/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, otp: emailOtp }),
      })
      const d = await res.json()
      if (d.success) {
        setViewerData(d.viewer)
        if (d.needsProfile || !d.viewer?.purpose) setStep("profile")
        else onSuccess(d.viewer)
      } else setError(d.error || d.message || "Invalid OTP")
    } catch { setError("Network error. Try again.") }
    setLoading(false)
  }

  async function saveProfile() {
    if (!firstName) { setError("First name is required"); return }
    if (!purpose) { setError("Please select your purpose"); return }
    setLoading(true)
    if (viewerData?.id) {
      await fetch("/api/portal/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, purpose }),
      })
    }
    onSuccess({ ...viewerData, firstName, lastName, purpose })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ── Header ── */}
        <div className="p-6 text-white relative" style={{ background: "linear-gradient(135deg, #422D83, #5a3fa8)" }}>
          {!forced && onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">PropSarathi Portal</h2>
              <p className="text-white/70 text-xs">Exclusive property listings</p>
            </div>
          </div>
          {projectName && (
            <div className="bg-white/15 rounded-xl p-2.5 text-sm mt-3">
              Viewing <span className="font-bold">{projectName}</span> — login for pricing &amp; floor plans
            </div>
          )}

          {/* Step indicator for combined flow */}
          {showSteps && (
            <div className="flex items-center gap-2 mt-4">
              {["WhatsApp", "Email"].map((label, i) => {
                const done = i === 0 ? phoneVerified : false
                const active = i === 0 ? !phoneVerified : phoneVerified
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    {i > 0 && <div className={`flex-1 h-px w-8 ${phoneVerified ? 'bg-white/60' : 'bg-white/20'}`} />}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      done ? 'bg-green-400 text-white' : active ? 'bg-white text-[#422D83]' : 'bg-white/20 text-white/60'
                    }`}>
                      {done ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">

          {/* ══ STEP: method ══════════════════════════════════════════════════ */}
          {step === "method" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4">Choose how to continue</p>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Combined WhatsApp + Email OTP */}
              <button
                onClick={() => { setStep("phone-otp"); setPhoneSent(false); clearError() }}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-[#422D83]/40 hover:bg-[#422D83]/5 transition"
              >
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <span>Continue with WhatsApp + Email OTP</span>
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-normal">Recommended</span>
              </button>

              {/* Email OTP only */}
              <button
                onClick={() => { setStep("email-only-input"); setEmail(""); setEmailOtp(""); clearError() }}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <Mail className="w-5 h-5 text-blue-500" />
                Continue with Email OTP only
              </button>

              <p className="text-xs text-gray-400 text-center pt-2">By continuing, you agree to our Terms &amp; Privacy Policy</p>
            </div>
          )}

          {/* ══ STEP: phone-otp ═══════════════════════════════════════════════ */}
          {step === "phone-otp" && (
            <div className="space-y-4">
              <button onClick={() => { setStep("method"); clearError() }} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
              <p className="text-sm font-semibold text-gray-800">Step 1: Verify WhatsApp</p>

              {!phoneSent ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">WhatsApp Number</label>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      countryCode={countryCode}
                      onCountryChange={setCountryCode}
                      placeholder="Phone number"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    onClick={sendPhoneOtp}
                    disabled={loading}
                    className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    {loading ? <Spinner /> : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    )}
                    {loading ? "Sending…" : "Send OTP on WhatsApp"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700">
                    OTP sent to <strong>{countryCode} {phone}</strong> on WhatsApp
                  </div>
                  <OtpInput value={phoneOtp} onChange={setPhoneOtp} onComplete={verifyPhoneOtp} />
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    onClick={verifyPhoneOtp}
                    disabled={loading || phoneOtp.length < 6}
                    className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#422D83" }}
                  >
                    {loading ? <Spinner /> : null}
                    {loading ? "Verifying…" : "Verify & Continue →"}
                  </button>
                  <ResendButton onResend={sendPhoneOtp} disabled={loading} />
                  <button onClick={() => { setPhoneSent(false); setPhoneOtp(""); clearError() }} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                    ← Change number
                  </button>
                </>
              )}
            </div>
          )}

          {/* ══ STEP: email-otp ═══════════════════════════════════════════════ */}
          {step === "email-otp" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                WhatsApp verified ✓
              </div>
              <p className="text-sm font-semibold text-gray-800">Step 2: Verify Email</p>

              {!emailSent ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      onKeyDown={e => e.key === 'Enter' && sendEmailOtp()}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/20 focus:border-[#422D83] transition-colors"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    onClick={sendEmailOtp}
                    disabled={loading}
                    className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#422D83" }}
                  >
                    {loading ? <Spinner /> : <Mail className="w-4 h-4" />}
                    {loading ? "Sending…" : "Send OTP to Email"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
                    OTP sent to <strong>{email}</strong>
                  </div>
                  <OtpInput value={emailOtp} onChange={setEmailOtp} onComplete={verifyEmailOtpAndComplete} />
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    onClick={verifyEmailOtpAndComplete}
                    disabled={loading || emailOtp.length < 6}
                    className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#422D83" }}
                  >
                    {loading ? <Spinner /> : null}
                    {loading ? "Completing login…" : "Verify & Enter Portal →"}
                  </button>
                  <ResendButton onResend={sendEmailOtp} disabled={loading} />
                  <button onClick={() => { setEmailSent(false); setEmailOtp(""); clearError() }} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                    ← Change email
                  </button>
                </>
              )}
            </div>
          )}

          {/* ══ STEP: email-only-input ════════════════════════════════════════ */}
          {step === "email-only-input" && (
            <div className="space-y-4">
              <button onClick={() => { setStep("method"); clearError() }} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && sendEmailOnlyOtp()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/20 focus:border-[#422D83] transition-colors"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={sendEmailOnlyOtp}
                disabled={loading}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#422D83" }}
              >
                {loading ? <Spinner /> : <Mail className="w-4 h-4" />}
                {loading ? "Sending…" : "Send OTP to Email"}
              </button>
            </div>
          )}

          {/* ══ STEP: email-only-otp ══════════════════════════════════════════ */}
          {step === "email-only-otp" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">OTP sent to <strong>{email}</strong></p>
              </div>
              <OtpInput value={emailOtp} onChange={setEmailOtp} onComplete={verifyEmailOnlyOtp} />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                onClick={verifyEmailOnlyOtp}
                disabled={loading || emailOtp.length < 6}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#422D83" }}
              >
                {loading ? <Spinner /> : null}
                {loading ? "Verifying…" : "Verify & Continue →"}
              </button>
              <ResendButton onResend={sendEmailOnlyOtp} disabled={loading} />
              <button onClick={() => { setStep("email-only-input"); setEmailOtp(""); clearError() }} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                ← Change email
              </button>
            </div>
          )}

          {/* ══ STEP: profile ═════════════════════════════════════════════════ */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="font-semibold text-gray-800">Almost there! Tell us about yourself</p>
                <p className="text-xs text-gray-400 mt-1">Helps us show you the most relevant properties</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Rahul"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/20 focus:border-[#422D83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                  <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Mehta"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]/20 focus:border-[#422D83]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">I am looking to *</label>
                <div className="grid grid-cols-1 gap-2">
                  {PURPOSE_OPTIONS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPurpose(p.value)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left text-sm transition ${
                        purpose === p.value ? 'border-[#422D83] bg-[#f5f3fd]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{p.label.split(' ')[0]}</span>
                      <div>
                        <p className="font-medium text-gray-800">{p.label.split(' ').slice(1).join(' ')}</p>
                        <p className="text-xs text-gray-400">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={saveProfile}
                disabled={loading}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60"
                style={{ backgroundColor: "#422D83" }}
              >
                {loading ? "Saving…" : "Continue to Portal →"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
