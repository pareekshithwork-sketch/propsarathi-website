'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface KycData {
  kyc_status: string
  pan_number: string | null
  aadhaar_number: string | null
  gst_number: string | null
  bank_account_number: string | null
  bank_ifsc: string | null
  bank_name: string | null
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string; message: string }> = {
  Verified: {
    icon: CheckCircle,
    color: 'text-green-600',
    label: 'KYC Verified',
    message: 'Your KYC has been verified. You are eligible to receive commissions.',
  },
  Pending: {
    icon: Clock,
    color: 'text-yellow-500',
    label: 'Verification Pending',
    message: 'Your KYC documents are under review. We will notify you once verified.',
  },
  Rejected: {
    icon: AlertCircle,
    color: 'text-red-500',
    label: 'KYC Rejected',
    message: 'Your KYC was rejected. Please re-submit the correct documents.',
  },
  'Not Submitted': {
    icon: AlertCircle,
    color: 'text-gray-400',
    label: 'Not Submitted',
    message: 'Please fill in your KYC details below and submit.',
  },
}

export default function PartnerKycPage() {
  const [kyc, setKyc] = useState<Partial<KycData>>({ kyc_status: 'Not Submitted' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/partner/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.partner) {
          setKyc({
            kyc_status: d.partner.kyc_status || 'Not Submitted',
            pan_number: d.partner.pan_number || '',
            aadhaar_number: d.partner.aadhaar_number || '',
            gst_number: d.partner.gst_number || '',
            bank_account_number: d.partner.bank_account_number || '',
            bank_ifsc: d.partner.bank_ifsc || '',
            bank_name: d.partner.bank_name || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function submit() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/partner/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kyc),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error || 'Submission failed')
      setKyc((k) => ({ ...k, kyc_status: 'Pending' }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-7 w-7 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const status = kyc.kyc_status || 'Not Submitted'
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Not Submitted']
  const StatusIcon = cfg.icon
  const isVerified = status === 'Verified'
  const isPending = status === 'Pending'

  const textField = (label: string, key: keyof KycData, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type="text"
        value={String(kyc[key] ?? '')}
        onChange={(e) => setKyc((k) => ({ ...k, [key]: e.target.value }))}
        placeholder={placeholder}
        readOnly={isVerified || isPending}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none ${
          isVerified || isPending
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-default'
            : 'border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-500'
        }`}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-sm text-gray-500">Required for receiving commission payments</p>
      </div>

      {/* Status banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white">
        <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
        <div>
          <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
          <p className="text-sm text-gray-500 mt-0.5">{cfg.message}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Identity Documents</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textField('PAN Number', 'pan_number', 'ABCDE1234F')}
          {textField('Aadhaar Number', 'aadhaar_number', 'XXXX XXXX XXXX')}
          {textField('GST Number (optional)', 'gst_number', '29ABCDE1234F1Z5')}
        </div>

        <hr className="border-gray-100" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bank Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textField('Bank Name', 'bank_name', 'e.g. HDFC Bank')}
          {textField('Account Number', 'bank_account_number', 'Enter account number')}
          {textField('IFSC Code', 'bank_ifsc', 'e.g. HDFC0001234')}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Submitted! Your KYC is under review.</p>}

        {!isVerified && !isPending && (
          <button
            onClick={submit}
            disabled={saving}
            className="flex items-center gap-2 bg-violet-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Submit KYC
          </button>
        )}
      </div>
    </div>
  )
}
