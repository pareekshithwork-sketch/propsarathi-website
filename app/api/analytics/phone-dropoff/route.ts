import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await sql`
      CREATE TABLE IF NOT EXISTS ps_analytics (
        id SERIAL PRIMARY KEY,
        event_type TEXT,
        properties JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`
      INSERT INTO ps_analytics (event_type, properties)
      VALUES ('phone_dropoff', ${JSON.stringify({
        context: body.context ?? null,
        partialLength: body.partialLength ?? null,
        countryCode: body.countryCode ?? null,
        timestamp: body.timestamp ?? null,
      })}::jsonb)
    `
  } catch {}
  return NextResponse.json({ success: true })
}
