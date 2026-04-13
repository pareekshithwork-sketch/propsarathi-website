"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { MapPin, Layers, X, ExternalLink, Building2, ChevronLeft } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureStyle {
  index: number
  name: string
  color: string
  visible: boolean
}

interface DbLayer {
  id: string
  file_name: string
  folder_name: string
  color: string
  geojson: any
  visible: boolean
  sort_order: number
  feature_styles?: FeatureStyle[]
}

interface Project {
  name: string
  slug: string
  city: string
  location: string
  lat: number
  lng: number
  status: string
  minPrice: number
  maxPrice: number
  currency: string
  type: string
  developer: string
}

// ─── Static project data ──────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  { name: "Sattva Haven", slug: "sattva-haven-devanahalli", city: "Bangalore", location: "Devanahalli, North Bangalore", lat: 13.3916, lng: 77.7117, status: "Pre-Launch", minPrice: 7500000, maxPrice: 18000000, currency: "INR", type: "Apartment", developer: "Sattva Group" },
  { name: "Brigade Orchards", slug: "brigade-orchards-devanahalli", city: "Bangalore", location: "Devanahalli, North Bangalore", lat: 13.3780, lng: 77.7050, status: "Just Launched", minPrice: 6500000, maxPrice: 22000000, currency: "INR", type: "Apartment", developer: "Brigade Group" },
  { name: "Prestige Pine Forest", slug: "prestige-pine-forest-whitefield", city: "Bangalore", location: "Whitefield, East Bangalore", lat: 12.9698, lng: 77.7499, status: "Under Construction", minPrice: 12000000, maxPrice: 35000000, currency: "INR", type: "Apartment", developer: "Prestige Group" },
  { name: "DAMAC Lagoons", slug: "damac-lagoons-dubai", city: "Dubai", location: "Dubai Land, Dubai", lat: 25.0289, lng: 55.2673, status: "Just Launched", minPrice: 1800000, maxPrice: 8500000, currency: "AED", type: "Villa", developer: "DAMAC Properties" },
  { name: "Emaar Address Residences", slug: "emaar-address-residences-dubai", city: "Dubai", location: "Downtown Dubai", lat: 25.1972, lng: 55.2744, status: "Pre-Launch", minPrice: 2500000, maxPrice: 25000000, currency: "AED", type: "Apartment", developer: "Emaar" },
]

const STATUS_COLOR: Record<string, string> = {
  "Pre-Launch": "#F59E0B",
  "Just Launched": "#422D83",
  "Under Construction": "#3B82F6",
  "Ready to Move": "#10B981",
}

