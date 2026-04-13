import sql from './db'

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

export async function getAllProjects(filters?: {
  city?: string
  projectType?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  status?: string
  search?: string
}) {
  let rows = await sql`SELECT * FROM projects WHERE is_active = true ORDER BY is_featured DESC, created_at DESC`

  if (filters) {
    if (filters.city) rows = rows.filter((r: any) => r.city?.toLowerCase() === filters.city!.toLowerCase())
    if (filters.projectType) rows = rows.filter((r: any) => r.project_type?.toLowerCase() === filters.projectType!.toLowerCase())
    if (filters.status) rows = rows.filter((r: any) => r.status?.toLowerCase() === filters.status!.toLowerCase())
    if (filters.minPrice) rows = rows.filter((r: any) => r.max_price >= filters.minPrice!)
    if (filters.maxPrice) rows = rows.filter((r: any) => r.min_price <= filters.maxPrice!)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      rows = rows.filter((r: any) =>
        r.name?.toLowerCase().includes(q) ||
        r.developer?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q)
      )
    }
  }

  return rows.map(rowToProject)
}

export async function getProjectBySlug(slug: string) {
  const rows = await sql`SELECT * FROM projects WHERE slug = ${slug} AND is_active = true`
  if (!rows[0]) return null
  const project = rowToProject(rows[0])
  const [units, images] = await Promise.all([
    getProjectUnits(rows[0].id),
    getProjectImages(rows[0].id),
  ])
  return { ...project, units, images }
}

export async function getProjectById(id: number) {
  const rows = await sql`SELECT * FROM projects WHERE id = ${id}`
  return rows[0] ? rowToProject(rows[0]) : null
}

export async function createProject(data: any) {
  const rows = await sql`
    INSERT INTO projects (
      slug, name, developer, city, location, address, project_type, status,
      total_area_acres, num_towers, num_floors, num_units,
      min_price, max_price, currency, possession_date, rera_number,
      metro_station, metro_distance_km, latitude, longitude,
      description, amenities, highlights, cover_image, brochure_url, video_url,
      is_featured, is_active,
      airport_distance_km, tech_park_distance_km, nearby_landmarks,
      seo_title, seo_description, payment_plan
    ) VALUES (
      ${data.slug}, ${data.name}, ${data.developer||''}, ${data.city}, ${data.location||''},
      ${data.address||''}, ${data.projectType||''}, ${data.status||'Pre-Launch'},
      ${data.totalAreaAcres||null}, ${data.numTowers||null}, ${data.numFloors||null}, ${data.numUnits||null},
      ${data.minPrice||null}, ${data.maxPrice||null}, ${data.currency||'INR'},
      ${data.possessionDate||''}, ${data.reraNumber||''},
      ${data.metroStation||''}, ${data.metroDistanceKm||null},
      ${data.latitude||null}, ${data.longitude||null},
      ${data.description||''}, ${data.amenities||''}, ${data.highlights||''},
      ${data.coverImage||''}, ${data.brochureUrl||''}, ${data.videoUrl||''},
      ${data.isFeatured||false}, ${data.isActive !== false},
      ${data.airportDistanceKm||null}, ${data.techParkDistanceKm||null}, ${data.nearbyLandmarks||''},
      ${data.seoTitle||''}, ${data.seoDescription||''}, ${data.paymentPlan||''}
    ) RETURNING id
  `
  return rows[0].id
}

