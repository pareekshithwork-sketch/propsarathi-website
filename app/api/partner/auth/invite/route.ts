import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import sql from '@/lib/db'
import { verifyCRMToken } from '@/lib/crmAuth'

function authCRM(req: NextRequest) {
  return verifyCRMToken(req.cookies.get('crm_token')?.value || '')
}

function jwtSecret() {
  return process.env.JWT_SECRET || 'propsarathi-secret-2026'
}

export async function POST(request: NextRequest) {
  const user = authCRM(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { partnerId, partnerName, partnerEmail } = await request.json()
    if (!partnerId || !partnerEmail) {
      return NextResponse.json({ success: false, error: 'partnerId and partnerEmail required' }, { status: 400 })
    }

    // Generate 24h invite token
    const inviteToken = jwt.sign(
      { invite: true, partnerId },
      jwtSecret(),
      { expiresIn: '24h' }
    )

    // Store token in crm_partners
    await sql`
      UPDATE crm_partners
      SET invite_token = ${inviteToken}, invite_sent_at = NOW(), updated_at = NOW()
      WHERE partner_id = ${partnerId}
    `

    const setupUrl = `https://www.propsarathi.com/partner/setup?token=${encodeURIComponent(inviteToken)}`

    // Send email via Gmail
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    if (!gmailUser || !gmailPass) {
      return NextResponse.json({ success: false, error: 'Email not configured' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#422D83;padding:32px 32px 24px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">PropSarathi</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Partner Portal</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;font-size:18px;color:#111827;font-weight:700;">You've been added as a PropSarathi Partner</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
        Hi ${partnerName || 'there'}, <strong>${user.name}</strong> has added you as a channel partner on PropSarathi.
        Set up your account to start tracking referrals, commissions, and shared property links.
      </p>
      <a href="${setupUrl}" style="display:inline-block;background:#422D83;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">
        Set Up Your Account →
      </a>
      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">
        This link expires in 24 hours. If you did not expect this email, you can ignore it.
      </p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:11px;">PropSarathi · Real Estate Advisory · Dubai & Bangalore</p>
    </div>
  </div>
</body>
</html>`

    await transporter.sendMail({
      from: `"PropSarathi" <${gmailUser}>`,
      to: partnerEmail,
      subject: "You've been added as a PropSarathi Partner",
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Partner Invite]', err)
    return NextResponse.json({ success: false, error: 'Failed to send invite' }, { status: 500 })
  }
}
