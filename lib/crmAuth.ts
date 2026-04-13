import jwt from 'jsonwebtoken'

export interface CRMUser {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'rm'
}

export const CRM_USERS: CRMUser[] = [
  { id: 'rm1', name: 'Pareekshith Rawal', email: 'pareekshith@propsarathi.com', password: 'PropSarathi@CRM2026', role: 'admin' },
  { id: 'rm2', name: 'Kushal Rawal', email: 'kushal@propsarathi.com', password: 'PropSarathi@CRM2026', role: 'rm' },
]

const SECRET = process.env.JWT_SECRET || 'propsarathi-crm-secret-2026'

export function verifyCRMUser(email: string, password: string): CRMUser | null {
  const user = CRM_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return null
  if (user.password !== password) return null
  return user
}

export function generateCRMToken(user: CRMUser): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '12h' }
  )
}

export function verifyCRMToken(token: string): any {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}