export async function updateProject(id: number, data: any) {
  await sql`UPDATE projects SET updated_at = NOW() WHERE id = ${id}`
  if (data.name !== undefined) await sql`UPDATE projects SET name = ${data.name} WHERE id = ${id}`
  if (data.slug !== undefined) await sql`UPDATE projects SET slug = ${data.slug} WHERE id = ${id}`
  if (data.developer !== undefined) await sql`UPDATE projects SET developer = ${data.developer} WHERE id = ${id}`
  if (data.city !== undefined) await sql`UPDATE projects SET city = ${data.city} WHERE id = ${id}`
  if (data.location !== undefined) await sql`UPDATE projects SET location = ${data.location} WHERE id = ${id}`
  if (data.address !== undefined) await sql`UPDATE projects SET address = ${data.address} WHERE id = ${id}`
  if (data.projectType !== undefined) await sql`UPDATE projects SET project_type = ${data.projectType} WHERE id = ${id}`
  if (data.status !== undefined) await sql`UPDATE projects SET status = ${data.status} WHERE id = ${id}`
  if (data.totalAreaAcres !== undefined) await sql`UPDATE projects SET total_area_acres = ${data.totalAreaAcres} WHERE id = ${id}`
  if (data.numTowers !== undefined) await sql`UPDATE projects SET num_towers = ${data.numTowers} WHERE id = ${id}`
  if (data.numFloors !== undefined) await sql`UPDATE projects SET num_floors = ${data.numFloors} WHERE id = ${id}`
  if (data.numUnits !== undefined) await sql`UPDATE projects SET num_units = ${data.numUnits} WHERE id = ${id}`
  if (data.minPrice !== undefined) await sql`UPDATE projects SET min_price = ${data.minPrice} WHERE id = ${id}`
  if (data.maxPrice !== undefined) await sql`UPDATE projects SET max_price = ${data.maxPrice} WHERE id = ${id}`
  if (data.currency !== undefined) await sql`UPDATE projects SET currency = ${data.currency} WHERE id = ${id}`
  if (data.possessionDate !== undefined) await sql`UPDATE projects SET possession_date = ${data.possessionDate} WHERE id = ${id}`
  if (data.reraNumber !== undefined) await sql`UPDATE projects SET rera_number = ${data.reraNumber} WHERE id = ${id}`
  if (data.metroStation !== undefined) await sql`UPDATE projects SET metro_station = ${data.metroStation} WHERE id = ${id}`
  if (data.metroDistanceKm !== undefined) await sql`UPDATE projects SET metro_distance_km = ${data.metroDistanceKm} WHERE id = ${id}`
  if (data.description !== undefined) await sql`UPDATE projects SET description = ${data.description} WHERE id = ${id}`
  if (data.amenities !== undefined) await sql`UPDATE projects SET amenities = ${data.amenities} WHERE id = ${id}`
  if (data.highlights !== undefined) await sql`UPDATE projects SET highlights = ${data.highlights} WHERE id = ${id}`
  if (data.coverImage !== undefined) await sql`UPDATE projects SET cover_image = ${data.coverImage} WHERE id = ${id}`
  if (data.brochureUrl !== undefined) await sql`UPDATE projects SET brochure_url = ${data.brochureUrl} WHERE id = ${id}`
  if (data.videoUrl !== undefined) await sql`UPDATE projects SET video_url = ${data.videoUrl} WHERE id = ${id}`
  if (data.isFeatured !== undefined) await sql`UPDATE projects SET is_featured = ${data.isFeatured} WHERE id = ${id}`
  if (data.isActive !== undefined) await sql`UPDATE projects SET is_active = ${data.isActive} WHERE id = ${id}`
  if (data.airportDistanceKm !== undefined) await sql`UPDATE projects SET airport_distance_km = ${data.airportDistanceKm} WHERE id = ${id}`
  if (data.techParkDistanceKm !== undefined) await sql`UPDATE projects SET tech_park_distance_km = ${data.techParkDistanceKm} WHERE id = ${id}`
  if (data.nearbyLandmarks !== undefined) await sql`UPDATE projects SET nearby_landmarks = ${data.nearbyLandmarks} WHERE id = ${id}`
  if (data.seoTitle !== undefined) await sql`UPDATE projects SET seo_title = ${data.seoTitle} WHERE id = ${id}`
  if (data.seoDescription !== undefined) await sql`UPDATE projects SET seo_description = ${data.seoDescription} WHERE id = ${id}`
  if (data.paymentPlan !== undefined) await sql`UPDATE projects SET payment_plan = ${data.paymentPlan} WHERE id = ${id}`
}

