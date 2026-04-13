import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS map_layers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name   TEXT        NOT NULL,
    folder_name TEXT        NOT NULL,
    color       TEXT        NOT NULL DEFAULT '#3B82F6',
    geojson     JSONB       NOT NULL,
    visible     BOOLEAN     NOT NULL DEFAULT true,
    sort_order  INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`

console.log("✅ map_layers table created")
process.exit(0)
