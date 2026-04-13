"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Header from "@/components/Header"
import SharedFooter from "@/components/SharedFooter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  LogOut,
  TrendingUp,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Shield,
  ArrowLeft,
  Loader2,
  Home,
  BarChart3,
  Send,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Partner {
  name: string
  email: string
  status: string
  partnerId: string
}

type View = "login" | "register" | "forgot" | "dashboard" | "reset"

// ─── Country codes ────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91 India" },
  { code: "+971", label: "🇦🇪 +971 UAE" },
  { code: "+1", label: "🇺🇸 +1 USA" },
  { code: "+44", label: "🇬🇧 +44 UK" },
  { code: "+65", label: "🇸🇬 +65 Singapore" },
  { code: "+61", label: "🇦🇺 +61 Australia" },
  { code: "+49", label: "🇩🇪 +49 Germany" },
  { code: "+33", label: "🇫🇷 +33 France" },
]

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" }
  if (score <= 2) return { score, label: "Fair", color: "bg-yellow-500" }
  if (score <= 3) return { score, label: "Good", color: "bg-blue-500" }
  return { score, label: "Strong", color: "bg-green-500" }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PartnerPortalPage() {
  const [view, setView] = useState<View>("login")
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("leads")

  // ── Auth check on mount ──
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/partner/me")
        const data = await res.json()
        if (data.success && data.partner) {
          setPartner(data.partner)
          setView("dashboard")
        } else {
          setView("login")
        }
      } catch {
        setView("login")
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLoginSuccess = useCallback((partnerData: Partner) => {
    setPartner(partnerData)
    setView("dashboard")
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/partner/logout", { method: "POST" })
    setPartner(null)
    setView("login")
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Partner Portal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-12 px-4">
        {view === "dashboard" && partner ? (
          <Dashboard partner={partner} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : view === "forgot" ? (
          <ForgotPasswordView onBack={() => setView("login")} />
        ) : view === "reset" ? (
          <ResetPasswordView onBack={() => setView("login")} />
        ) : (
          <AuthView view={view} setView={setView} onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
      <SharedFooter />
    </div>
  )
}

// ─── Auth View (Login / Register tabs) ───────────────────────────────────────

function AuthView({
  view,
  setView,
  onLoginSuccess,
}: {
  view: View
  setView: (v: View) => void
  onLoginSuccess: (p: Partner) => void
}) {
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Partner Portal</h1>
        <p className="text-gray-600 mt-2">PropSarathi Real Estate Network</p>
      </div>

      <Card className="shadow-lg border-0">
        <Tabs value={view === "register" ? "register" : "login"} onValueChange={(v) => setView(v as View)}>
          <TabsList className="w-full rounded-none border-b h-12">
            <TabsTrigger value="login" className="flex-1 text-base">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1 text-base">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="p-0">
            <LoginForm onSuccess={onLoginSuccess} onForgot={() => setView("forgot")} />
          </TabsContent>
          <TabsContent value="register" className="p-0">
            <RegisterForm onSwitchToLogin={() => setView("login")} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess, onForgot }: { onSuccess: (p: Partner) => void; onForgot: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success) {
        // Fetch fresh me data
        const meRes = await fetch("/api/auth/partner/me")
        const meData = await meRes.json()
        if (meData.success) {
          onSuccess(meData.partner)
        } else {
          onSuccess(data.partner)
        }
      } else {
        setError(data.message || "Login failed")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email Address</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onForgot}
        className="text-sm text-blue-600 hover:underline w-full text-right"
      >
        Forgot Password?
      </button>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">or</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled>
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google Login — Coming Soon
      </Button>
    </form>
  )
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    confirmEmail: "",
    countryCode: "+91",
    phone: "",
    confirmPhone: "",
    panNumber: "",
    aadharNumber: "",
    occupation: "",
    assignedRM: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [partnerId, setPartnerId] = useState("")

  const passwordStrength = getPasswordStrength(form.password)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.email !== form.confirmEmail) {
      setError("Email addresses do not match")
      return
    }
    if (form.phone !== form.confirmPhone) {
      setError("Phone numbers do not match")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber.toUpperCase())) {
      setError("Invalid PAN number format (e.g. ABCDE1234F)")
      return
    }
    if (!/^\d{12}$/.test(form.aadharNumber)) {
      setError("Aadhar number must be exactly 12 digits")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          countryCode: form.countryCode,
          panNumber: form.panNumber.toUpperCase(),
          aadharNumber: form.aadharNumber,
          occupation: form.occupation,
          assignedRM: form.assignedRM,
          password: form.password,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setPartnerId(data.partnerId)
        setSuccess(`Registration submitted! Our team will review and activate your account within 24 hours. Your Partner ID: ${data.partnerId}`)
      } else {
        setError(data.message || "Registration failed")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Registration Submitted!</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{success}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 font-mono font-bold text-lg">{partnerId}</p>
          <p className="text-blue-600 text-xs mt-1">Save your Partner ID</p>
        </div>
        <Button onClick={onSwitchToLogin} className="w-full bg-blue-600 hover:bg-blue-700">
          Go to Login
        </Button>
      </div>
    )
  }

  const emailMatch = form.confirmEmail ? form.email === form.confirmEmail : null
  const phoneMatch = form.confirmPhone ? form.phone === form.confirmPhone : null

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Full Name */}
      <div className="space-y-1">
        <Label htmlFor="reg-fullname">Full Name (as per PAN) *</Label>
        <Input
          id="reg-fullname"
          placeholder="As it appears on your PAN card"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="reg-email">Email Address *</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
      </div>

      {/* Confirm Email */}
      <div className="space-y-1">
        <Label htmlFor="reg-confirm-email">
          Re-enter Email *
          {emailMatch === true && <CheckCircle2 className="inline w-4 h-4 text-green-500 ml-1" />}
          {emailMatch === false && <XCircle className="inline w-4 h-4 text-red-500 ml-1" />}
        </Label>
        <Input
          id="reg-confirm-email"
          type="email"
          placeholder="Confirm your email"
          value={form.confirmEmail}
          onChange={(e) => update("confirmEmail", e.target.value)}
          required
          className={emailMatch === false ? "border-red-400" : emailMatch === true ? "border-green-400" : ""}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <Label>Phone Number *</Label>
        <div className="flex gap-2">
          <Select value={form.countryCode} onValueChange={(v) => update("countryCode", v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
            required
            className="flex-1"
          />
        </div>
      </div>

      {/* Confirm Phone */}
      <div className="space-y-1">
        <Label htmlFor="reg-confirm-phone">
          Re-enter Phone *
          {phoneMatch === true && <CheckCircle2 className="inline w-4 h-4 text-green-500 ml-1" />}
          {phoneMatch === false && <XCircle className="inline w-4 h-4 text-red-500 ml-1" />}
        </Label>
        <Input
          id="reg-confirm-phone"
          placeholder="Confirm phone number"
          value={form.confirmPhone}
          onChange={(e) => update("confirmPhone", e.target.value.replace(/\D/g, ""))}
          required
          className={phoneMatch === false ? "border-red-400" : phoneMatch === true ? "border-green-400" : ""}
        />
      </div>

      {/* PAN */}
      <div className="space-y-1">
        <Label htmlFor="reg-pan">PAN Number *</Label>
        <Input
          id="reg-pan"
          placeholder="AAAAA9999A"
          value={form.panNumber}
          onChange={(e) => update("panNumber", e.target.value.toUpperCase())}
          maxLength={10}
          required
        />
        <p className="text-xs text-gray-400">Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)</p>
      </div>

      {/* Aadhar */}
      <div className="space-y-1">
        <Label htmlFor="reg-aadhar">Aadhar Number *</Label>
        <Input
          id="reg-aadhar"
          placeholder="12-digit Aadhar number"
          value={form.aadharNumber}
          onChange={(e) => update("aadharNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
          maxLength={12}
          required
        />
      </div>

      {/* Occupation */}
      <div className="space-y-1">
        <Label htmlFor="reg-occupation">Occupation *</Label>
        <Input
          id="reg-occupation"
          placeholder="e.g. Real Estate Agent, Financial Advisor"
          value={form.occupation}
          onChange={(e) => update("occupation", e.target.value)}
          required
        />
      </div>

      {/* Assigned RM */}
      <div className="space-y-1">
        <Label>Assigned Relationship Manager *</Label>
        <Select value={form.assignedRM} onValueChange={(v) => update("assignedRM", v)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select your RM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pareekshith Rawal">Pareekshith Rawal</SelectItem>
            <SelectItem value="Kushal Rawal">Kushal Rawal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="reg-password">Password *</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {/* Strength bar */}
        {form.password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${
              passwordStrength.score <= 1 ? "text-red-500" :
              passwordStrength.score <= 2 ? "text-yellow-500" :
              passwordStrength.score <= 3 ? "text-blue-500" : "text-green-500"
            }`}>
              {passwordStrength.label}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <Label htmlFor="reg-confirm-password">Confirm Password *</Label>
        <div className="relative">
          <Input
            id="reg-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            required
            className={`pr-10 ${
              form.confirmPassword
                ? form.password === form.confirmPassword
                  ? "border-green-400"
                  : "border-red-400"
                : ""
            }`}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Registration"
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        By registering you agree to PropSarathi's partner terms. All data is kept confidential.
      </p>
    </form>
  )
}

// ─── Submit Lead Form ─────────────────────────────────────────────────────────

function SubmitLeadForm() {
  const [form, setForm] = useState({
    clientName: '',
    countryCode: '+91',
    phone: '',
    email: '',
    city: '',
    propertyType: '',
    budget: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.clientName || !form.phone) {
      setError('Client name and phone are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/partner/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(`Lead submitted successfully! Lead ID: ${data.leadId}`)
        setForm({ clientName: '', countryCode: '+91', phone: '', email: '', city: '', propertyType: '', budget: '', notes: '' })
      } else {
        setError(data.message || 'Failed to submit lead')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Refer a Lead</h3>
      <p className="text-sm text-gray-500 mb-6">Submit a client who is looking to buy property. Our team will reach out to them.</p>

      {success && (
        <div className="flex items-start gap-3 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="sl-name">Client Full Name *</Label>
          <Input
            id="sl-name"
            placeholder="Client's full name"
            value={form.clientName}
            onChange={e => update('clientName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <Label>Phone Number *</Label>
          <div className="flex gap-2">
            <Select value={form.countryCode} onValueChange={v => update('countryCode', v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Phone number"
              value={form.phone}
              onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
              required
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="sl-email">Email</Label>
          <Input
            id="sl-email"
            type="email"
            placeholder="client@example.com"
            value={form.email}
            onChange={e => update('email', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>City</Label>
          <Select value={form.city} onValueChange={v => update('city', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Dubai">Dubai</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Property Type</Label>
          <Select value={form.propertyType} onValueChange={v => update('propertyType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Penthouse">Penthouse</SelectItem>
              <SelectItem value="Studio">Studio</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
              <SelectItem value="Plot">Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="sl-budget">Budget</Label>
          <Input
            id="sl-budget"
            placeholder="e.g. 50 Lakhs, 1 Cr, AED 500K"
            value={form.budget}
            onChange={e => update('budget', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="sl-notes">Notes</Label>
          <Textarea
            id="sl-notes"
            placeholder="Any additional information about the client..."
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            rows={3}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</>
          ) : (
            <><Send className="w-4 h-4 mr-2" />Submit Lead</>
          )}
        </Button>
      </form>
    </div>
  )
}

// ─── Forgot Password View ─────────────────────────────────────────────────────

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/partner/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage("If this email is registered, a reset link has been sent. You can also contact enquiry@propsarathi.com")
      } else {
        setError(data.message || "Something went wrong")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <button onClick={onBack} className="flex items-center gap-2 text-blue-600 text-sm hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your registered email to receive reset instructions</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{message}</p>
              </div>
              <Button onClick={onBack} variant="outline" className="w-full">
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Reset Password View ──────────────────────────────────────────────────────

function ResetPasswordView({ onBack }: { onBack: () => void }) {
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    if (t) setToken(t)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/partner/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(data.message)
      } else {
        setError(data.message || "Reset failed")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <button onClick={onBack} className="flex items-center gap-2 text-blue-600 text-sm hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          <CardTitle>Set New Password</CardTitle>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{message}</p>
              </div>
              <Button onClick={onBack} className="w-full bg-blue-600 hover:bg-blue-700">
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-token">Reset Token</Label>
                <Input
                  id="reset-token"
                  placeholder="Paste your reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  partner,
  onLogout,
  activeTab,
  setActiveTab,
}: {
  partner: Partner
  onLogout: () => void
  activeTab: string
  setActiveTab: (t: string) => void
}) {
  const isActive = partner.status === "Active"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl shadow p-5 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {partner.name?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {partner.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={`text-sm px-3 py-1 ${
              isActive
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            }`}
            variant="outline"
          >
            {isActive ? (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" />Active</>
            ) : (
              <><Shield className="w-3.5 h-3.5 mr-1.5 inline" />Pending Approval</>
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: "—", icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Active Leads", value: "—", icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Conversions", value: "—", icon: Home, color: "text-purple-600 bg-purple-50" },
          { label: "Team Members", value: "—", icon: BarChart3, color: "text-orange-600 bg-orange-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b h-12 bg-gray-50">
            <TabsTrigger value="leads" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              My Leads
            </TabsTrigger>
            <TabsTrigger value="submit-lead" className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Refer a Lead
            </TabsTrigger>
            <TabsTrigger value="team" className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              My Team
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-1">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="p-6">
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No leads yet</p>
              <p className="text-sm mt-1">Leads assigned to you will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="submit-lead" className="p-6">
            <SubmitLeadForm />
          </TabsContent>

          <TabsContent value="team" className="p-6">
            <div className="text-center py-12 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No team members yet</p>
              <p className="text-sm mt-1">Your downline partners will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="p-6">
            <div className="max-w-md space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Profile</h3>

              {[
                { label: "Full Name", value: partner.name, icon: User },
                { label: "Email", value: partner.email, icon: Mail },
                { label: "Partner ID", value: partner.partnerId, icon: Shield },
                { label: "Status", value: partner.status, icon: CheckCircle2 },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <item.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-medium text-gray-900">{item.value || "—"}</p>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <strong>Account Status:</strong>{" "}
                {isActive
                  ? "Your account is active. You can start submitting leads."
                  : "Your account is pending approval. Our team will review and activate it within 24 hours."}
              </div>

              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 w-full mt-4"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
