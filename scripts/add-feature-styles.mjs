import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.DATABASE_URL)
await sql`ALTER TABLE map_layers ADD COLUMN IF NOT EXISTS feature_styles JSONB DEFAULT '[]'::jsonb`
console.log("✅ feature_styles column added")
process.exit(0)
