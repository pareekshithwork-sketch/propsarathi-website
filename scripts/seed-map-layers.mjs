// scripts/seed-map-layers.mjs
// Run: node --env-file=.env.local scripts/seed-map-layers.mjs

import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { DOMParser } from "xmldom"
import { kml as kmlToGeoJson } from "@tmcw/togeojson"

const sql = neon(process.env.DATABASE_URL)

const FOLDER_COLORS = {
  "PRR": "#EF4444",
  "BLR Suburban Rail": "#6B7280",
  "Intermediate Ring Road": "#FB923C",
  "Satellite Town Ring Road": "#8B5CF6",
  "Under Construction Metro Lines Namma Metro": "#F59E0B",
  "Proposed Lines": "#94A3B8",
}

function colorForFolder(name) {
  return FOLDER_COLORS[name] || "#3B82F6"
}

const KML_PATH = "/Users/pareekshithrawal/Downloads/BLR - PropSarathi's Map.kml"

async function main() {
  console.log("⏳ Truncating map_layers table...")
  await sql`TRUNCATE TABLE map_layers`
  console.log("✅ Truncated.")

  console.log("📖 Reading KML file...")
  const xmlText = readFileSync(KML_PATH, "utf-8")

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, "text/xml")

  const folders = Array.from(xmlDoc.getElementsByTagName("Folder"))
  console.log(`📂 Found ${folders.length} folders.`)

  const fileName = "BLR - PropSarathi's Map.kml"
  let inserted = 0

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i]
    const nameNodes = folder.getElementsByTagName("name")
    const name = nameNodes[0]?.textContent?.trim() || "Unnamed Layer"
    const color = colorForFolder(name)

    // Build minimal KML doc for this folder
    const miniKml = parser.parseFromString(
      `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document></Document></kml>`,
      "text/xml"
    )
    const docEl = miniKml.getElementsByTagName("Document")[0]

    // Copy styles from source doc
    const srcDoc = xmlDoc.getElementsByTagName("Document")[0]
    if (srcDoc) {
      const children = srcDoc.childNodes
      for (let j = 0; j < children.length; j++) {
        const child = children[j]
        if (child.nodeName && (child.nodeName.startsWith("Style") || child.nodeName === "StyleMap")) {
          docEl.appendChild(miniKml.importNode ? miniKml.importNode(child, true) : child.cloneNode(true))
        }
      }
    }
    docEl.appendChild(miniKml.importNode ? miniKml.importNode(folder, true) : folder.cloneNode(true))

    let geojson
    try {
      geojson = kmlToGeoJson(miniKml)
    } catch (e) {
      console.warn(`⚠️ Failed to convert folder "${name}":`, e.message)
      geojson = { type: "FeatureCollection", features: [] }
    }

    const features = geojson?.features || []
    const featureCount = features.length
    console.log(`  [${i + 1}/${folders.length}] "${name}" → ${featureCount} features, color ${color}`)

    // Build feature_styles array
    const featureStyles = features.map((feature, idx) => ({
      index: idx,
      name: feature.properties?.name || feature.properties?.Name || `Feature ${idx + 1}`,
      color: color,
      visible: true,
    }))

    await sql`
      INSERT INTO map_layers (file_name, folder_name, color, geojson, visible, sort_order, feature_styles)
      VALUES (${fileName}, ${name}, ${color}, ${JSON.stringify(geojson)}, true, ${i}, ${JSON.stringify(featureStyles)})
    `
    inserted++
  }

  console.log(`\n✅ Done! Inserted ${inserted} layers.`)
}

main().catch(err => {
  console.error("❌ Error:", err)
  process.exit(1)
})