function formatPrice(price: number, currency: string) {
  if (currency === "AED") return `AED ${(price / 1000000).toFixed(1)}M`
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`
  return `₹${(price / 100000).toFixed(0)}L`
}

// ─── Tile providers ───────────────────────────────────────────────────────────

const TILE_PROVIDERS: Record<string, { url: string; opts: any; label: string; icon: string }> = {
  street:    { label: "Street",    icon: "🗺️", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",                                   opts: { maxZoom: 19 } },
  street_en: { label: "Street EN", icon: "🗺️", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",        opts: { maxZoom: 19, subdomains: "abcd" } },
  satellite: { label: "Satellite", icon: "🛰️", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", opts: { maxZoom: 19 } },
  terrain:   { label: "Terrain",   icon: "🏔️", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",                               opts: { maxZoom: 17, subdomains: "abc" } },
  dark:      { label: "Dark",      icon: "🌙", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",                   opts: { maxZoom: 19, subdomains: "abcd" } },
  light:     { label: "Light",     icon: "☀️", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",                  opts: { maxZoom: 19, subdomains: "abcd" } },
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapClient() {
  const mapRef              = useRef<HTMLDivElement>(null)
  const mapInstanceRef      = useRef<any>(null)
  const projectsLGRef       = useRef<any>(null)
  const kmlLayerGroupsRef   = useRef<Record<string, any>>({})
  const kmlDataFingerprintRef = useRef<Record<string, string>>({})
  const tileLayerRef        = useRef<any>(null)

  const [city, setCity]               = useState<"Bangalore" | "Dubai">("Bangalore")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjects, setShowProjects] = useState(true)
  const [showLayers, setShowLayers]   = useState(false)
  const [mapReady, setMapReady]       = useState(false)
  const [mapType, setMapType]         = useState("street")
  // Local visibility state — not persisted to DB (view-only)
  const [kmlLayers, setKmlLayers]     = useState<DbLayer[]>([])

  const CITY_VIEW = {
    Bangalore: { lat: 13.0475, lng: 77.5950, zoom: 11 },
    Dubai:     { lat: 25.1324, lng: 55.2708, zoom: 11 },
  }

  // ── Init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => {
      const L = (window as any).L
      const view = CITY_VIEW[city]
      const map = L.map(mapRef.current, { center: [view.lat, view.lng], zoom: view.zoom, zoomControl: false, preferCanvas: true })
      const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "", maxZoom: 19 })
      tile.addTo(map)
      tileLayerRef.current = tile
      map.attributionControl.setPrefix("")
      fetch("/maps/india-boundary.geojson").then(r => r.json()).then(g => {
        L.geoJSON(g, { style: { color: "#FF6600", weight: 2, opacity: 0.9, fillOpacity: 0 }, interactive: false }).addTo(map)
      }).catch(() => {})
      L.control.zoom({ position: "bottomright" }).addTo(map)
      mapInstanceRef.current = map
      projectsLGRef.current = L.layerGroup().addTo(map)
      setMapReady(true)
    }
    document.head.appendChild(script)

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── City bounding boxes for auto-detect ──────────────────────────────────────
  const CITY_BOUNDS: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
    Bangalore: { latMin: 12.7, latMax: 13.5, lngMin: 77.3, lngMax: 78.0 },
    Dubai:     { latMin: 24.8, latMax: 25.5, lngMin: 54.9, lngMax: 55.7 },
  }

  // ── City switch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const view = CITY_VIEW[city]
    map.flyTo([view.lat, view.lng], view.zoom, { duration: 1.5 })
    setSelectedProject(null)
    const defaultType = city === "Dubai" ? "street_en" : "street"
    setMapType(defaultType)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // ── Auto-detect city from map position ───────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const map = mapInstanceRef.current

    const onMoveEnd = () => {
      const center = map.getCenter()
      const lat = center.lat
      const lng = center.lng
      for (const [cityName, bounds] of Object.entries(CITY_BOUNDS)) {
        if (lat >= bounds.latMin && lat <= bounds.latMax && lng >= bounds.lngMin && lng <= bounds.lngMax) {
          setCity(prev => {
            if (prev !== cityName) return cityName as "Bangalore" | "Dubai"
            return prev
          })
          break
        }
      }
    }

    map.on("moveend", onMoveEnd)
    return () => map.off("moveend", onMoveEnd)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady])

  // ── Render project pins ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !projectsLGRef.current) return
    const L = (window as any).L
    projectsLGRef.current.clearLayers()
    if (!showProjects) return
    PROJECTS.filter(p => p.city === city).forEach(project => {
      const color = STATUS_COLOR[project.status] || "#422D83"
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${color};color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;cursor:pointer;"><span style="transform:rotate(45deg);font-size:14px;">🏢</span></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32],
      })
      L.marker([project.lat, project.lng], { icon })
        .addTo(projectsLGRef.current)
        .on("click", () => setSelectedProject(project))
        .bindTooltip(`<b>${project.name}</b><br/>${project.location}`, { direction: "top", offset: [0, -34], className: "ps-tooltip" })
    })
  }, [mapReady, showProjects, city])

  // ── Swap tile layer when mapType changes ─────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current
    const provider = TILE_PROVIDERS[mapType] || TILE_PROVIDERS.street
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
    const newTile = L.tileLayer(provider.url, { ...provider.opts, attribution: "" })
    newTile.addTo(map)
    tileLayerRef.current = newTile
  }, [mapReady, mapType])

  // ── Load KML layers — on mount + on tab focus (always fresh) ────────────────
  const fetchLayers = useCallback((cityName: string) => {
    fetch(`/api/map/layers?city=${cityName}&t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Always start all layers hidden — user turns them on via the Layers panel
          setKmlLayers(data.map((l: DbLayer) => ({ ...l, visible: false })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Clear layers immediately so old-city layers vanish before new ones load
    setKmlLayers([])
    fetchLayers(city)
    const onVisible = () => { if (document.visibilityState === "visible") fetchLayers(city) }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [fetchLayers, city])

  // ── Build a Leaflet layerGroup for a single KML layer (called once per layer) ──
  const buildLayerGroup = useCallback((layer: DbLayer, L: any) => {
    const lg = L.layerGroup()
    try {
      const featureColorMap = new Map<number, string>()
      const featureVisibleMap = new Map<number, boolean>()
      if (layer.feature_styles?.length) {
        layer.feature_styles.forEach((fs, i) => {
          featureColorMap.set(i, fs.color || layer.color)
          featureVisibleMap.set(i, fs.visible !== false)
        })
      }

      const features = layer.geojson?.features || []
      const totalFeatures = features.length
      // Label density: ≤5 features → every feature; 6-20 → every 3rd; >20 (PRR=252, Suburban=391) → every 50th
      const labelInterval = totalFeatures <= 5 ? 1 : totalFeatures <= 20 ? 3 : 50

      const FOLDER_SHORT: Record<string, string> = {
        "PRR": "PRR",
        "BLR Suburban Rail": "Suburban Rail",
        "Intermediate Ring Road": "IRR",
        "Satellite Town Ring Road": "STRR",
        "Under Construction Metro Lines Namma Metro": "Metro UC",
        "Proposed Lines": "Proposed",
      }
      const shortFolder = FOLDER_SHORT[layer.folder_name] || layer.folder_name
      const isPRR = layer.folder_name === "PRR"

      features.forEach((feature: any, i: number) => {
        const color = featureColorMap.get(i) || layer.color
        const visible = featureVisibleMap.get(i) !== false
        if (!visible) return

        const featureName = feature.properties?.name || feature.properties?.Name || ""
        const labelText = isPRR
          ? "PRR"
          : (featureName && featureName !== layer.folder_name && !featureName.startsWith("Feature ")
              ? `${shortFolder} • ${featureName}`
              : shortFolder)

        const singleGeoJson = { type: "FeatureCollection", features: [feature] }
        const geoLayer = L.geoJSON(singleGeoJson, {
          style: () => ({ color, weight: 3, opacity: 0.85, fillColor: color, fillOpacity: 0.15 }),
          pointToLayer: (_: any, latlng: any) => {
            const icon = L.divIcon({
              className: "",
              html: `<div style="background:${color};width:10px;height:10px;border-radius:50%;border:2px solid white;"></div>`,
              iconSize: [10, 10], iconAnchor: [5, 5],
            })
            return L.marker(latlng, { icon })
          },
          onEachFeature: (f: any, lyr: any) => {
            const name = f.properties?.name || f.properties?.Name || layer.folder_name
            lyr.bindTooltip(`📍 ${name}`, { sticky: true, className: "ps-tooltip" })
          },
        })
        geoLayer.addTo(lg)

        if (i % labelInterval === 0) {
          try {
            const geom = feature.geometry
            let midLat: number | null = null
            let midLng: number | null = null

            if (geom?.type === "LineString" && geom.coordinates?.length) {
              const mid = Math.floor(geom.coordinates.length / 2)
              midLng = geom.coordinates[mid][0]; midLat = geom.coordinates[mid][1]
            } else if (geom?.type === "MultiLineString" && geom.coordinates?.length) {
              const line = geom.coordinates[0]
              const mid = Math.floor(line.length / 2)
              midLng = line[mid][0]; midLat = line[mid][1]
            } else if (geom?.type === "Polygon" && geom.coordinates?.length) {
              const ring = geom.coordinates[0]
              const mid = Math.floor(ring.length / 2)
              midLng = ring[mid][0]; midLat = ring[mid][1]
            }

            if (midLat !== null && midLng !== null) {
              const labelIcon = L.divIcon({
                className: "",
                html: `<div style="background:rgba(255,255,255,0.85);color:${color};font-size:11px;font-weight:700;font-family:system-ui,sans-serif;padding:2px 5px;border-radius:3px;border:1.5px solid ${color};white-space:nowrap;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${labelText}</div>`,
                iconSize: undefined as any,
                iconAnchor: [0, 10],
              })
              L.marker([midLat, midLng], { icon: labelIcon, interactive: false, zIndexOffset: -100 }).addTo(lg)
            }
          } catch {}
        }
      })
    } catch (e) { console.warn("KML build error", layer.folder_name, e) }
    return lg
  }, [])

  // ── Render KML layers — build once per layer, then only toggle visibility ─────
  // This avoids re-creating heavy GeoJSON layers on every state change.
  // Visibility toggle is just map.addLayer / map.removeLayer — instant, no flicker.
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current

    // Remove layer groups that no longer exist in the current city's data
    const newIds = new Set(kmlLayers.map(l => String(l.id)))
    Object.keys(kmlLayerGroupsRef.current).forEach(id => {
      if (!newIds.has(id)) {
        if (map.hasLayer(kmlLayerGroupsRef.current[id])) map.removeLayer(kmlLayerGroupsRef.current[id])
        delete kmlLayerGroupsRef.current[id]
        delete kmlDataFingerprintRef.current[id]
      }
    })

    kmlLayers.forEach(layer => {
      const id = String(layer.id)
      // Fingerprint covers the things that would require a visual rebuild
      const fingerprint = `${layer.geojson?.features?.length}|${layer.color}|${layer.feature_styles?.length ?? 0}`

      if (!kmlLayerGroupsRef.current[id] || kmlDataFingerprintRef.current[id] !== fingerprint) {
        // Data is new or changed — build the layer group (happens once per city load)
        if (kmlLayerGroupsRef.current[id] && map.hasLayer(kmlLayerGroupsRef.current[id])) {
          map.removeLayer(kmlLayerGroupsRef.current[id])
        }
        kmlLayerGroupsRef.current[id] = buildLayerGroup(layer, L)
        kmlDataFingerprintRef.current[id] = fingerprint
      }

      // Toggle visibility — no rebuild, just add/remove the pre-built group
      const lg = kmlLayerGroupsRef.current[id]
      if (layer.visible && !map.hasLayer(lg)) lg.addTo(map)
      else if (!layer.visible && map.hasLayer(lg)) map.removeLayer(lg)
    })
  }, [mapReady, kmlLayers, buildLayerGroup])

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-gray-900">
      <style>{`
        .ps-tooltip { background:white!important;border:none!important;border-radius:8px!important;box-shadow:0 4px 12px rgba(0,0,0,0.15)!important;padding:6px 10px!important;font-size:12px!important;font-weight:500!important;color:#1f2937!important; }
        .ps-tooltip::before { display:none!important; }
        .leaflet-container { font-family:inherit; }
        .leaflet-control-attribution { display:none!important; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#422D83] transition">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:block">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#422D83] rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-800 text-sm">PropSarathi Investment Map</span>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["Bangalore", "Dubai"] as const).map(c => (
            <button key={c} onClick={() => setCity(c)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${city === c ? "bg-[#422D83] text-white shadow" : "text-gray-600 hover:text-gray-800"}`}>
              {c === "Bangalore" ? "🇮🇳 Bangalore" : "🇦🇪 Dubai"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowLayers(!showLayers)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${showLayers ? "bg-[#422D83] text-white border-[#422D83]" : "bg-white text-gray-600 border-gray-200 hover:border-[#422D83]"}`}>
          <Layers className="w-4 h-4" />
          <span className="hidden sm:block">Layers</span>
        </button>
      </div>

      {/* ── Layers panel (view-only) ── */}
      {showLayers && (
        <div className="absolute top-[60px] right-4 z-[1001] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Map Layers</p>
            <button onClick={() => setShowLayers(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>

          {/* Our Projects toggle */}
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Projects</p>
            <button onClick={() => setShowProjects(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                style={{ borderColor: "#422D83", background: showProjects ? "#422D83" : "white" }}>
                {showProjects && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-sm font-medium text-gray-700">Our Projects</span>
              <div className="ml-auto w-3 h-3 rounded-full shrink-0" style={{ background: "#422D83" }} />
            </button>
          </div>

          {/* Status legend */}
          <div className="mb-3 px-1">
            {Object.entries(STATUS_COLOR).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2 py-0.5">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-gray-500">{status}</span>
              </div>
            ))}
          </div>

          {/* KML layers — local toggle only (view-only, no DB write) */}
          {kmlLayers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Map Layers</p>
              <div className="space-y-1">
                {kmlLayers.map(layer => (
                  <button
                    key={layer.id}
                    onClick={() => setKmlLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l))}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{ borderColor: layer.color, background: layer.visible ? layer.color : "white" }}>
                      {layer.visible && <span className="text-white text-xs leading-none">✓</span>}
                    </div>
                    <span className="text-sm font-medium text-gray-700 flex-1 text-left truncate">{layer.folder_name}</span>
                    <div className="ml-auto w-3 h-3 rounded-full shrink-0" style={{ background: layer.color }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Map ── */}
      <div ref={mapRef} className="flex-1 mt-[56px]" />

      {/* ── Project detail panel ── */}
      {selectedProject && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[1000] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ background: STATUS_COLOR[selectedProject.status] || "#422D83" }}>
                    {selectedProject.status}
                  </span>
                  <span className="text-xs text-gray-400">{selectedProject.type}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-base leading-tight">{selectedProject.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{selectedProject.location}
                </p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 mb-3">
              <div>
                <p className="text-xs text-gray-400">Price Range</p>
                <p className="font-bold text-[#422D83] text-sm">
                  {formatPrice(selectedProject.minPrice, selectedProject.currency)} – {formatPrice(selectedProject.maxPrice, selectedProject.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Developer</p>
                <p className="font-semibold text-gray-700 text-xs">{selectedProject.developer}</p>
              </div>
            </div>
            <Link href={`/properties/${selectedProject.slug}`}
              className="flex items-center justify-center gap-2 w-full bg-[#422D83] hover:bg-[#2d1a60] text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
              <ExternalLink className="w-4 h-4" />
              View Project Details
            </Link>
          </div>
        </div>
      )}

      {/* ── Map type switcher ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-1 bg-white/95 backdrop-blur rounded-xl shadow border border-gray-100 p-1">
        {Object.entries(TILE_PROVIDERS).map(([key, p]) => (
          <button key={key} onClick={() => setMapType(key)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapType === key ? "bg-[#422D83] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}>
            <span>{p.icon}</span>
            <span className="hidden sm:block">{p.label}</span>
          </button>
        ))}
      </div>

      {/* ── Stats bar ── */}
      {!selectedProject && (
        <div className="absolute bottom-4 left-4 z-[999]">
          <div className="bg-white/95 backdrop-blur rounded-xl shadow px-3 py-2 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">{city === "Bangalore" ? "🇮🇳" : "🇦🇪"} {city}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs flex items-center gap-1 text-[#422D83]">
                <Building2 className="w-3 h-3" />
                <strong>{PROJECTS.filter(p => p.city === city).length}</strong> Projects
              </span>
              {kmlLayers.length > 0 && (
                <span className="text-xs text-gray-400">
                  + <strong>{kmlLayers.length}</strong> KML layer{kmlLayers.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
