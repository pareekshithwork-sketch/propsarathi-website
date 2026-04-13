/**
 * PropSarathi — Full DB Migration
 * Run: node scripts/create-all-tables.mjs
 */
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('🚀 Running PropSarathi full DB migration...\n')

  // ── ROLES & USERS ─────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS ps_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'rm',
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_by INTEGER,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ ps_users')

  // ── PROJECTS ──────────────────────────────────────────────────────────────
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
      airport_distance_km DECIMAL,
      tech_park_distance_km DECIMAL,
      nearby_landmarks TEXT,
      latitude DECIMAL,
      longitude DECIMAL,
      description TEXT,
      amenities TEXT,
      highlights TEXT,
      cover_image TEXT,
      gallery_images TEXT,
      brochure_url TEXT,
      video_url TEXT,
      virtual_tour_url TEXT,
      seo_title VARCHAR(255),
      seo_description TEXT,
      og_image TEXT,
      schema_extra TEXT,
      is_featured BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ projects')

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
  console.log('✅ project_units')

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
  console.log('✅ project_images')

  // ── PORTAL VIEWERS ────────────────────────────────────────────────────────
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
  console.log('✅ portal_viewers')

  await sql`
    CREATE TABLE IF NOT EXISTS portal_otp (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) NOT NULL,
      country_code VARCHAR(10) DEFAULT '+91',
      otp VARCHAR(10) NOT NULL,
      type VARCHAR(20) DEFAULT 'whatsapp',
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ portal_otp')

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
  console.log('✅ portal_page_views')

  // ── CRM TABLES ────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS crm_leads (
      id SERIAL PRIMARY KEY,
      lead_id VARCHAR(100) UNIQUE NOT NULL,
      source VARCHAR(100),
      partner_id VARCHAR(100),
      partner_name VARCHAR(255),
      client_name VARCHAR(255),
      phone VARCHAR(20),
      country_code VARCHAR(10) DEFAULT '+91',
      email VARCHAR(255),
      city VARCHAR(100),
      property_type VARCHAR(100),
      budget VARCHAR(100),
      assigned_rm VARCHAR(255),
      status VARCHAR(100) DEFAULT 'New',
      sub_status VARCHAR(100),
      tags VARCHAR(255),
      notes TEXT,
      ai_call_summary TEXT,
      meet_scheduled_at TIMESTAMP,
      site_visit_scheduled_at TIMESTAMP,
      meet_done BOOLEAN DEFAULT false,
      site_visit_done BOOLEAN DEFAULT false,
      last_updated TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ crm_leads')

  await sql`
    CREATE TABLE IF NOT EXISTS crm_data (
      id SERIAL PRIMARY KEY,
      data_id VARCHAR(100) UNIQUE NOT NULL,
      source VARCHAR(100),
      name VARCHAR(255),
      phone VARCHAR(20),
      country_code VARCHAR(10) DEFAULT '+91',
      email VARCHAR(255),
      dob VARCHAR(50),
      gender VARCHAR(20),
      sub_source VARCHAR(100),
      carpet_area VARCHAR(100),
      notes TEXT,
      status VARCHAR(100) DEFAULT 'New',
      converted BOOLEAN DEFAULT false,
      converted_lead_id VARCHAR(100),
      last_updated TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ crm_data')

  await sql`
    CREATE TABLE IF NOT EXISTS crm_history (
      id SERIAL PRIMARY KEY,
      record_id VARCHAR(100) NOT NULL,
      record_type VARCHAR(50) DEFAULT 'lead',
      timestamp TIMESTAMP DEFAULT NOW(),
      action VARCHAR(255),
      changed_by VARCHAR(255),
      old_status VARCHAR(100),
      new_status VARCHAR(100),
      notes TEXT
    )
  `
  console.log('✅ crm_history')

  // ── EMAIL CAMPAIGNS ───────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS email_campaigns (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      from_name VARCHAR(255) DEFAULT 'PropSarathi',
      from_email VARCHAR(255) DEFAULT 'hello@propsarathi.com',
      status VARCHAR(50) DEFAULT 'draft',
      target_segment VARCHAR(100),
      sent_count INTEGER DEFAULT 0,
      opened_count INTEGER DEFAULT 0,
      clicked_count INTEGER DEFAULT 0,
      scheduled_at TIMESTAMP,
      sent_at TIMESTAMP,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ email_campaigns')

  await sql`
    CREATE TABLE IF NOT EXISTS email_campaign_recipients (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER REFERENCES email_campaigns(id),
      email VARCHAR(255),
      name VARCHAR(255),
      lead_id VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      opened_at TIMESTAMP,
      clicked_at TIMESTAMP,
      sent_at TIMESTAMP
    )
  `
  console.log('✅ email_campaign_recipients')

  // ── BLOG ──────────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(500) NOT NULL,
      excerpt TEXT,
      content TEXT,
      cover_image TEXT,
      author_name VARCHAR(255) DEFAULT 'PropSarathi Team',
      author_image VARCHAR(255),
      category VARCHAR(100),
      tags TEXT,
      status VARCHAR(50) DEFAULT 'draft',
      seo_title VARCHAR(255),
      seo_description TEXT,
      og_image TEXT,
      reading_time INTEGER,
      related_project_slug VARCHAR(255),
      schema_faq TEXT,
      views INTEGER DEFAULT 0,
      published_at TIMESTAMP,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ blog_posts')

  // ── AI CALLS ──────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS ai_calls (
      id SERIAL PRIMARY KEY,
      lead_id VARCHAR(100),
      phone VARCHAR(20),
      country_code VARCHAR(10),
      status VARCHAR(50) DEFAULT 'pending',
      duration_seconds INTEGER,
      transcript TEXT,
      summary TEXT,
      sentiment VARCHAR(50),
      outcome VARCHAR(100),
      next_action VARCHAR(255),
      scheduled_at TIMESTAMP,
      started_at TIMESTAMP,
      ended_at TIMESTAMP,
      provider VARCHAR(50) DEFAULT 'vapi',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  console.log('✅ ai_calls')

  // ── SEED SUPER ADMIN ──────────────────────────────────────────────────────
  const bcryptHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // "password" — change immediately
  await sql`
    INSERT INTO ps_users (name, email, password_hash, role, phone)
    VALUES ('Pareekshith Rawal', 'pareekshith@propsarathi.com', ${bcryptHash}, 'super_admin', '9606669060')
    ON CONFLICT (email) DO NOTHING
  `
  await sql`
    INSERT INTO ps_users (name, email, password_hash, role, phone)
    VALUES ('Kushal Rawal', 'kushal@propsarathi.com', ${bcryptHash}, 'rm', '')
    ON CONFLICT (email) DO NOTHING
  `
  console.log('✅ Seed users inserted')

  console.log('\n🎉 All tables created successfully!')
  console.log('\n⚠️  IMPORTANT: Change passwords immediately after first login!')
}

main().catch(e => { console.error('❌ Migration failed:', e); process.exit(1) })
