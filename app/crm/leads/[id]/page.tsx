'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Phone, MessageCircle, Mail, Loader2, Calendar } from 'lucide-react'

// ─── Stage badge helper ───────────────────────────────────────────────────────

const STAGE_BADGE: Record<string, string> = {
  'New': 'bg-gray-100 text-gray-600',
  'Callback': 'bg-blue-100 text-blue-700',
  'Schedule Meeting': 'bg-violet-100 text-violet-700',
  'Schedule Site Visit': 'bg-cyan-100 text-cyan-700',
  'Expression Of Interest': 'bg-amber-100 text-amber-700',
  'Book': 'bg-green-100 text-green-700',
  'Not Interested': 'bg-orange-100 text-orange-700',
  'Drop': 'bg-red-100 text-red-700',
}

function stageBadgeCls(stage: string | null | undefined): string {
  if (!stage) return 'bg-gray-100 text-gray-500'
  return STAGE_BADGE[stage] || 'bg-gray-100 text-gray-600'
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadProfilePage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params?.id as string

  const [lead, setLead] = useState<any>(null)
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/crm/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.user) })
      .catch(() => {})

    loadLead()
  }, [leadId])

  async function loadLead() {
    if (!leadId) return
    setLoading(true)
    setNotFound(false)
    try {
      const res = await fetch(`/api/crm/v2/leads/${leadId}`, { credentials: 'include' })
      if (res.status === 401) { router.push('/crm'); return }
      const data = await res.json()
      if (!data.success) { setNotFound(true); return }
      setLead(data.lead)
      setEnquiries(data.enquiries || [])
      setListings(data.listings || [])
      setActivity(data.activity || [])
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#422D83]" />
      </div>
    )
  }

  if (notFound || !lead) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-400">
        <p className="text-lg font-semibold">Lead not found</p>
        <button
          onClick={() => router.push('/crm')}
          className="text-sm text-[#422D83] underline"
        >
          Back to CRM
        </button>
      </div>
    )
  }

  const phoneClean = (lead.country_code || '+91').replace('+', '') + lead.phone

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-sm text-gray-400">{lead.lead_id} · {lead.assigned_rm || 'Unassigned'}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.country_code || '+91'}${lead.phone}`}
              className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${phoneClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

        {/* Contact Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Contact Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Primary Phone" value={`${lead.country_code || '+91'} ${lead.phone}`} />
            <InfoRow label="Alternate Phone" value={lead.alternate_phone} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Location" value={lead.customer_location} />
            <InfoRow label="Lead Type" value={lead.lead_type} />
            <InfoRow label="Source" value={lead.source} />
            <InfoRow label="Sub Source" value={lead.sub_source} />
            <InfoRow label="Assigned RM" value={lead.assigned_rm || 'Unassigned'} />
            <InfoRow label="Tags" value={lead.tags} />
            <InfoRow
              label="Created"
              value={lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : undefined}
            />
          </div>
        </div>

        {/* Enquiries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Enquiries ({enquiries.length})
          </h2>
          {enquiries.length === 0 && (
            <p className="text-sm text-gray-400">No enquiries yet</p>
          )}
          <div className="space-y-2">
            {enquiries.map((enq: any) => (
              <div
                key={enq.enquiry_id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-xs font-mono text-gray-400">{enq.enquiry_id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageBadgeCls(enq.stage)}`}>
                    {enq.stage || 'New'}
                  </span>
                  {enq.property_type && (
                    <span className="text-xs text-gray-500">{enq.property_type}</span>
                  )}
                  {enq.location_pref && (
                    <span className="text-xs text-gray-400">· {enq.location_pref}</span>
                  )}
                  {enq.scheduled_at && (
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(enq.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${enq.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {enq.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Listings ({listings.length})
          </h2>
          {listings.length === 0 && (
            <p className="text-sm text-gray-400">No listings yet</p>
          )}
          <div className="space-y-2">
            {listings.map((ls: any) => (
              <div
                key={ls.listing_id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-mono text-gray-400 mr-2">{ls.listing_id}</span>
                  <span className="text-sm font-medium text-gray-800">{ls.title || 'Untitled'}</span>
                  {ls.asking_price > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      {ls.currency === 'AED' ? 'AED ' : '₹'}
                      {Number(ls.asking_price).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                  {ls.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Activity History
          </h2>
          {activity.length === 0 && (
            <p className="text-sm text-gray-400">No activity yet</p>
          )}
          <div className="space-y-3">
            {activity.map((item: any, i: number) => (
              <div key={item.id || i} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">"{item.description}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.performed_by} ·{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
