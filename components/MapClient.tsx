"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { MapPin, X, ExternalLink, Building2, ChevronLeft, ChevronRight, ChevronDown, Layers, Search } from "lucide-react"
import { LogoCompact } from "@/components/Logo"

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

interface POIResult {
  id: number
  lat: number
  lng: number
  name: string
  category: string
  icon: string
}

interface Project {
  id: number
  slug: string
  name: string
  city: string
  location: string
  latitude: number
  longitude: number
  status: string
  minPrice: number
  maxPrice: number
  currency: string
  projectType: string
  developer: string
  coverImage?: string
}

// ─── Status colours (no hardcoded projects) ──────────────────────────────────

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

// ─── Tile providers (fixed URLs) ──────────────────────────────────────────────

const TILE_PROVIDERS: Record<string, { url: string; opts: any; label: string; icon: string }> = {
  street:    { label: "Street",    icon: "🗺️", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",                                             opts: { maxZoom: 19 } },
  street_en: { label: "Street EN", icon: "🗺️", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",                      opts: { maxZoom: 19, subdomains: "abcd" } },
  satellite: { label: "Satellite", icon: "🛰️", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", opts: { maxZoom: 19, attribution: "Tiles © Esri" } },
  terrain:   { label: "Terrain",   icon: "🏔️", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",                                           opts: { maxZoom: 17, subdomains: "abc" } },
  dark:      { label: "Dark",      icon: "🌙", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",                                  opts: { maxZoom: 19, subdomains: "abcd" } },
  light:     { label: "Light",     icon: "☀️", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",                                 opts: { maxZoom: 19, subdomains: "abcd" } },
}

// ─── Layer group config ───────────────────────────────────────────────────────

const LAYER_GROUPS: { id: string; label: string; icon: string; folderNames: string[] }[] = [
  {
    id: "metro",
    label: "Metro Lines",
    icon: "🚇",
    folderNames: [
      "Under Construction Metro Lines Namma Metro",
      "Proposed Lines",
      "Operational Metro",
      "Namma Metro",
    ],
  },
  {
    id: "roads",
    label: "Road Infrastructure",
    icon: "🛣️",
    folderNames: ["PRR", "Intermediate Ring Road", "Satellite Town Ring Road", "BLR Suburban Rail"],
  },
]

// ─── Search categories ────────────────────────────────────────────────────────

const SEARCH_CATEGORIES = [
  { id: "school",   label: "Schools",   icon: "🏫", tag: `["amenity"="school"]` },
  { id: "hospital", label: "Hospitals", icon: "🏥", tag: `["amenity"="hospital"]` },
  { id: "cafe",     label: "Cafes",     icon: "☕", tag: `["amenity"="cafe"]` },
  { id: "mall",     label: "Malls",     icon: "🛍️", tag: `["shop"="mall"]` },
  { id: "it_park",  label: "IT Parks",  icon: "💻", tag: `["office"~"it|technology",i]` },
  { id: "metro",    label: "Metro",     icon: "🚇", tag: `["station"="subway"]` },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGroupForLayer(folderName: string): string | null {
  for (const g of LAYER_GROUPS) {
    if (g.folderNames.includes(folderName)) return g.id
  }
  return null
}

/** "all" | "some" | "none" — used to render indeterminate checkbox */
function groupCheckState(groupId: string, layers: DbLayer[]): "all" | "some" | "none" {
  const group = LAYER_GROUPS.find(g => g.id === groupId)
  if (!group) return "none"
  const matching = layers.filter(l => group.folderNames.includes(l.folder_name))
  if (matching.length === 0) return "none"
  const visible = matching.filter(l => l.visible).length
  if (visible === 0) return "none"
  if (visible === matching.length) return "all"
  return "some"
}

/** Haversine distance in km */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Checkbox with indeterminate support ──────────────────────────────────────

function Checkbox({ checked, indeterminate, color, onChange }: {
  checked: boolean
  indeterminate?: boolean
  color: string
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange() }}
      className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all"
      style={{ borderColor: color, background: (checked || indeterminate) ? color : "white" }}
    >
      {indeterminate
        ? <span className="text-white text-[10px] leading-none font-bold">─</span>
        : checked
          ? <span className="text-white text-[10px] leading-none">✓</span>
          : null}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapClient() {
  const mapRef                = useRef<HTMLDivElement>(null)
  const mapInstanceRef        = useRef<any>(null)
  const projectsLGRef         = useRef<any>(null)
  const kmlLayerGroupsRef     = useRef<Record<string, any>>({})
  const kmlDataFingerprintRef = useRef<Record<string, string>>({})
  const tileLayerRef          = useRef<any>(null)
  const searchLayerGroupRef   = useRef<any>(null)

  const [city, setCity]               = useState<"Bangalore" | "Dubai">("Bangalore")
  const [projects, setProjects]       = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjects, setShowProjects] = useState(true)
  const [mapReady, setMapReady]       = useState(false)
  const [mapType, setMapType]         = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("ps_mapType") || "street"
    return "street"
  })
  const [kmlLayers, setKmlLayers]     = useState<DbLayer[]>([])

  // Search state
  const [searchResults, setSearchResults] = useState<POIResult[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchLoading, setSearchLoading]   = useState(false)

  // Sidebar open/close — open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // Which groups are expanded (show individual layer checkboxes)
  const [groupsExpanded, setGroupsExpanded] = useState<Record<string, boolean>>({
    metro: true,
    roads: true,
  })

  const CITY_VIEW = {
    Bangalore: { lat: 13.0475, lng: 77.5950, zoom: 11 },
    Dubai:     { lat: 25.1324, lng: 55.2708, zoom: 11 },
  }

  // On mobile, default to closed sidebar
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // ── Invalidate Leaflet size when sidebar opens/closes ───────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const t = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 320)
    return () => clearTimeout(t)
  }, [sidebarOpen])

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
      const map = L.map(mapRef.current, {
        center: [view.lat, view.lng],
        zoom: view.zoom,
        zoomControl: false,
        preferCanvas: true,
      })
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
      searchLayerGroupRef.current = L.layerGroup().addTo(map)
      setMapReady(true)
    }
    document.head.appendChild(script)

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch projects from DB when city changes ─────────────────────────────────
  useEffect(() => {
    fetch(`/api/properties?city=${city}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProjects(data.projects.filter((p: any) => p.latitude && p.longitude))
        }
      })
      .catch(() => {})
  }, [city])

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
    setMapType(city === "Dubai" ? "street_en" : "street")
    setSearchResults([])
    setActiveCategory(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // ── Auto-detect city from map position ───────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const map = mapInstanceRef.current
    const onMoveEnd = () => {
      const { lat, lng } = map.getCenter()
      for (const [cityName, bounds] of Object.entries(CITY_BOUNDS)) {
        if (lat >= bounds.latMin && lat <= bounds.latMax && lng >= bounds.lngMin && lng <= bounds.lngMax) {
          setCity(prev => prev !== cityName ? cityName as "Bangalore" | "Dubai" : prev)
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
    projects.forEach(project => {
      const color = STATUS_COLOR[project.status] || "#422D83"
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${color};color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;cursor:pointer;"><span style="transform:rotate(45deg);font-size:14px;">🏢</span></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32],
      })
      L.marker([project.latitude, project.longitude], { icon })
        .addTo(projectsLGRef.current)
        .on("click", () => setSelectedProject(project))
        .bindTooltip(`<b>${project.name}</b><br/>${project.location}`, { direction: "top", offset: [0, -34], className: "ps-tooltip" })
    })
  }, [mapReady, showProjects, projects])

  // ── Swap tile layer when mapType changes ─────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current
    const provider = TILE_PROVIDERS[mapType] || TILE_PROVIDERS.street
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
    const newTile = L.tileLayer(provider.url, { ...provider.opts, attribution: provider.opts.attribution || "" })
    newTile.addTo(map)
    tileLayerRef.current = newTile
  }, [mapReady, mapType])

  // ── Save mapType to localStorage ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("ps_mapType", mapType)
  }, [mapType])

  // ── Load KML layers ──────────────────────────────────────────────────────────
  const fetchLayers = useCallback((cityName: string) => {
    fetch(`/api/map/layers?city=${cityName}&t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Restore saved visibility; default hidden if nothing saved
          let savedVisible: string[] = []
          try { savedVisible = JSON.parse(localStorage.getItem(`ps_layers_${cityName}`) || "[]") } catch {}
          setKmlLayers(data.map((l: DbLayer) => ({
            ...l,
            visible: savedVisible.length > 0 ? savedVisible.includes(String(l.id)) : false,
          })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setKmlLayers([])
    fetchLayers(city)
    const onVisible = () => { if (document.visibilityState === "visible") fetchLayers(city) }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [fetchLayers, city])

  // ── Save layer visibility to localStorage ────────────────────────────────────
  useEffect(() => {
    if (kmlLayers.length === 0) return
    const visibleIds = kmlLayers.filter(l => l.visible).map(l => String(l.id))
    try { localStorage.setItem(`ps_layers_${city}`, JSON.stringify(visibleIds)) } catch {}
  }, [kmlLayers, city])

  // ── Build a Leaflet layerGroup (called once per layer) ────────────────────────
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
      const labelInterval = totalFeatures <= 5 ? 1 : totalFeatures <= 20 ? 3 : 50
      const FOLDER_SHORT: Record<string, string> = {
        "PRR": "PRR", "BLR Suburban Rail": "Suburban Rail",
        "Intermediate Ring Road": "IRR", "Satellite Town Ring Road": "STRR",
        "Under Construction Metro Lines Namma Metro": "Metro UC", "Proposed Lines": "Proposed",
      }
      const shortFolder = FOLDER_SHORT[layer.folder_name] || layer.folder_name
      const isPRR = layer.folder_name === "PRR"

      features.forEach((feature: any, i: number) => {
        const color = featureColorMap.get(i) || layer.color
        if (featureVisibleMap.get(i) === false) return
        const featureName = feature.properties?.name || feature.properties?.Name || ""
        const labelText = isPRR ? "PRR"
          : (featureName && featureName !== layer.folder_name && !featureName.startsWith("Feature ")
              ? `${shortFolder} • ${featureName}` : shortFolder)

        const singleGeoJson = { type: "FeatureCollection", features: [feature] }
        const geoLayer = L.geoJSON(singleGeoJson, {
          style: () => ({ color, weight: 3, opacity: 0.85, fillColor: color, fillOpacity: 0.15 }),
          pointToLayer: (_: any, latlng: any) => {
            const icon = L.divIcon({ className: "", html: `<div style="background:${color};width:10px;height:10px;border-radius:50%;border:2px solid white;"></div>`, iconSize: [10, 10], iconAnchor: [5, 5] })
            return L.marker(latlng, { icon })
          },
          onEachFeature: (f: any, lyr: any) => {
            lyr.bindTooltip(`📍 ${f.properties?.name || f.properties?.Name || layer.folder_name}`, { sticky: true, className: "ps-tooltip" })
          },
        })
        geoLayer.addTo(lg)

        if (i % labelInterval === 0) {
          try {
            const geom = feature.geometry
            let midLat: number | null = null, midLng: number | null = null
            if (geom?.type === "LineString" && geom.coordinates?.length) {
              const mid = Math.floor(geom.coordinates.length / 2)
              ;[midLng, midLat] = geom.coordinates[mid]
            } else if (geom?.type === "MultiLineString" && geom.coordinates?.length) {
              const line = geom.coordinates[0]; const mid = Math.floor(line.length / 2)
              ;[midLng, midLat] = line[mid]
            } else if (geom?.type === "Polygon" && geom.coordinates?.length) {
              const ring = geom.coordinates[0]; const mid = Math.floor(ring.length / 2)
              ;[midLng, midLat] = ring[mid]
            }
            if (midLat !== null && midLng !== null) {
              const labelIcon = L.divIcon({
                className: "",
                html: `<div style="background:rgba(255,255,255,0.85);color:${color};font-size:11px;font-weight:700;font-family:system-ui,sans-serif;padding:2px 5px;border-radius:3px;border:1.5px solid ${color};white-space:nowrap;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${labelText}</div>`,
                iconSize: undefined as any, iconAnchor: [0, 10],
              })
              L.marker([midLat, midLng], { icon: labelIcon, interactive: false, zIndexOffset: -100 }).addTo(lg)
            }
          } catch {}
        }
      })
    } catch (e) { console.warn("KML build error", layer.folder_name, e) }
    return lg
  }, [])

  // ── Render KML layers — build once, toggle visibility only ───────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current

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
      const fingerprint = `${layer.geojson?.features?.length}|${layer.color}|${layer.feature_styles?.length ?? 0}`
      if (!kmlLayerGroupsRef.current[id] || kmlDataFingerprintRef.current[id] !== fingerprint) {
        if (kmlLayerGroupsRef.current[id] && map.hasLayer(kmlLayerGroupsRef.current[id])) map.removeLayer(kmlLayerGroupsRef.current[id])
        kmlLayerGroupsRef.current[id] = buildLayerGroup(layer, L)
        kmlDataFingerprintRef.current[id] = fingerprint
      }
      const lg = kmlLayerGroupsRef.current[id]
      if (layer.visible && !map.hasLayer(lg)) lg.addTo(map)
      else if (!layer.visible && map.hasLayer(lg)) map.removeLayer(lg)
    })
  }, [mapReady, kmlLayers, buildLayerGroup])

  // ── Render search result pins ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !searchLayerGroupRef.current) return
    const L = (window as any).L
    const lg = searchLayerGroupRef.current
    lg.clearLayers()
    if (searchResults.length === 0) return
    searchResults.forEach(poi => {
      let nearestName = "", nearestDist = Infinity
      projects.forEach(p => {
        const d = haversineKm(poi.lat, poi.lng, p.latitude, p.longitude)
        if (d < nearestDist) { nearestDist = d; nearestName = p.name }
      })
      const distText = nearestName
        ? nearestDist < 1 ? `${Math.round(nearestDist * 1000)}m from ${nearestName}` : `${nearestDist.toFixed(1)}km from ${nearestName}`
        : ""
      const icon = L.divIcon({
        className: "",
        html: `<div style="font-size:22px;cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));line-height:1;">${poi.icon}</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      })
      L.marker([poi.lat, poi.lng], { icon })
        .addTo(lg)
        .bindPopup(`<div style="font-family:system-ui,sans-serif;"><div style="font-weight:700;font-size:13px;color:#1f2937;margin-bottom:2px;">${poi.icon} ${poi.name}</div>${distText ? `<div style="font-size:11px;color:#6b7280;">📍 ${distText}</div>` : ""}</div>`)
    })
  }, [mapReady, searchResults, projects])

  // ── Layer panel helpers ──────────────────────────────────────────────────────
  function selectAll() {
    setShowProjects(true)
    setKmlLayers(prev => prev.map(l => ({ ...l, visible: true })))
  }
  function clearAll() {
    setShowProjects(false)
    setKmlLayers(prev => prev.map(l => ({ ...l, visible: false })))
  }
  function toggleGroupLayers(groupId: string) {
    const group = LAYER_GROUPS.find(g => g.id === groupId)
    if (!group) return
    const state = groupCheckState(groupId, kmlLayers)
    const target = state !== "all"
    setKmlLayers(prev => prev.map(l =>
      group.folderNames.includes(l.folder_name) ? { ...l, visible: target } : l
    ))
  }
  function toggleGroupExpanded(groupId: string) {
    setGroupsExpanded(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  // ── Search helpers ───────────────────────────────────────────────────────────
  async function searchPOI(categoryId: string) {
    if (!mapInstanceRef.current) return
    if (activeCategory === categoryId) {
      setActiveCategory(null); setSearchResults([]); return
    }
    setActiveCategory(categoryId)
    setSearchLoading(true)
    try {
      const { lat, lng } = mapInstanceRef.current.getCenter()
      const cat = SEARCH_CATEGORIES.find(c => c.id === categoryId)!
      const query = `[out:json][timeout:10];node${cat.tag}(around:5000,${lat.toFixed(4)},${lng.toFixed(4)});out 30;`
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      const json = await res.json()
      setSearchResults((json.elements || []).slice(0, 30).map((el: any) => ({
        id: el.id, lat: el.lat, lng: el.lon,
        name: el.tags?.name || el.tags?.["name:en"] || cat.label,
        category: cat.label, icon: cat.icon,
      })))
    } catch { setSearchResults([]) }
    setSearchLoading(false)
  }
  function clearSearch() { setActiveCategory(null); setSearchResults([]) }

  // ── Layers that don't belong to any group ────────────────────────────────────
  const ungroupedLayers = kmlLayers.filter(l => !getGroupForLayer(l.folder_name))

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-gray-900">
      <style>{`
        .ps-tooltip { background:white!important;border:none!important;border-radius:8px!important;box-shadow:0 4px 12px rgba(0,0,0,0.15)!important;padding:6px 10px!important;font-size:12px!important;font-weight:500!important;color:#1f2937!important; }
        .ps-tooltip::before { display:none!important; }
        .leaflet-container { font-family:inherit; }
        .leaflet-control-attribution { display:none!important; }
        .leaflet-popup-content-wrapper { padding:0!important;border-radius:10px!important;overflow:hidden!important;box-shadow:0 4px 16px rgba(0,0,0,0.18)!important;border:none!important; }
        .leaflet-popup-content { margin:0!important;padding:8px 12px!important; }
        .leaflet-popup-tip-container { display:none!important; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#422D83] transition">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:block">Back</span>
        </Link>
        <LogoCompact />
        {/* City switcher */}
        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["Bangalore", "Dubai"] as const).map(c => (
            <button key={c} onClick={() => setCity(c)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${city === c ? "bg-[#422D83] text-white shadow" : "text-gray-600 hover:text-gray-800"}`}>
              {c === "Bangalore" ? "🇮🇳 Bangalore" : "🇦🇪 Dubai"}
            </button>
          ))}
        </div>
        {/* Mobile sidebar toggle */}
        <button onClick={() => setSidebarOpen(v => !v)}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-[#422D83] transition">
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* ── Body: sidebar + map ── */}
      <div className="flex flex-1 overflow-hidden mt-[56px] relative">

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div className="md:hidden absolute inset-0 bg-black/40 z-[800]" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Left sidebar panel ── */}
        <div className={`
          absolute md:relative z-[900]
          h-full bg-white border-r border-gray-200 flex-shrink-0
          overflow-hidden transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-72 shadow-2xl md:shadow-none" : "w-0"}
        `}>
          <div className="w-72 h-full flex flex-col overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#422D83]" />
                <span className="font-bold text-sm text-gray-800">Map Layers</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select All / Clear All */}
            <div className="flex gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <button onClick={selectAll}
                className="flex-1 py-2 bg-[#422D83] hover:bg-[#2d1a60] text-white text-xs font-semibold rounded-xl transition">
                Select All
              </button>
              <button onClick={clearAll}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition">
                Clear All
              </button>
            </div>

            {/* Scrollable layer list */}
            <div className="flex-1 overflow-y-auto px-3 py-2">

              {/* ── Our Projects ── */}
              <div className="mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Projects</p>
                <button onClick={() => setShowProjects(v => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Checkbox checked={showProjects} color="#422D83" onChange={() => setShowProjects(v => !v)} />
                  <span className="text-sm font-medium text-gray-700 flex-1 text-left">Our Projects</span>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: "#422D83" }} />
                </button>
                {/* Status legend */}
                <div className="px-10 pb-1">
                  {Object.entries(STATUS_COLOR).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2 py-0.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[11px] text-gray-400">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Layer groups ── */}
              {LAYER_GROUPS.map(group => {
                const groupLayers = kmlLayers.filter(l => group.folderNames.includes(l.folder_name))
                if (groupLayers.length === 0) return null
                const state = groupCheckState(group.id, kmlLayers)
                const expanded = groupsExpanded[group.id] ?? true

                return (
                  <div key={group.id} className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
                    {/* Group header row */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Checkbox
                        checked={state === "all"}
                        indeterminate={state === "some"}
                        color="#422D83"
                        onChange={() => toggleGroupLayers(group.id)}
                      />
                      <span className="text-sm font-semibold text-gray-700 flex-1">{group.icon} {group.label}</span>
                      <button onClick={() => toggleGroupExpanded(group.id)}
                        className="p-0.5 text-gray-400 hover:text-gray-600 transition">
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "" : "-rotate-90"}`} />
                      </button>
                    </div>
                    {/* Individual layers */}
                    {expanded && (
                      <div className="divide-y divide-gray-50">
                        {groupLayers.map(layer => (
                          <button key={layer.id}
                            onClick={() => setKmlLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l))}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                            <Checkbox checked={layer.visible} color={layer.color} onChange={() => setKmlLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l))} />
                            <span className="text-xs font-medium text-gray-600 flex-1 text-left truncate">{layer.folder_name}</span>
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: layer.color }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* ── Ungrouped layers (if any) ── */}
              {ungroupedLayers.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Other Layers</p>
                  {ungroupedLayers.map(layer => (
                    <button key={layer.id}
                      onClick={() => setKmlLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l))}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <Checkbox checked={layer.visible} color={layer.color} onChange={() => setKmlLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l))} />
                      <span className="text-sm font-medium text-gray-700 flex-1 text-left truncate">{layer.folder_name}</span>
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: layer.color }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Map Style section ── */}
            <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Map Style</p>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(TILE_PROVIDERS).map(([key, p]) => (
                  <button key={key} onClick={() => setMapType(key)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-medium transition-all ${
                      mapType === key
                        ? "bg-[#422D83] text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}>
                    <span className="text-base leading-none">{p.icon}</span>
                    <span className="leading-none">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Sidebar toggle tab ── */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className={`
            hidden md:flex absolute top-1/2 -translate-y-1/2 z-[950]
            items-center justify-center
            w-6 h-14 bg-[#422D83] hover:bg-[#2d1a60]
            rounded-r-xl shadow-lg transition-all duration-300
            ${sidebarOpen ? "left-72" : "left-0"}
          `}
          title={sidebarOpen ? "Collapse panel" : "Expand panel"}
        >
          {sidebarOpen
            ? <ChevronLeft className="w-4 h-4 text-white" />
            : <ChevronRight className="w-4 h-4 text-white" />}
        </button>

        {/* ── Map ── */}
        <div className="flex-1 relative h-full">
          <div ref={mapRef} className="w-full h-full" />

          {/* ── Search bar + category chips ── */}
          <div className="absolute top-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] z-[600]">
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 px-3 py-2">
              {searchLoading
                ? <span className="w-4 h-4 border-2 border-[#422D83]/30 border-t-[#422D83] rounded-full animate-spin flex-shrink-0" />
                : <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <span className="flex-1 text-sm text-gray-400 truncate">
                {activeCategory
                  ? `${searchResults.length} ${SEARCH_CATEGORIES.find(c => c.id === activeCategory)?.label} nearby`
                  : "Search nearby places…"}
              </span>
              {activeCategory && (
                <button onClick={clearSearch} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {SEARCH_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => searchPOI(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm border flex-shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-[#422D83] text-white border-[#422D83]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#422D83] hover:text-[#422D83]"
                  }`}>
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {activeCategory === cat.id && searchResults.length > 0 && (
                    <span className="bg-white/30 rounded-full px-1 leading-none">{searchResults.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Project detail panel ── */}
          {selectedProject && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[500] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                        style={{ background: STATUS_COLOR[selectedProject.status] || "#422D83" }}>
                        {selectedProject.status}
                      </span>
                      <span className="text-xs text-gray-400">{selectedProject.projectType}</span>
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

          {/* ── Stats bar ── */}
          {!selectedProject && (
            <div className="absolute bottom-4 left-4 z-[499]">
              <div className="bg-white/95 backdrop-blur rounded-xl shadow px-3 py-2 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">{city === "Bangalore" ? "🇮🇳" : "🇦🇪"} {city}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs flex items-center gap-1 text-[#422D83]">
                    <Building2 className="w-3 h-3" />
                    <strong>{projects.length}</strong> Project{projects.length !== 1 ? "s" : ""}
                  </span>
                  {kmlLayers.length > 0 && (
                    <span className="text-xs text-gray-400">
                      + <strong>{kmlLayers.length}</strong> layer{kmlLayers.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {searchResults.length > 0 && (
                    <span className="text-xs text-gray-400">
                      · <strong>{searchResults.length}</strong> {SEARCH_CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
