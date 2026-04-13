"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { kml as kmlToGeoJson } from "@tmcw/togeojson"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbLayer {
  id: string
  file_name: string
  folder_name: string
  color: string
  geojson: any
  visible: boolean
  sort_order: number
}

// ─── Color palette ────────────────────────────────────────────────────────────

const PALETTE = [
  "#EF4444","#3B82F6","#10B981","#F59E0B","#8B5CF6",
  "#EC4899","#06B6D4","#F97316","#84CC16","#6366F1",
]
let colorIdx = 0
const nextColor = () => PALETTE[colorIdx++ % PALETTE.length]

const ADMIN_KEY = "PropSarathi@MapAdmin2026"

// ─── Parse KML → folders ──────────────────────────────────────────────────────

function parseKmlFolders(xmlText: string, fileName: string) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, "text/xml")
  const folders = Array.from(xmlDoc.querySelectorAll("Folder"))

  if (folders.length > 0) {
    return folders.map(folder => {
      const name = folder.querySelector(":scope > name")?.textContent?.trim() || "Unnamed Layer"
      const miniKml = document.implementation.createDocument("", "", null)
      const kmlEl   = miniKml.createElement("kml")
      const docEl   = miniKml.createElement("Document")
      // copy styles
      const srcDoc  = xmlDoc.querySelector("Document")
      srcDoc && Array.from(srcDoc.children).forEach(c => {
        if (c.tagName.startsWith("Style")) docEl.appendChild(c.cloneNode(true))
      })
      docEl.appendChild(folder.cloneNode(true))
      kmlEl.appendChild(docEl)
      miniKml.appendChild(kmlEl)
      return { name, color: nextColor(), geojson: kmlToGeoJson(miniKml) }
    })
  }

  // no folders → whole file as one layer
  return [{ name: fileName.replace(/\.kml$/i, ""), color: nextColor(), geojson: kmlToGeoJson(xmlDoc) }]
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  layers: DbLayer[]
  onChange: (layers: DbLayer[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KmlUploader({ layers, onChange }: Props) {
  const inputRef    = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded]   = useState<string | null>(null)

  // group layers by file_name
  const files = Array.from(new Set(layers.map(l => l.file_name))).map(fn => ({
    fileName: fn,
    folders: layers.filter(l => l.file_name === fn),
  }))

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    for (const file of Array.from(fileList)) {
      if (!file.name.toLowerCase().endsWith(".kml")) continue
      const text = await file.text()
      const folders = parseKmlFolders(text, file.name)
      const res = await fetch("/api/map/layers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ fileName: file.name, folders }),
      })
      if (res.ok) {
        // reload all layers
        const all = await fetch("/api/map/layers").then(r => r.json())
        onChange(all)
      }
    }
    setUploading(false)
  }, [onChange])

  const toggleVisible = async (layer: DbLayer) => {
    const newVal = !layer.visible
    await fetch(`/api/map/layers/${layer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ visible: newVal }),
    })
    onChange(layers.map(l => l.id === layer.id ? { ...l, visible: newVal } : l))
  }

  const changeColor = async (layer: DbLayer, color: string) => {
    await fetch(`/api/map/layers/${layer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ color }),
    })
    onChange(layers.map(l => l.id === layer.id ? { ...l, color } : l))
  }

  const deleteFile = async (fileName: string) => {
    await fetch("/api/map/layers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ fileName }),
    })
    onChange(layers.filter(l => l.file_name !== fileName))
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">KML Layers</p>

      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all mb-3 ${
          dragging ? "border-[#422D83] bg-purple-50" : "border-gray-200 hover:border-[#422D83] hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      >
        {uploading
          ? <Loader2 className="w-4 h-4 text-[#422D83] mx-auto animate-spin mb-1" />
          : <Upload className="w-4 h-4 text-gray-400 mx-auto mb-1" />
        }
        <p className="text-xs text-gray-500 font-medium">
          {uploading ? "Uploading…" : "Drop KML or click to upload"}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">Visible to all visitors</p>
        <input ref={inputRef} type="file" accept=".kml" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {files.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-1">No KML layers uploaded yet</p>
      )}

      {files.map(file => (
        <div key={file.fileName} className="mb-2 border border-gray-100 rounded-xl overflow-hidden">
          {/* File header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
            <button onClick={() => setExpanded(expanded === file.fileName ? null : file.fileName)}
              className="flex-1 flex items-center gap-2 text-left">
              {expanded === file.fileName
                ? <ChevronUp className="w-3 h-3 text-gray-400 shrink-0" />
                : <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />}
              <span className="text-xs font-semibold text-gray-700 truncate">{file.fileName}</span>
              <span className="text-[10px] text-gray-400 shrink-0">
                {file.folders.length} layer{file.folders.length !== 1 ? "s" : ""}
              </span>
            </button>
            <button onClick={() => deleteFile(file.fileName)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Folders */}
          {expanded === file.fileName && (
            <div className="divide-y divide-gray-50">
              {file.folders.map(layer => (
                <div key={layer.id} className="flex items-center gap-2 px-3 py-2">
                  <button onClick={() => toggleVisible(layer)} className="shrink-0">
                    {layer.visible
                      ? <Eye className="w-3.5 h-3.5 text-[#422D83]" />
                      : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
                  </button>
                  <span className="text-xs text-gray-700 flex-1 truncate">{layer.folder_name}</span>
                  <input type="color" value={layer.color}
                    onChange={e => changeColor(layer, e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 shrink-0"
                    title="Change color" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
