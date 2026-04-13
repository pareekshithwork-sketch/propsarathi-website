/**
 * PropSarathi — Seed Projects
 * Run: node scripts/seed-projects.mjs
 */
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sql = neon(process.env.DATABASE_URL)

const projects = [
  {
    slug: 'sattva-haven-devanahalli',
    name: 'Sattva Haven',
    developer: 'Sattva Group',
    city: 'Bangalore',
    location: 'Devanahalli, North Bangalore',
    address: 'Devanahalli, Bangalore North, Karnataka 562110',
    project_type: 'Apartment',
    status: 'Pre-Launch',
    total_area_acres: 28.5,
    num_towers: 8,
    num_floors: 22,
    num_units: 1200,
    min_price: 7500000,
    max_price: 18000000,
    currency: 'INR',
    possession_date: 'December 2028',
    rera_number: 'RERA Applied',
    metro_station: 'Devanahalli Metro (Proposed)',
    metro_distance_km: 2.5,
    airport_distance_km: 6.0,
    tech_park_distance_km: 8.0,
    nearby_landmarks: 'KIAL Airport|KIADB Aerospace Park|Devanahalli Business Park|NH 44',
    description: 'Sattva Haven is a premium township in the rapidly growing Devanahalli corridor. Strategically located minutes from Kempegowda International Airport and the upcoming Aerospace SEZ, this pre-launch project offers an exceptional investment opportunity with projected 40-50% appreciation over possession.',
    amenities: 'Clubhouse|Swimming Pool|Gymnasium|Tennis Court|Badminton Court|Children Play Area|Jogging Track|Amphitheatre|Co-working Space|EV Charging|24/7 Security|Landscaped Gardens|Yoga Deck|Party Hall|Mini Theatre',
    highlights: 'Next to KIAL Airport|Aerospace SEZ Proximity|Township Living|Pre-Launch Pricing|Sattva Trusted Brand|High ROI Corridor',
    cover_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    brochure_url: '',
    video_url: '',
    is_featured: true,
    seo_title: 'Sattva Haven Devanahalli - Pre-Launch Apartments near Bangalore Airport',
    seo_description: 'Book pre-launch apartments in Sattva Haven, Devanahalli. 1, 2, 3 BHK flats starting ₹75L near Bangalore Airport. RERA Applied. Call PropSarathi.',
  },
  {
    slug: 'brigade-orchards-devanahalli',
    name: 'Brigade Orchards',
    developer: 'Brigade Group',
    city: 'Bangalore',
    location: 'Devanahalli, North Bangalore',
    address: 'Devanahalli, Bangalore, Karnataka 562110',
    project_type: 'Apartment',
    status: 'Just Launched',
    total_area_acres: 135.0,
    num_towers: 22,
    num_floors: 18,
    num_units: 4200,
    min_price: 6500000,
    max_price: 22000000,
    currency: 'INR',
    possession_date: 'March 2027',
    rera_number: 'PRM/KA/RERA/1251/310/PR/210101/003690',
    metro_station: 'Devanahalli Metro (Proposed)',
    metro_distance_km: 3.0,
    airport_distance_km: 7.0,
    tech_park_distance_km: 5.0,
    nearby_landmarks: 'KIAL Airport|KIADB Industrial Area|Devanahalli Fort|NH 44',
    description: 'Brigade Orchards is North Bangalore\'s largest integrated township spread across 135 acres. A self-sufficient city within a city, featuring residences, retail, hospitality, school, and medical facilities. One of Brigade Group\'s flagship township projects.',
    amenities: 'World-class Clubhouse|Olympic Pool|Sports Courts|International School|Retail High Street|Hotel|Medical Centre|Gymnasium|Spa|Cycling Track|Dog Park|EV Charging|Smart Home Features|Concierge Services',
    highlights: '135 Acre Township|Self-Sufficient City|Brigade Trusted Brand|Near Airport|School & Hospital Inside|High ROI',
    cover_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
    brochure_url: '',
    video_url: '',
    is_featured: true,
    seo_title: 'Brigade Orchards Devanahalli - Township Apartments | PropSarathi',
    seo_description: 'Brigade Orchards 135-acre township in Devanahalli. 1-4 BHK apartments from ₹65L. RERA registered. Book with PropSarathi - authorised channel partner.',
  },
  {
    slug: 'prestige-pine-forest-whitefield',
    name: 'Prestige Pine Forest',
    developer: 'Prestige Group',
    city: 'Bangalore',
    location: 'Whitefield, East Bangalore',
    address: 'Whitefield, Bangalore East, Karnataka 560066',
    project_type: 'Apartment',
    status: 'Under Construction',
    total_area_acres: 22.0,
    num_towers: 6,
    num_floors: 28,
    num_units: 980,
    min_price: 12000000,
    max_price: 35000000,
    currency: 'INR',
    possession_date: 'June 2026',
    rera_number: 'PRM/KA/RERA/1251/446/PR/220801/005123',
    metro_station: 'Whitefield (Kadugodi) Metro',
    metro_distance_km: 1.2,
    airport_distance_km: 42.0,
    tech_park_distance_km: 0.8,
    nearby_landmarks: 'ITPL Tech Park|Nexus Whitefield Mall|Vydehi Hospital|EPIP Zone|Phoenix Marketcity',
    description: 'Prestige Pine Forest is a luxury residential project in the heart of Whitefield — Bangalore\'s IT hub. Offering premium 2, 3, and 4 BHK apartments with world-class amenities, walking distance from ITPL, Metro, and top schools.',
    amenities: 'Grand Clubhouse|Rooftop Pool|Sky Deck|Gymnasium|Squash Court|Badminton|Tennis|Kids Zone|Co-working Hub|EV Charging|Concierge|Smart Security|Landscaped Podium|Jogging Trail',
    highlights: 'Whitefield IT Hub|Metro Walkable|Prestige Brand|Near ITPL|Premium Luxury|Ready Soon',
    cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    brochure_url: '',
    video_url: '',
    is_featured: true,
    seo_title: 'Prestige Pine Forest Whitefield - Luxury 2,3,4 BHK Apartments',
    seo_description: 'Prestige Pine Forest in Whitefield, Bangalore. Luxury 2-4 BHK apartments from ₹1.2Cr near ITPL Metro. RERA registered. PropSarathi authorised partner.',
  },
  {
    slug: 'damac-lagoons-dubai',
    name: 'DAMAC Lagoons',
    developer: 'DAMAC Properties',
    city: 'Dubai',
    location: 'Dubai Land, Dubai',
    address: 'DAMAC Lagoons, Dubailand, Dubai, UAE',
    project_type: 'Villa',
    status: 'Just Launched',
    total_area_acres: 45.0,
    num_towers: null,
    num_floors: 4,
    num_units: 8000,
    min_price: 1800000,
    max_price: 8500000,
    currency: 'AED',
    possession_date: 'Q4 2026',
    rera_number: 'RERA Dubai Registered',
    metro_station: 'Dubai Internet City Metro',
    metro_distance_km: 12.0,
    airport_distance_km: 25.0,
    tech_park_distance_km: 10.0,
    nearby_landmarks: 'Global Village|IMG Worlds|Dubai Autodrome|DAMAC Mall',
    description: 'DAMAC Lagoons is a Mediterranean-inspired waterfront community in Dubailand. Featuring crystal lagoons, sandy beaches, and lush landscapes, it offers townhouses and villas in a resort-style setting. Ideal for NRI investors seeking high ROI in Dubai\'s booming property market.',
    amenities: 'Crystal Lagoon|Private Beach|Floating Pods|Zip Lines|Waterfall Features|Beach Club|Retail|F&B|Gymnasium|Children Aqua Play|Yoga Lawn|Outdoor Cinema|Smart Home|24/7 Security',
    highlights: 'Mediterranean Theme|Crystal Lagoon|High ROI Dubai|NRI Friendly|Post-Handover Payment|Golden Visa Eligible',
    cover_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    brochure_url: '',
    video_url: '',
    is_featured: true,
    seo_title: 'DAMAC Lagoons Dubai - NRI Investment Villas | PropSarathi',
    seo_description: 'DAMAC Lagoons Dubai villas from AED 18L. Mediterranean waterfront community in Dubailand. High ROI, Golden Visa eligible. Book via PropSarathi.',
  },
  {
    slug: 'emaar-address-residences-dubai',
    name: 'Emaar Address Residences',
    developer: 'Emaar Properties',
    city: 'Dubai',
    location: 'Downtown Dubai',
    address: 'Downtown Dubai, Dubai, UAE',
    project_type: 'Apartment',
    status: 'Pre-Launch',
    total_area_acres: 8.0,
    num_towers: 3,
    num_floors: 55,
    num_units: 650,
    min_price: 2500000,
    max_price: 25000000,
    currency: 'AED',
    possession_date: 'Q2 2028',
    rera_number: 'RERA Dubai Registered',
    metro_station: 'Burj Khalifa/Dubai Mall Metro',
    metro_distance_km: 0.5,
    airport_distance_km: 15.0,
    tech_park_distance_km: 8.0,
    nearby_landmarks: 'Burj Khalifa|Dubai Mall|Dubai Fountain|Dubai Opera|DIFC',
    description: 'Emaar Address Residences in Downtown Dubai offers ultra-luxury branded residences with iconic Burj Khalifa and Fountain views. Part of the prestigious Address Hotels & Resorts brand, offering hotel-managed living with full rental services.',
    amenities: 'Hotel-Managed Services|Infinity Pool|Burj View Deck|Fine Dining|Concierge|Valet|Spa & Wellness|Private Cinema|Cigar Lounge|Kids Club|Business Centre|Smart Home Automation',
    highlights: 'Burj Khalifa Views|Emaar Premium Brand|Hotel-Managed Rentals|Downtown Address|Capital Appreciation|Golden Visa',
    cover_image: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1200&q=80',
    brochure_url: '',
    video_url: '',
    is_featured: true,
    seo_title: 'Emaar Address Residences Downtown Dubai - Luxury Apartments',
    seo_description: 'Emaar Address Residences Downtown Dubai from AED 25L. Burj Khalifa views, branded residences. NRI investment. Book via PropSarathi authorised partner.',
  },
]

