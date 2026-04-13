// Partner data now stored in Neon Postgres
import sql from './db'

export async function findPartnerByEmail(email: string) {
  const rows = await sql`SELECT * FROM crm_partners WHERE email = ${email.toLowerCase()}`
  return rows[0] || null
}

export async function findPartnerByResetToken(token: string) {
  const rows = await sql`SELECT * FROM crm_partners WHERE reset_token = ${token}`
  return rows[0] || null
}

export async function appendPartnerRow(partner: any) {
  await sql`
    INSERT INTO crm_partners (partner_id, full_name, email, phone, country_code, pan_number, aadhar_number, occupation, assigned_rm, password_hash, status)
    VALUES (${partner.partnerId}, ${partner.fullName}, ${partner.email.toLowerCase()}, ${partner.phone}, ${partner.countryCode||'+91'}, ${partner.panNumber||''}, ${partner.aadharNumber||''}, ${partner.occupation||''}, ${partner.assignedRM||''}, ${partner.passwordHash}, 'Pending')
  `
}

export async function updatePartnerResetToken(email: string, token: string, expiry: number) {
  await sql`UPDATE crm_partners SET reset_token = ${token}, reset_token_expiry = ${expiry}, last_updated = NOW() WHERE email = ${email.toLowerCase()}`
}

export async function updatePartnerPassword(email: string, hash: string) {
  await sql`UPDATE crm_partners SET password_hash = ${hash}, reset_token = NULL, reset_token_expiry = NULL, last_updated = NOW() WHERE email = ${email.toLowerCase()}`
}

export async function updatePartnerStatus(email: string, status: string) {
  await sql`UPDATE crm_partners SET status = ${status}, last_updated = NOW() WHERE email = ${email.toLowerCase()}`
}
