import jwt from 'jsonwebtoken'

export interface CRMUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'rm'
}

// User list (non-sensitive — no passwords stored here)
const CRM_USER_LIST: (CRMUser & { passwordEnvVar: string })[] = [
  { id: 'rm1', name: 'Pareekshith Rawal', email: 'pareekshith@propsarathi.com', role: 'admin', passwordEnvVar: 'CRM_ADMIN_PASSWORD' },
  { id: 'rm2', name: 'Kushal Rawal', email: 'kushal@propsarathi.com', role: 'rm', passwordEnvVar: 'CRM_RM_PASSWORD' },
]

const SECRET = process.env.JWT_SECRET
if (!SECRET) {
  console.error('JWT_SECRET environment variable is not set')
}

export function verifyCRMUser(email: string, password: string): CRMUser | null {
  const entry = CRM_USER_LIST.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!entry) return null
  const expectedPassword = process.env[entry.passwordEnvVar]
  if (!expectedPassword || password !== expectedPassword) return null
  const { passwordEnvVar: _, ...user } = entry
  return user
}

export function generateCRMToken(user: CRMUser): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    secret,
    { expiresIn: '12h' }
  )
}

export function verifyCRMToken(token: string): any {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}