const units = {
  'sattva-haven-devanahalli': [
    { unit_type: '1 BHK', bedrooms: 1, bathrooms: 1, min_area_sqft: 650, max_area_sqft: 750, min_price: 7500000, max_price: 8500000, total_units: 300, available_units: 300 },
    { unit_type: '2 BHK', bedrooms: 2, bathrooms: 2, min_area_sqft: 1050, max_area_sqft: 1250, min_price: 10000000, max_price: 13000000, total_units: 600, available_units: 600 },
    { unit_type: '3 BHK', bedrooms: 3, bathrooms: 3, min_area_sqft: 1550, max_area_sqft: 1850, min_price: 14000000, max_price: 18000000, total_units: 300, available_units: 300 },
  ],
  'brigade-orchards-devanahalli': [
    { unit_type: '1 BHK', bedrooms: 1, bathrooms: 1, min_area_sqft: 600, max_area_sqft: 700, min_price: 6500000, max_price: 7500000, total_units: 800, available_units: 400 },
    { unit_type: '2 BHK', bedrooms: 2, bathrooms: 2, min_area_sqft: 1000, max_area_sqft: 1300, min_price: 9000000, max_price: 13000000, total_units: 2200, available_units: 900 },
    { unit_type: '3 BHK', bedrooms: 3, bathrooms: 3, min_area_sqft: 1500, max_area_sqft: 1900, min_price: 14000000, max_price: 19000000, total_units: 1000, available_units: 300 },
    { unit_type: '4 BHK Penthouse', bedrooms: 4, bathrooms: 4, min_area_sqft: 2800, max_area_sqft: 3500, min_price: 18000000, max_price: 22000000, total_units: 200, available_units: 80 },
  ],
  'prestige-pine-forest-whitefield': [
    { unit_type: '2 BHK', bedrooms: 2, bathrooms: 2, min_area_sqft: 1200, max_area_sqft: 1450, min_price: 12000000, max_price: 16000000, total_units: 400, available_units: 120 },
    { unit_type: '3 BHK', bedrooms: 3, bathrooms: 3, min_area_sqft: 1700, max_area_sqft: 2200, min_price: 18000000, max_price: 26000000, total_units: 450, available_units: 90 },
    { unit_type: '4 BHK', bedrooms: 4, bathrooms: 4, min_area_sqft: 2800, max_area_sqft: 3400, min_price: 28000000, max_price: 35000000, total_units: 130, available_units: 30 },
  ],
  'damac-lagoons-dubai': [
    { unit_type: '3 BR Townhouse', bedrooms: 3, bathrooms: 3, min_area_sqft: 1800, max_area_sqft: 2200, min_price: 1800000, max_price: 2500000, total_units: 3000, available_units: 800 },
    { unit_type: '4 BR Villa', bedrooms: 4, bathrooms: 4, min_area_sqft: 2600, max_area_sqft: 3200, min_price: 2800000, max_price: 4500000, total_units: 3000, available_units: 600 },
    { unit_type: '5 BR Mansion', bedrooms: 5, bathrooms: 6, min_area_sqft: 4000, max_area_sqft: 5500, min_price: 5500000, max_price: 8500000, total_units: 2000, available_units: 400 },
  ],
  'emaar-address-residences-dubai': [
    { unit_type: 'Studio', bedrooms: 0, bathrooms: 1, min_area_sqft: 450, max_area_sqft: 600, min_price: 2500000, max_price: 3500000, total_units: 150, available_units: 150 },
    { unit_type: '1 BR', bedrooms: 1, bathrooms: 1, min_area_sqft: 800, max_area_sqft: 1100, min_price: 4000000, max_price: 6500000, total_units: 300, available_units: 300 },
    { unit_type: '2 BR', bedrooms: 2, bathrooms: 2, min_area_sqft: 1400, max_area_sqft: 1900, min_price: 7500000, max_price: 12000000, total_units: 150, available_units: 150 },
    { unit_type: '3 BR Penthouse', bedrooms: 3, bathrooms: 3, min_area_sqft: 3200, max_area_sqft: 4500, min_price: 18000000, max_price: 25000000, total_units: 50, available_units: 50 },
  ],
}

