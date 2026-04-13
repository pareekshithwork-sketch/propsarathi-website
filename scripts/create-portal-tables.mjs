import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('🔧 Creating portal tables...')

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      developer VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      address TEXT,
      project_type VARCHAR(100),
      status VARCHAR(100) DEFAULT 'Pre-Launch',
      total_area_acres DECIMAL,
      num_towers INTEGER,
      num_floors INTEGER,
      num_units INTEGER,
      min_price BIGINT,
      max_price BIGINT,
      currency VARCHAR(10) DEFAULT 'INR',
      possession_date VARCHAR(100),
      rera_number VARCHAR(255),
      metro_station VARCHAR(255),
      metro_distance_km DECIMAL,
      latitude DECIMAL,
      longitude DECIMAL,
      description TEXT,
      amenities TEXT,
      highlights TEXT,
      cover_image TEXT,
      brochure_url TEXT,
      video_url TEXT,
      is_featured BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ projects table')

  await sql`
    CREATE TABLE IF NOT EXISTS project_units (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      unit_type VARCHAR(100),
      bedrooms INTEGER,
      bathrooms INTEGER,
      min_area_sqft DECIMAL,
      max_area_sqft DECIMAL,
      min_price BIGINT,
      max_price BIGINT,
      available_units INTEGER,
      total_units INTEGER,
      floor_plan_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ project_units table')

  await sql`
    CREATE TABLE IF NOT EXISTS project_images (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      caption VARCHAR(255),
      media_type VARCHAR(50) DEFAULT 'image',
      sort_order INTEGER DEFAULT 0
    )
  `
  console.log('✅ project_images table')

  await sql`
    CREATE TABLE IF NOT EXISTS portal_viewers (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) NOT NULL,
      country_code VARCHAR(10) DEFAULT '+91',
      name VARCHAR(255),
      email VARCHAR(255),
      crm_lead_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      last_seen TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ portal_viewers table')

  await sql`
    CREATE TABLE IF NOT EXISTS portal_otp (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) NOT NULL,
      country_code VARCHAR(10) DEFAULT '+91',
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ portal_otp table')

  await sql`
    CREATE TABLE IF NOT EXISTS portal_page_views (
      id SERIAL PRIMARY KEY,
      viewer_id INTEGER REFERENCES portal_viewers(id),
      project_slug VARCHAR(255),
      duration_seconds INTEGER,
      enquiry_triggered BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ portal_page_views table')

  console.log('\n🎉 All portal tables created successfully!')
}

main().catch(e => { console.error(e); process.exit(1) })
