// Script to ensure "Partners" tab exists in partner spreadsheet
import { createSign } from 'crypto'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')

function parseEnv(content) {
  const env = {}
  for (const line of content.split('\n')) {
    // Match KEY="value" or KEY=value
    const eqIdx = line.indexOf('=')
    if (eqIdx < 0) continue
    const key = line.slice(0, eqIdx).trim()
    if (!/^[A-Z_]+$/.test(key)) continue
    let val = line.slice(eqIdx + 1).trim()
    // Remove surrounding single or double quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const env = parseEnv(envContent)
const clientEmail = env.GOOGLE_SHEETS_CLIENT_EMAIL
const privateKeyRaw = env.GOOGLE_SHEETS_PRIVATE_KEY || ''

// The private key in .env.local has surrounding double-quotes and escaped newlines
// Strip ALL surrounding quotes (may be double-double-quoted)
let privateKey = privateKeyRaw
while (privateKey.startsWith('"') || privateKey.startsWith("'")) {
  privateKey = privateKey.slice(1)
}
while (privateKey.endsWith('"') || privateKey.endsWith("'")) {
  privateKey = privateKey.slice(0, -1)
}
privateKey = privateKey.replace(/\\n/g, '\n')

const SPREADSHEET_ID = '1TryLs-b4fKTCLbPiBWQbQ2s0g1W_uhbqRfNLEUK5okk'

function base64url(buf) {
  return buf.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })))
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })))

  const signingInput = `${header}.${payload}`
  const sign = createSign('RSA-SHA256')
  sign.update(signingInput)
  const sig = base64url(sign.sign(privateKey))
  const jwt = `${signingInput}.${sig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get access token: ${err}`)
  }

  const data = await res.json()
  return data.access_token
}

async function main() {
  console.log('Getting access token...')
  const token = await getAccessToken()
  console.log('✓ Got access token')

  // Get spreadsheet info
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get spreadsheet: ${err}`)
  }

  const spreadsheet = await res.json()
  const sheets = spreadsheet.sheets || []
  const sheetNames = sheets.map(s => s.properties.title)
  console.log('Existing sheets:', sheetNames)

  if (sheetNames.includes('Partners')) {
    console.log('✓ "Partners" tab already exists — skipping creation')
    return
  }

  console.log('Creating "Partners" tab...')
  const createRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        addSheet: {
          properties: {
            title: 'Partners',
          },
        },
      }],
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`Failed to create Partners tab: ${err}`)
  }

  console.log('✓ "Partners" tab created successfully')

  // Add header row
  const headerToken = await getAccessToken()
  const headerRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent('Partners!A1')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${headerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[
          'Timestamp', 'Full Name', 'Email', 'Phone', 'Country Code',
          'PAN Number', 'Aadhar Number', 'Occupation', 'Assigned RM',
          'Password Hash', 'Status', 'Partner ID', 'Reset Token', 'Reset Token Expiry'
        ]],
      }),
    }
  )

  if (!headerRes.ok) {
    const err = await headerRes.text()
    throw new Error(`Failed to add header row: ${err}`)
  }

  console.log('✓ Header row added to Partners tab')
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