export async function deleteProject(id: number) {
  await sql`UPDATE projects SET is_active = false WHERE id = ${id}`
}

function rowToProject(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    developer: row.developer,
    city: row.city,
    location: row.location,
    address: row.address,
    projectType: row.project_type,
    status: row.status,
    totalAreaAcres: row.total_area_acres,
    numTowers: row.num_towers,
    numFloors: row.num_floors,
    numUnits: row.num_units,
    minPrice: row.min_price,
    maxPrice: row.max_price,
    currency: row.currency,
    possessionDate: row.possession_date,
    reraNumber: row.rera_number,
    metroStation: row.metro_station,
    metroDistanceKm: row.metro_distance_km,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    amenities: row.amenities ? row.amenities.split('|') : [],
    highlights: row.highlights ? row.highlights.split('|') : [],
    coverImage: row.cover_image,
    brochureUrl: row.brochure_url,
    videoUrl: row.video_url,
    isFeatured: row.is_featured,
    isActive: row.is_active,
    createdAt: row.created_at,
    airportDistanceKm: row.airport_distance_km,
    techParkDistanceKm: row.tech_park_distance_km,
    nearbyLandmarks: row.nearby_landmarks || '',
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    paymentPlan: row.payment_plan || '',
  }
}

// ─── UNITS ────────────────────────────────────────────────────────────────────

export async function getProjectUnits(projectId: number) {
  const rows = await sql`SELECT * FROM project_units WHERE project_id = ${projectId} ORDER BY bedrooms, min_area_sqft`
  return rows.map((r: any) => ({
    id: r.id,
    projectId: r.project_id,
    unitType: r.unit_type,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    minAreaSqft: r.min_area_sqft,
    maxAreaSqft: r.max_area_sqft,
    minPrice: r.min_price,
    maxPrice: r.max_price,
    availableUnits: r.available_units,
    totalUnits: r.total_units,
    floorPlanUrl: r.floor_plan_url,
  }))
}

export async function addProjectUnit(projectId: number, unit: any) {
  await sql`
    INSERT INTO project_units (project_id, unit_type, bedrooms, bathrooms, min_area_sqft, max_area_sqft, min_price, max_price, available_units, total_units, floor_plan_url)
    VALUES (${projectId}, ${unit.unitType||''}, ${unit.bedrooms||null}, ${unit.bathrooms||null}, ${unit.minAreaSqft||null}, ${unit.maxAreaSqft||null}, ${unit.minPrice||null}, ${unit.maxPrice||null}, ${unit.availableUnits||null}, ${unit.totalUnits||null}, ${unit.floorPlanUrl||''})
  `
}

// ─── IMAGES ───────────────────────────────────────────────────────────────────

export async function getProjectImages(projectId: number) {
  const rows = await sql`SELECT * FROM project_images WHERE project_id = ${projectId} ORDER BY sort_order`
  return rows.map((r: any) => ({
    id: r.id,
    url: r.url,
    caption: r.caption,
    mediaType: r.media_type,
    sortOrder: r.sort_order,
  }))
}

export async function addProjectImage(projectId: number, img: any) {
  await sql`
    INSERT INTO project_images (project_id, url, caption, media_type, sort_order)
    VALUES (${projectId}, ${img.url}, ${img.caption||''}, ${img.mediaType||'image'}, ${img.sortOrder||0})
  `
}

// ─── PORTAL VIEWERS ───────────────────────────────────────────────────────────

export async function getViewerByPhone(phone: string, countryCode: string) {
  const rows = await sql`SELECT * FROM portal_viewers WHERE phone = ${phone} AND country_code = ${countryCode}`
  return rows[0] || null
}

