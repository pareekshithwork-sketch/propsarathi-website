import { type NextRequest, NextResponse } from 'next/server'
import { verifyPortalToken } from '@/lib/portalAuth'
import { updateViewerLastSeen, updateViewer } from '@/lib/projectsDb'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('portal_token')?.value
  if (!token) return NextResponse.json({ success: false })
  const viewer = verifyPortalToken(token)
  if (!viewer) return NextResponse.json({ success: false })
  await updateViewerLastSeen(viewer.id)
  return NextResponse.json({ success: true, viewer })
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('portal_token')?.value
    if (!token) return NextResponse.json({ success: false }, { status: 401 })
    const payload = verifyPortalToken(token)
    if (!payload) return NextResponse.json({ success: false }, { status: 401 })
    const data = await request.json()
    await updateViewer(payload.id, data)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('portal_token')
  return response
}
