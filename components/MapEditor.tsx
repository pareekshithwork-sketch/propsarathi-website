"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Eye, EyeOff, Trash2, Upload, Loader2, Minus, MapPin as MapPinIcon, Square, ChevronDown, ChevronRight, MoreVertical, Save } from "lucide-react"
import { kml as kmlToGeoJson } from "@tmcw/togeojson"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureStyle {
  index: number
  name: string
  color: string
  visible: boolean
}

interface MapLayer {
  id: string
  file_name: string
  folder_name: string
  color: string
  geojson: any
  visible: boolean
  sort_order: number
  feature_styles?: FeatureStyle[]
}

const ADMIN_KEY = "PropSarathi@MapAdmin2026"

const FOLDER_COLORS: Record<string, string> = {
  "PRR": "#EF4444",
  "BLR Suburban Rail": "#6B7280",
  "Intermediate Ring Road": "#FB923C",
  "Satellite Town Ring Road": "#8B5CF6",
  "Under Construction Metro Lines Namma Metro": "#F59E0B",
  "Proposed Lines": "#94A3B8",
  // Namma Metro operational lines
  "Purple Line": "#7C3AED",
  "Green Line": "#009933",
  "Yellow Line": "#D97706",
  "Blue Line": "#2563EB",
  "Pink Line": "#EC4899",
  "Red Line": "#EF4444",
}

function colorForFolder(name: string) {
  return FOLDER_COLORS[name] || "#3B82F6"
}

let _colorIdx = 0
const PALETTE = ["#EF4444","#3B82F6","#10B981","#F59E0B","#8B5CF6","#EC4899","#06B6D4","#F97316","#84CC16","#6366F1"]
const nextColor = () => PALETTE[_colorIdx++ % PALETTE.length]

function parseKmlFolders(xmlText: string, fileName: string) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, "text/xml")
  const folders = Array.from(xmlDoc.querySelectorAll("Folder"))

  if (folders.length > 0) {
    return folders.map(folder => {
      const name = folder.querySelector(":scope > name")?.textContent?.trim() || "Unnamed Layer"
      const color = colorForFolder(name)
      const miniKml = document.implementation.createDocument("", "", null)
      const kmlEl = miniKml.createElement("kml")
      const docEl = miniKml.createElement("Document")
      const srcDoc = xmlDoc.querySelector("Document")
      if (srcDoc) {
        Array.from(srcDoc.children).forEach(c => {
          if (c.tagName.startsWith("Style")) docEl.appendChild(c.cloneNode(true))
        })
      }
      docEl.appendChild(folder.cloneNode(true))
      kmlEl.appendChild(docEl)
      miniKml.appendChild(kmlEl)
      const geojson = kmlToGeoJson(miniKml)
      const features = geojson?.features || []
      const featureStyles: FeatureStyle[] = features.map((f: any, idx: number) => ({
        index: idx,
        name: f.properties?.name || f.properties?.Name || `Feature ${idx + 1}`,
        color,
        visible: true,
      }))
      return { name, color, geojson, feature_styles: featureStyles }
    })
  }

  const geojson = kmlToGeoJson(xmlDoc)
  const color = nextColor()
  const features = geojson?.features || []
  const featureStyles: FeatureStyle[] = features.map((f: any, idx: number) => ({
    index: idx,
    name: f.properties?.name || f.properties?.Name || `Feature ${idx + 1}`,
    color,
    visible: true,
  }))
  return [{ name: fileName.replace(/\.kml$/i, ""), color, geojson, feature_styles: featureStyles }]
}

// ─── Render helper (shared logic for MapEditor & public map) ──────────────────