export async function createViewer(data: {
  phone?: string; countryCode?: string; name?: string; email?: string;
  firstName?: string; lastName?: string; purpose?: string;
  loginMethod?: string; googleId?: string; avatarUrl?: string;
}) {
  const rows = await sql`
    INSERT INTO portal_viewers (phone, country_code, name, email, first_name, last_name, purpose, login_method, google_id, avatar_url)
    VALUES (
      ${data.phone||''}, ${data.countryCode||'+91'}, ${data.name||''}, ${data.email||''},
      ${data.firstName||''}, ${data.lastName||''}, ${data.purpose||''},
      ${data.loginMethod||'whatsapp'}, ${data.googleId||''}, ${data.avatarUrl||''}
    ) RETURNING id
  `
  return rows[0].id
}

export async function updateViewerLastSeen(id: number) {
  await sql`UPDATE portal_viewers SET last_seen = NOW() WHERE id = ${id}`
}

export async function updateViewerCRMLead(id: number, leadId: string) {
  await sql`UPDATE portal_viewers SET crm_lead_id = ${leadId} WHERE id = ${id}`
}

export async function updateViewerProfile(id: number, data: { name?: string; email?: string }) {
  if (data.name) await sql`UPDATE portal_viewers SET name = ${data.name} WHERE id = ${id}`
  if (data.email) await sql`UPDATE portal_viewers SET email = ${data.email} WHERE id = ${id}`
}

export async function getViewerByGoogleId(googleId: string) {
  const rows = await sql`SELECT * FROM portal_viewers WHERE google_id = ${googleId}`
  return rows[0] || null
}

export async function getViewerByEmail(email: string) {
  const rows = await sql`SELECT * FROM portal_viewers WHERE email = ${email}`
  return rows[0] || null
}

export async function updateViewer(id: number, data: {
  name?: string; email?: string; firstName?: string; lastName?: string;
  purpose?: string; avatarUrl?: string;
}) {
  if (data.name !== undefined) await sql`UPDATE portal_viewers SET name = ${data.name} WHERE id = ${id}`
  if (data.email !== undefined) await sql`UPDATE portal_viewers SET email = ${data.email} WHERE id = ${id}`
  if (data.firstName !== undefined) await sql`UPDATE portal_viewers SET first_name = ${data.firstName} WHERE id = ${id}`
  if (data.lastName !== undefined) await sql`UPDATE portal_viewers SET last_name = ${data.lastName} WHERE id = ${id}`
  if (data.purpose !== undefined) await sql`UPDATE portal_viewers SET purpose = ${data.purpose} WHERE id = ${id}`
  if (data.avatarUrl !== undefined) await sql`UPDATE portal_viewers SET avatar_url = ${data.avatarUrl} WHERE id = ${id}`
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export async function createOTP(identifier: string, typeOrCountryCode: string, otp: string) {
  // identifier: phone number or email; typeOrCountryCode: 'email' or country code like '+91'
  await sql`UPDATE portal_otp SET used = true WHERE phone = ${identifier} AND country_code = ${typeOrCountryCode}`
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 min
  await sql`
    INSERT INTO portal_otp (phone, country_code, otp, expires_at)
    VALUES (${identifier}, ${typeOrCountryCode}, ${otp}, ${expires.toISOString()})
  `
}

export async function verifyOTP(identifier: string, typeOrCountryCode: string, otp: string): Promise<boolean> {
  const rows = await sql`
    SELECT * FROM portal_otp
    WHERE phone = ${identifier} AND country_code = ${typeOrCountryCode}
      AND otp = ${otp} AND used = false AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1
  `
  if (!rows[0]) return false
  await sql`UPDATE portal_otp SET used = true WHERE id = ${rows[0].id}`
  return true
}

// ─── PAGE VIEWS ───────────────────────────────────────────────────────────────

export async function logPageView(viewerId: number, projectSlug: string, durationSeconds: number, enquiryTriggered: boolean) {
  await sql`
    INSERT INTO portal_page_views (viewer_id, project_slug, duration_seconds, enquiry_triggered)
    VALUES (${viewerId}, ${projectSlug}, ${durationSeconds}, ${enquiryTriggered})
  `
}
