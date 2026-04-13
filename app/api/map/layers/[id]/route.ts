import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// PATCH — toggle visible / change color (admin only)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await req.json()
    if ("visible" in body) {
      await sql`UPDATE map_layers SET visible = ${body.visible} WHERE id = ${id}`
    }
    if ("color" in body) {
      await sql`UPDATE map_layers SET color = ${body.color} WHERE id = ${id}`
    }
    if ("folder_name" in body) {
      await sql`UPDATE map_layers SET folder_name = ${body.folder_name} WHERE id = ${id}`
    }
    if ("city" in body) {
      await sql`UPDATE map_layers SET city = ${body.city} WHERE id = ${id}`
    }
    if ("feature_styles" in body) {
      await sql.query(
        "UPDATE map_layers SET feature_styles = $1::jsonb WHERE id = $2",
        [JSON.stringify(body.feature_styles), id]
      )
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("PATCH map layer error:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// DELETE — delete a single layer (admin only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    await sql`DELETE FROM map_layers WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
