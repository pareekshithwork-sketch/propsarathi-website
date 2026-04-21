/**
 * PropSarathi — Add property detail fields migration
 * Run: node scripts/add-property-detail-fields.mjs
 */
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('🚀 Adding property detail fields to projects table...\n')

  // Payment plan
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_plan_booking INTEGER`
  console.log('✅ payment_plan_booking')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_plan_construction INTEGER`
  console.log('✅ payment_plan_construction')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_plan_possession INTEGER`
  console.log('✅ payment_plan_possession')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_plan_note TEXT DEFAULT ''`
  console.log('✅ payment_plan_note')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_plan_emi BOOLEAN DEFAULT FALSE`
  console.log('✅ payment_plan_emi')

  // Floor plans (JSON array)
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS floor_plans TEXT DEFAULT ''`
  console.log('✅ floor_plans')

  // Developer info
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_description TEXT DEFAULT ''`
  console.log('✅ developer_description')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_logo TEXT DEFAULT ''`
  console.log('✅ developer_logo')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_founded TEXT DEFAULT ''`
  console.log('✅ developer_founded')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_projects_count INTEGER`
  console.log('✅ developer_projects_count')

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS developer_website TEXT DEFAULT ''`
  console.log('✅ developer_website')

  // Nearby locations (JSON array)
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS nearby_locations TEXT DEFAULT ''`
  console.log('✅ nearby_locations')

  console.log('\n✅ Migration complete!')
}

main().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
