"use client"
import { useState } from "react"
import { X, Phone, Mail, Shield, ChevronDown } from "lucide-react"

interface Props {
  onSuccess: (viewer: any) => void
  onClose?: () => void
  forced?: boolean
  projectName?: string
}

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+1", flag: "🇺🇸", label: "USA" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+65", flag: "🇸🇬", label: "Singapore" },
  { code: "+60", flag: "🇲🇾", label: "Malaysia" },
  { code: "+966", flag: "🇸🇦", label: "Saudi Arabia" },
]

const PURPOSE_OPTIONS = [
  { value: "investor", label: "🏦 Investor", desc: "Looking to invest for returns" },
  { value: "self-use", label: "🏠 Self Use", desc: "Buying for personal use" },
  { value: "both", label: "🎯 Both", desc: "Investor + self use" },
  { value: "nri", label: "✈️ NRI Investor", desc: "Non-resident Indian investor" },
  { value: "commercial", label: "🏢 Commercial", desc: "Looking for commercial property" },
]

export default function PortalLoginModal({ onSuccess, onClose, forced = false, projectName }: Props) {
  const [step, setStep] = useState<"method" | "phone" | "email" | "otp-wa" | "otp-email" | "profile">("method")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [purpose, setPurpose] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCC, setShowCC] = useState(false)
  const [viewerData, setViewerData] = useState<any>(null)

  async function sendWhatsAppOTP() {
    if (!phone || phone.length < 7) { setError("Enter a valid phone number"); return }
    setLoading(true); setError("")
    const res = await fetch("/api/portal/auth/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, countryCode })
    })
    const d = await res.json()
    if (d.success) setStep("otp-wa")
    else setError(d.message || "Failed to send OTP")
    setLoading(false)
  }

  async function sendEmailOTP() {
    if (!email || !email.includes("@")) { setError("Enter a valid email"); return }
    setLoading(true); setError("")
    const res = await fetch("/api/portal/auth/email-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", email })
    })
    const d = await res.json()
    if (d.success) setStep("otp-email")
    else setError(d.message || "Failed to send OTP")
    setLoading(false)
  }

  async function verifyWhatsAppOTP() {
    if (!otp || otp.length < 6) { setError("Enter 6-digit OTP"); return }
    setLoading(true); setError("")
    const res = await fetch("/api/portal/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, countryCode, otp })
    })
    const d = await res.json()
    if (d.success) {
      setViewerData(d.viewer)
      if (d.needsProfile || !d.viewer?.purpose) setStep("profile")
      else onSuccess(d.viewer)
    } else setError(d.message || "Invalid OTP")
    setLoading(false)
  }

  async function verifyEmailOTP() {
    if (!otp || otp.length < 6) { setError("Enter 6-digit OTP"); return }
    setLoading(true); setError("")
    const res = await fetch("/api/portal/auth/email-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", email, otp })
    })
    const d = await res.json()
    if (d.success) {
      setViewerData(d.viewer)
      if (d.needsProfile || !d.viewer?.purpose) setStep("profile")
      else onSuccess(d.viewer)
    } else setError(d.message || "Invalid OTP")
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoading(true)
    window.location.href = "/api/auth/signin/google?callbackUrl=" + encodeURIComponent(window.location.href + "?portal_login=google")
  }

  async function saveProfile() {
    if (!firstName) { setError("First name is required"); return }
    if (!purpose) { setError("Please select your purpose"); return }
    setLoading(true)
    if (viewerData?.id) {
      await fetch("/api/portal/auth/me", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, purpose })
      })
    }
    onSuccess({ ...viewerData, firstName, lastName, purpose })
    setLoading(false)
  }

  const selectedCC = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 text-white relative" style={{background: "linear-gradient(135deg, #422D83, #4A3C8D)"}}>
          {!forced && onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">PropSarathi Portal</h2>
              <p className="text-white/70 text-xs">Exclusive property listings</p>
            </div>
          </div>
          {projectName && (
            <div className="bg-white/15 rounded-xl p-2.5 text-sm mt-2">
              Viewing <span className="font-bold">{projectName}</span> — login for pricing & floor plans
            </div>
          )}
        </div>

        <div className="p-6">
          {/* STEP: method */}
          {step === "method" && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-4">Choose how to continue</p>

              {/* Google */}
              <button onClick={handleGoogleLogin} disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* WhatsApp */}
              <button onClick={() => setStep("phone")}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-green-300 hover:bg-green-50 transition">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Continue with WhatsApp OTP
              </button>

              {/* Email */}
              <button onClick={() => setStep("email")}
                className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-blue-300 hover:bg-blue-50 transition">
                <Mail className="w-5 h-5 text-blue-500" />
                Continue with Email OTP
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">By continuing, you agree to our Terms &amp; Privacy Policy</p>
            </div>
          )}

          {/* STEP: phone */}
          {step === "phone" && (
            <div className="space-y-4">
              <button onClick={() => { setStep("method"); setError("") }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">← Back</button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowCC(!showCC)}
                      className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 transition min-w-[90px]">
                      <span>{selectedCC.flag}</span>
                      <span>{selectedCC.code}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {showCC && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-10 w-52 overflow-hidden">
                        {COUNTRY_CODES.map(cc => (
                          <button key={cc.code} type="button" onClick={() => { setCountryCode(cc.code); setShowCC(false) }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-left ${cc.code === countryCode ? "bg-purple-50 text-[#422D83] font-medium" : "text-gray-700"}`}>
                            <span>{cc.flag}</span><span>{cc.label}</span><span className="ml-auto text-gray-400">{cc.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Phone number" onKeyDown={e => e.key === 'Enter' && sendWhatsAppOTP()}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={sendWhatsAppOTP} disabled={loading}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{backgroundColor: "#F17322"}}>
                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Phone className="w-4 h-4" />}
                {loading ? "Sending..." : "Send OTP on WhatsApp"}
              </button>
            </div>
          )}

          {/* STEP: email */}
          {step === "email" && (
            <div className="space-y-4">
              <button onClick={() => { setStep("method"); setError("") }} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && sendEmailOTP()}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={sendEmailOTP} disabled={loading}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{backgroundColor: "#F17322"}}>
                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? "Sending..." : "Send OTP to Email"}
              </button>
            </div>
          )}

          {/* STEP: otp-wa */}
          {step === "otp-wa" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">OTP sent to <strong>{countryCode} {phone}</strong> on WhatsApp</p>
              </div>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •" autoFocus onKeyDown={e => e.key === 'Enter' && verifyWhatsAppOTP()}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button onClick={verifyWhatsAppOTP} disabled={loading || otp.length < 6}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                style={{backgroundColor: "#F17322"}}>
                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setStep("phone"); setError(""); setOtp("") }} className="flex-1 text-sm text-gray-500 hover:text-gray-700 py-1">← Change number</button>
                <button onClick={sendWhatsAppOTP} disabled={loading} className="flex-1 text-sm text-[#422D83] hover:text-[#371f6e] py-1">Resend OTP</button>
              </div>
            </div>
          )}

          {/* STEP: otp-email */}
          {step === "otp-email" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">OTP sent to <strong>{email}</strong></p>
              </div>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •" autoFocus onKeyDown={e => e.key === 'Enter' && verifyEmailOTP()}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button onClick={verifyEmailOTP} disabled={loading || otp.length < 6}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60"
                style={{backgroundColor: "#F17322"}}>
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              <button onClick={() => { setStep("email"); setError(""); setOtp("") }} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">← Change email</button>
            </div>
          )}

          {/* STEP: profile */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="font-semibold text-gray-800">Almost there! Tell us about yourself</p>
                <p className="text-xs text-gray-400 mt-1">Helps us show you the most relevant properties</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mehta"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#422D83]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">I am looking to *</label>
                <div className="grid grid-cols-1 gap-2">
                  {PURPOSE_OPTIONS.map(p => (
                    <button key={p.value} onClick={() => setPurpose(p.value)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left text-sm transition ${purpose === p.value ? 'border-[#422D83] bg-[#f5f3fd]' : 'border-gray-200 hover:border-gray-300'}`}>
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
              <button onClick={saveProfile} disabled={loading}
                className="w-full text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-60"
                style={{backgroundColor: "#F17322"}}>
                {loading ? "Saving..." : "Continue to Portal →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