function renderLayerOnMap(L: any, layer: MapLayer) {
  const lg = L.layerGroup()
  if (!layer.visible) return lg
  try {
    let fIdx = 0
    L.geoJSON(layer.geojson, {
      style: () => {
        const fs = layer.feature_styles?.[fIdx]
        const color = fs?.color || layer.color
        const visible = fs?.visible !== false
        return { color, weight: 3, opacity: visible ? 0.85 : 0, fillColor: color, fillOpacity: visible ? 0.15 : 0 }
      },
      pointToLayer: (_: any, latlng: any) => {
        const fs = layer.feature_styles?.[fIdx]
        const color = fs?.color || layer.color
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${color};width:10px;height:10px;border-radius:50%;border:2px solid white;"></div>`,
          iconSize: [10, 10], iconAnchor: [5, 5],
        })
        return L.marker(latlng, { icon })
      },
      onEachFeature: (feature: any, featureLayer: any) => {
        const fs = layer.feature_styles?.[fIdx]
        const color = fs?.color || layer.color
        if (featureLayer.setStyle) featureLayer.setStyle({ color, weight: 3, opacity: 0.85, fillColor: color, fillOpacity: 0.15 })
        const name = feature.properties?.name || feature.properties?.Name || "Feature"
        featureLayer.bindTooltip(`📍 ${name}`, { sticky: true, className: "ps-tooltip" })
        fIdx++
      },
    }).addTo(lg)
  } catch (e) {
    console.warn("Layer render error:", layer.folder_name, e)
  }
  return lg
}

type DrawTool = "line" | "polygon" | "pin" | null

