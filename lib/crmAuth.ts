import jwt from 'jsonwebtoken'

export type CRMRole = 'super_admin' | 'admin' | 'gm' | 'rm' | 'marketing' | 'finance' | 'hr' | 'viewer'

export interface CRMUser {
  id: string
  userId?: string
  name: string
  email: string
  role: CRMRole
  teamId?: number | null
  managerId?: string | null
  department?: string
}

// Emergency password fallback list (Google OAuth is the primary login)
const CRM_EMERGENCY_LIST: (CRMUser & { passwordEnvVar: string })[] = [
  { id: 'PS-U-001', name: 'Pareekshith Rawal', email: 'pareekshith@propsarathi.com', role: 'super_admin', passwordEnvVar: 'CRM_ADMIN_PASSWORD' },
  { id: 'PS-U-002', name: 'Kushal Rawal', email: 'kushal@propsarathi.com', role: 'super_admin', passwordEnvVar: 'CRM_RM_PASSWORD' },
]

const SECRET = process.env.JWT_SECRET
if (!SECRET) {
  console.error('JWT_SECRET environment variable is not set')
}

export function verifyCRMUser(email: string, password: string): CRMUser | null {
  const entry = CRM_EMERGENCY_LIST.find(u => u.email.toLowerCase() === email.toLowerCase())
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
    {
      id: user.id,
      userId: user.userId || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId || null,
      managerId: user.managerId || null,
      department: user.department || '',
    },
    secret,
    { expiresIn: '12h' }
  )
}

export function verifyCRMToken(token: string): CRMUser | null {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  try {
    return jwt.verify(token, secret) as CRMUser
  } catch {
    return null
  }
}

export const CRM_COOKIE = 'crm_token'
