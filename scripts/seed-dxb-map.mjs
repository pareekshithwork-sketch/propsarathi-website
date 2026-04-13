import { readFileSync } from 'fs'
import { DOMParser } from '@xmldom/xmldom'
import { kml } from '@tmcw/togeojson'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const kmlText = readFileSync('/Users/pareekshithrawal/Downloads/DXB PropSarathi\'s Map.kml', 'utf8')
const doc = new DOMParser().parseFromString(kmlText, 'text/xml')
const folders = Array.from(doc.getElementsByTagName('Folder'))

const COLORS = {
  'Existing Lines':           '#DC2626',
  'Future Lines':             '#9333EA',
  'Rail':                     '#1D4ED8',
  'Existing Stations':        '#DC2626',
  'Proposed Stations':        '#9333EA',
  'Marine Stations':          '#0891B2',
  'Proposed Skypod Stations': '#7C3AED',
  'Bike Lanes':               '#16A34A',
}

// Delete existing DXB layers
await sql`DELETE FROM map_layers WHERE file_name = 'DXB PropSarathi Map'`
console.log('Cleared existing DXB layers')

for (let i = 0; i < folders.length; i++) {
  const folder = folders[i]
  const name = folder.getElementsByTagName('name')[0]?.textContent?.trim() || 'Unnamed'
  const miniKml = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>${folder.toString()}</Document></kml>`
  const miniDoc = new DOMParser().parseFromString(miniKml, 'text/xml')
  const geojson = kml(miniDoc)
  const color = COLORS[name] || '#3B82F6'
  const featureStyles = geojson.features.map((f, idx) => ({
    index: idx,
    name: f.properties?.name || f.properties?.Name || `Feature ${idx+1}`,
    color,
    visible: true
  }))

  await sql.query(
    'INSERT INTO map_layers (file_name, folder_name, color, geojson, visible, sort_order, feature_styles) VALUES ($1,$2,$3,$4::jsonb,true,$5,$6::jsonb)',
    ['DXB PropSarathi Map', name, color, JSON.stringify(geojson), i, JSON.stringify(featureStyles)]
  )
  console.log(`✅ ${name} → ${geojson.features.length} features`)
}

console.log('Done — DXB map seeded')
process.exit(0)
