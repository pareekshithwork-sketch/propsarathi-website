import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"
import { checkAdminAuth } from "@/lib/adminAuth"

const sql = neon(process.env.DATABASE_URL!)

// GET — load layers filtered by city (public)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get("city") // "Bangalore" | "Dubai" | null (all)

    const rows = city
      ? await sql`
          SELECT id, file_name, folder_name, color, geojson, visible, sort_order, feature_styles, city
          FROM map_layers
          WHERE city = ${city} OR city = 'both'
          ORDER BY sort_order ASC, created_at ASC
        `
      : await sql`
          SELECT id, file_name, folder_name, color, geojson, visible, sort_order, feature_styles, city
          FROM map_layers
          ORDER BY sort_order ASC, created_at ASC
        `

    return NextResponse.json(rows, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// POST — save uploaded KML layers (admin only via admin-key header)
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { fileName, folders } = await req.json()
    // folders: [{ name, color, geojson }]
    const inserted = []
    for (let i = 0; i < folders.length; i++) {
      const f = folders[i]
      const [row] = await sql`
        INSERT INTO map_layers (file_name, folder_name, color, geojson, visible, sort_order)
        VALUES (${fileName}, ${f.name}, ${f.color}, ${JSON.stringify(f.geojson)}, true, ${i})
        RETURNING id, file_name, folder_name, color, visible, sort_order
      `
      inserted.push(row)
    }
    return NextResponse.json(inserted)
  } catch (e) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// DELETE — delete all layers for a file_name (admin only)
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { fileName } = await req.json()
    await sql`DELETE FROM map_layers WHERE file_name = ${fileName}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