async function main() {
  console.log('🌱 Seeding projects...\n')

  for (const project of projects) {
    try {
      // Insert project
      const rows = await sql`
        INSERT INTO projects (
          slug, name, developer, city, location, address, project_type, status,
          total_area_acres, num_towers, num_floors, num_units,
          min_price, max_price, currency, possession_date, rera_number,
          metro_station, metro_distance_km, airport_distance_km, tech_park_distance_km,
          nearby_landmarks, description, amenities, highlights,
          cover_image, brochure_url, video_url, is_featured,
          seo_title, seo_description
        ) VALUES (
          ${project.slug}, ${project.name}, ${project.developer}, ${project.city},
          ${project.location}, ${project.address}, ${project.project_type}, ${project.status},
          ${project.total_area_acres}, ${project.num_towers || null}, ${project.num_floors},
          ${project.num_units}, ${project.min_price}, ${project.max_price}, ${project.currency},
          ${project.possession_date}, ${project.rera_number},
          ${project.metro_station}, ${project.metro_distance_km},
          ${project.airport_distance_km}, ${project.tech_park_distance_km},
          ${project.nearby_landmarks}, ${project.description},
          ${project.amenities}, ${project.highlights},
          ${project.cover_image}, ${project.brochure_url}, ${project.video_url},
          ${project.is_featured}, ${project.seo_title}, ${project.seo_description}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          cover_image = EXCLUDED.cover_image,
          updated_at = NOW()
        RETURNING id
      `

      const projectId = rows[0].id
      console.log(`✅ ${project.name} (ID: ${projectId})`)

      // Insert units
      const projectUnits = units[project.slug] || []
      for (const unit of projectUnits) {
        await sql`
          INSERT INTO project_units (project_id, unit_type, bedrooms, bathrooms, min_area_sqft, max_area_sqft, min_price, max_price, available_units, total_units)
          VALUES (${projectId}, ${unit.unit_type}, ${unit.bedrooms}, ${unit.bathrooms}, ${unit.min_area_sqft}, ${unit.max_area_sqft}, ${unit.min_price}, ${unit.max_price}, ${unit.available_units}, ${unit.total_units})
          ON CONFLICT DO NOTHING
        `
      }
      console.log(`   └─ ${projectUnits.length} unit types seeded`)

    } catch (e) {
      console.error(`❌ Failed to seed ${project.name}:`, e.message)
    }
  }

  console.log('\n🎉 Seed complete! 5 projects ready.')
  console.log('📝 Update real details from CRM admin panel.')
}

main().catch(e => { console.error(e); process.exit(1) })
