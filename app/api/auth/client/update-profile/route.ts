import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getClientSession } from '@/lib/clientAuth'

export async function POST(req: NextRequest) {
  return handleUpdate(req)
}

export async function PATCH(req: NextRequest) {
  return handleUpdate(req)
}

async function handleUpdate(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json()
  const { name, phone, countryCode, purpose } = body

  if (name !== undefined && !name?.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
  }

  // If phone is being changed, require verified WhatsApp OTP
  if (phone !== undefined && phone !== '') {
    const dialCode = (countryCode || '+91').replace(/[^\d+]/g, '').startsWith('+')
      ? (countryCode || '+91').replace(/[^\d+]/g, '')
      : `+${(countryCode || '+91').replace(/\D/g, '')}`
    const fullPhone = `${dialCode}${phone.replace(/\D/g, '')}`

    const waRows = await sql`
      SELECT id FROM client_otps
      WHERE identifier = ${fullPhone}
        AND type = 'whatsapp'
        AND verified = true
        AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `
    if (waRows.length === 0) {
      return NextResponse.json(
        { error: 'Phone number must be verified via WhatsApp OTP before updating' },
        { status: 400 }
      )
    }

    // Consume the OTP
    await sql`DELETE FROM client_otps WHERE id = ${waRows[0].id}`

    await sql`
      UPDATE client_users
      SET phone = ${fullPhone}
      WHERE id = ${session.clientId}
    `
  }

  // Update name if provided
  if (name?.trim()) {
    await sql`UPDATE client_users SET name = ${name.trim()} WHERE id = ${session.clientId}`
  }

  // Update purpose if provided (stored as a user preference column)
  if (purpose) {
    // Add column if not exists (idempotent)
    try {
      await sql`ALTER TABLE client_users ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT ''`
    } catch {}
    await sql`UPDATE client_users SET purpose = ${purpose} WHERE id = ${session.clientId}`
  }

  return NextResponse.json({ success: true })
}