export default function MapEditor() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const layerGroupsRef = useRef<Record<string, any>>({})
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)

  const [layers, setLayers] = useState<MapLayer[]>([])
  // pendingChanges: layerId → partial update to save
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<MapLayer>>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [activeTool, setActiveTool] = useState<DrawTool>(null)
  const [savingDraw, setSavingDraw] = useState(false)
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({})
  const [showAllFeatures, setShowAllFeatures] = useState<Record<string, boolean>>({})
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [renamingFeature, setRenamingFeature] = useState<{layerId: string; idx: number} | null>(null)
  const [renameFeatureValue, setRenameFeatureValue] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasPendingChanges = Object.keys(pendingChanges).length > 0

  // ── Load layers from DB ────────────────────────────────────────────────────
  const loadLayers = useCallback(async () => {
    try {
      const res = await fetch("/api/map/layers", { cache: "no-store" })
      const data = await res.json()
      if (Array.isArray(data)) setLayers(data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { loadLayers() }, [loadLayers])

  // ── Init Leaflet map ───────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    const drawLink = document.createElement("link")
    drawLink.rel = "stylesheet"
    drawLink.href = "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css"
    document.head.appendChild(drawLink)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => {
      const drawScript = document.createElement("script")
      drawScript.src = "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
      drawScript.onload = () => {
        const L = (window as any).L
        if (!mapRef.current || mapInstanceRef.current) return

        const map = L.map(mapRef.current, { center: [13.0475, 77.5950], zoom: 11, zoomControl: false })
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { attribution: "", maxZoom: 19, subdomains: "abcd" }).addTo(map)
        L.control.zoom({ position: "bottomright" }).addTo(map)

        const drawnItems = new L.FeatureGroup()
        drawnItems.addTo(map)
        drawnItemsRef.current = drawnItems

        map.on(L.Draw.Event.CREATED, async (e: any) => {
          const layer = e.layer
          drawnItems.addLayer(layer)
          const geojson = layer.toGeoJSON?.()
          if (!geojson) return
          setSavingDraw(true)
          try {
            await fetch("/api/map/layers", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
              body: JSON.stringify({
                fileName: "drawn",
                folders: [{ name: "Drawn Features", color: "#3B82F6", geojson: { type: "FeatureCollection", features: [geojson] }, feature_styles: [] }],
              }),
            })
            await loadLayers()
          } catch {}
          setSavingDraw(false)
          setActiveTool(null)
        })

        mapInstanceRef.current = map
        setMapReady(true)
      }
      document.head.appendChild(drawScript)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [loadLayers])

  // ── Render layers on map ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current

    Object.values(layerGroupsRef.current).forEach((lg: any) => { if (map.hasLayer(lg)) map.removeLayer(lg) })
    layerGroupsRef.current = {}

    layers.forEach(layer => {
      const lg = renderLayerOnMap(L, layer)
      layerGroupsRef.current[layer.id] = lg
      lg.addTo(map)
    })
  }, [mapReady, layers])

  // ── Drawing tool activation ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const L = (window as any).L
    const map = mapInstanceRef.current

    if (drawControlRef.current) {
      try { map.removeControl(drawControlRef.current) } catch {}
      drawControlRef.current = null
    }
    if (!activeTool) return

    const drawControl = new (L.Control as any).Draw({
      draw: {
        polyline: activeTool === "line" ? { shapeOptions: { color: "#3B82F6", weight: 3 } } : false,
        polygon: activeTool === "polygon" ? { shapeOptions: { color: "#3B82F6", weight: 3, fillOpacity: 0.2 } } : false,
        marker: activeTool === "pin",
        rectangle: false, circle: false, circlemarker: false,
      },
      edit: { featureGroup: drawnItemsRef.current },
    })
    map.addControl(drawControl)
    drawControlRef.current = drawControl

    if (activeTool === "line") new L.Draw.Polyline(map, { shapeOptions: { color: "#3B82F6" } }).enable()
    else if (activeTool === "polygon") new L.Draw.Polygon(map, { shapeOptions: { color: "#3B82F6", fillOpacity: 0.2 } }).enable()
    else if (activeTool === "pin") new L.Draw.Marker(map).enable()
  }, [mapReady, activeTool])

  // ── Upload KML ────────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith(".kml")) continue
      const text = await file.text()
      const folders = parseKmlFolders(text, file.name)
      await fetch("/api/map/layers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ fileName: file.name, folders }),
      })
    }
    await loadLayers()
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [loadLayers])

  // ── Mark change as pending (local only until Save) ────────────────────────
  const markPending = (layerId: string, patch: Partial<MapLayer>) => {
    setPendingChanges(prev => ({ ...prev, [layerId]: { ...(prev[layerId] || {}), ...patch } }))
  }

  // ── Toggle visibility — immediate (no save needed for show/hide) ──────────
  const toggleVisible = async (layer: MapLayer) => {
    const newVal = !layer.visible
    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: newVal } : l))
    await fetch(`/api/map/layers/${layer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ visible: newVal }),
    })
  }

  // ── Change individual feature color (local, pending save) ─────────────────
  const changeFeatureColor = (layer: MapLayer, featureIndex: number, color: string) => {
    const updatedStyles = (layer.feature_styles || []).map(fs =>
      fs.index === featureIndex ? { ...fs, color } : fs
    )
    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, feature_styles: updatedStyles } : l))
    markPending(layer.id, { feature_styles: updatedStyles })
  }

  // ── Rename sub-feature (local, pending save) ───────────────────────────────
  const startRenameFeature = (layerId: string, idx: number, currentName: string) => {
    setRenamingFeature({ layerId, idx })
    setRenameFeatureValue(currentName)
  }

  const commitRenameFeature = (layer: MapLayer) => {
    if (!renamingFeature || !renameFeatureValue.trim()) { setRenamingFeature(null); return }
    const updatedStyles = (layer.feature_styles || []).map(fs =>
      fs.index === renamingFeature.idx ? { ...fs, name: renameFeatureValue.trim() } : fs
    )
    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, feature_styles: updatedStyles } : l))
    markPending(layer.id, { feature_styles: updatedStyles })
    setRenamingFeature(null)
  }

  // ── Save all pending changes to DB ────────────────────────────────────────
  const saveAllChanges = async () => {
    if (!hasPendingChanges) return
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(pendingChanges).map(([id, patch]) =>
          fetch(`/api/map/layers/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
            body: JSON.stringify(patch),
          })
        )
      )
      setPendingChanges({})
    } catch (e) {
      console.error("Save failed", e)
    }
    setSaving(false)
  }

  // ── Delete layer ──────────────────────────────────────────────────────────
  const deleteLayer = async (layer: MapLayer) => {
    if (!confirm(`Delete layer "${layer.folder_name}"?`)) return
    setLayers(prev => prev.filter(l => l.id !== layer.id))
    await fetch(`/api/map/layers/${layer.id}`, { method: "DELETE", headers: { "x-admin-key": ADMIN_KEY } })
  }

  const deleteFileGroup = async (fileName: string) => {
    if (!confirm(`Delete all layers from "${fileName}"?`)) return
    setLayers(prev => prev.filter(l => l.file_name !== fileName))
    await fetch("/api/map/layers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ fileName }),
    })
  }

  // ── Rename folder ─────────────────────────────────────────────────────────
  const startRename = (layer: MapLayer) => { setRenamingId(layer.id); setRenameValue(layer.folder_name); setOpenMenu(null) }
  const commitRename = async (layer: MapLayer) => {
    if (!renameValue.trim()) return
    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, folder_name: renameValue.trim() } : l))
    await fetch(`/api/map/layers/${layer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ folder_name: renameValue.trim() }),
    })
    setRenamingId(null)
  }

  const fileGroups = Array.from(new Set(layers.map(l => l.file_name))).map(fn => ({
    fileName: fn,
    layers: layers.filter(l => l.file_name === fn),
  }))

  const toggleTool = (tool: DrawTool) => setActiveTool(prev => prev === tool ? null : tool)
  const toggleExpanded = (id: string) => setExpandedLayers(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="flex h-full overflow-hidden bg-white" onClick={() => setOpenMenu(null)}>
      <style>{`
        .ps-tooltip { background: white !important; border: none !important; border-radius: 8px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; padding: 5px 10px !important; font-size: 12px !important; font-weight: 500 !important; color: #1f2937 !important; }
        .ps-tooltip::before { display: none !important; }
        .leaflet-container { font-family: inherit; }
        .leaflet-control-attribution { display: none !important; }
        .feature-row:hover { background: #f9fafb; }
      `}</style>

      {/* ── Left Panel ── */}
      <div className="w-[300px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-[#1a1f2e]">
          <h2 className="text-white font-semibold text-sm">Map Layers</h2>
          <p className="text-white/50 text-xs mt-0.5">Manage KML overlays & drawing</p>
        </div>

        {/* Upload + Save row */}
        <div className="px-4 py-3 border-b border-gray-100 flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading…" : "Upload KML"}
          </button>

          {/* Save button — only shown when there are pending changes */}
          <button
            onClick={saveAllChanges}
            disabled={!hasPendingChanges || saving}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              hasPendingChanges
                ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
            title={hasPendingChanges ? "Save changes to DB — reflects on public map" : "No unsaved changes"}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save"}
          </button>

          <input ref={fileInputRef} type="file" accept=".kml" multiple className="hidden"
            onChange={e => handleFileUpload(e.target.files)} />
        </div>

        {hasPendingChanges && (
          <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100">
            <p className="text-xs text-amber-700">
              ● {Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length !== 1 ? "s" : ""} — hit Save to publish
            </p>
          </div>
        )}

        {/* Layer list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : fileGroups.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MapPinIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No layers yet. Upload a KML to start.</p>
            </div>
          ) : (
            <div className="py-2">
              {fileGroups.map(group => (
                <div key={group.fileName} className="mb-1">
                  {/* File group header */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                    <span className="text-xs">📂</span>
                    <span className="text-xs font-semibold text-gray-600 flex-1 truncate">
                      {group.fileName === "drawn" ? "✏️ Drawn Features" : group.fileName}
                    </span>
                    <span className="text-xs text-gray-400">{group.layers.length}</span>
                    {group.fileName !== "drawn" && (
                      <button onClick={() => deleteFileGroup(group.fileName)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {group.layers.map(layer => {
                    const isExpanded = !!expandedLayers[layer.id]
                    const featureStyles = layer.feature_styles || []
                    const hasFeatures = featureStyles.length > 0
                    const showAll = !!showAllFeatures[layer.id]
                    const displayedFeatures = showAll ? featureStyles : featureStyles.slice(0, 20)
                    const isPending = !!pendingChanges[layer.id]

                    return (
                      <div key={layer.id}>
                        {/* Folder row */}
                        <div className={`flex items-center gap-1.5 px-4 py-2 hover:bg-gray-50 transition-colors ${isPending ? "bg-amber-50/50" : ""}`}>
                          <button onClick={() => toggleExpanded(layer.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>

                          {/* Color dot (only shown if no sub-features) */}
                          {!hasFeatures && (
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                          )}

                          {/* Folder name */}
                          {renamingId === layer.id ? (
                            <input autoFocus
                              className="text-xs border border-blue-300 rounded px-1 flex-1 min-w-0"
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onBlur={() => commitRename(layer)}
                              onKeyDown={e => { if (e.key === "Enter") commitRename(layer); if (e.key === "Escape") setRenamingId(null) }}
                            />
                          ) : (
                            <span className="text-xs text-gray-700 flex-1 truncate cursor-pointer" title={layer.folder_name}
                              onClick={() => toggleExpanded(layer.id)}>
                              {layer.folder_name}
                              {isPending && <span className="ml-1 text-amber-500">●</span>}
                            </span>
                          )}

                          {/* Eye toggle */}
                          <button onClick={() => toggleVisible(layer)}
                            className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0">
                            {layer.visible ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Folder color picker — ONLY if no sub-features */}
                          {!hasFeatures && (
                            <input type="color" value={layer.color}
                              onChange={e => {
                                setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, color: e.target.value } : l))
                                markPending(layer.id, { color: e.target.value })
                              }}
                              className="w-5 h-5 rounded cursor-pointer border border-gray-200 flex-shrink-0"
                              title="Change color" />
                          )}

                          {/* ⋮ menu */}
                          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setOpenMenu(openMenu === layer.id ? null : layer.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {openMenu === layer.id && (
                              <div className="absolute right-0 top-5 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32">
                                <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                  onClick={() => startRename(layer)}>✏️ Rename</button>
                                <button className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                                  onClick={() => { setOpenMenu(null); deleteLayer(layer) }}>🗑️ Delete</button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded: individual feature styles */}
                        {isExpanded && hasFeatures && (
                          <div className="pl-8 pb-1">
                            <div className="flex items-center gap-1 px-2 py-1">
                              <span className="text-xs text-gray-400">🎨 Individual styles</span>
                            </div>
                            {displayedFeatures.map(fs => (
                              <div key={fs.index} className="feature-row flex items-center gap-2 px-2 py-1 rounded">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white shadow-sm"
                                  style={{ background: fs.color }} />
                                {/* Feature name — click to rename */}
                                {renamingFeature?.layerId === layer.id && renamingFeature?.idx === fs.index ? (
                                  <input autoFocus
                                    className="text-xs border border-blue-300 rounded px-1 flex-1 min-w-0"
                                    value={renameFeatureValue}
                                    onChange={e => setRenameFeatureValue(e.target.value)}
                                    onBlur={() => commitRenameFeature(layer)}
                                    onKeyDown={e => { if (e.key === "Enter") commitRenameFeature(layer); if (e.key === "Escape") setRenamingFeature(null) }}
                                  />
                                ) : (
                                  <span className="text-xs text-gray-600 flex-1 truncate cursor-pointer hover:text-blue-600"
                                    title={`Click to rename: ${fs.name}`}
                                    onClick={() => startRenameFeature(layer.id, fs.index, fs.name)}>
                                    {fs.name.length > 22 ? fs.name.slice(0, 22) + "…" : fs.name}
                                  </span>
                                )}
                                <input type="color" value={fs.color}
                                  onChange={e => changeFeatureColor(layer, fs.index, e.target.value)}
                                  className="w-4 h-4 rounded cursor-pointer border border-gray-200 flex-shrink-0"
                                  title="Change feature color" />
                              </div>
                            ))}
                            {featureStyles.length > 20 && !showAll && (
                              <button className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1"
                                onClick={() => setShowAllFeatures(prev => ({ ...prev, [layer.id]: true }))}>
                                Show all {featureStyles.length} features
                              </button>
                            )}
                            {showAll && featureStyles.length > 20 && (
                              <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                                onClick={() => setShowAllFeatures(prev => ({ ...prev, [layer.id]: false }))}>
                                Show less
                              </button>
                            )}
                          </div>
                        )}
                        {isExpanded && !hasFeatures && (
                          <div className="pl-8 pb-2 px-4">
                            <span className="text-xs text-gray-400 italic">No individual features</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawing tools */}
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Drawing Tools</p>
          <div className="flex flex-col gap-1.5">
            {([
              { tool: "line" as DrawTool, label: "Draw Line", Icon: Minus },
              { tool: "polygon" as DrawTool, label: "Draw Polygon", Icon: Square },
              { tool: "pin" as DrawTool, label: "Drop Pin", Icon: MapPinIcon },
            ]).map(({ tool, label, Icon }) => (
              <button key={tool} onClick={() => toggleTool(tool)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTool === tool ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                <Icon className="w-4 h-4" />
                {label}
                {activeTool === tool && <span className="ml-auto text-xs opacity-75">Active</span>}
              </button>
            ))}
          </div>
          {activeTool && (
            <p className="text-xs text-blue-600 mt-2 text-center">
              Click on the map to draw. Double-click to finish.
            </p>
          )}
          {savingDraw && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving drawn feature…
            </div>
          )}
        </div>
      </div>

      {/* ── Map ── */}
      <div ref={mapRef} className="flex-1" style={{ minHeight: "100%" }} />
    </div>
  )
}
