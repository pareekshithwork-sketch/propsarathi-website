'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { X, Upload, ChevronRight, Check, Loader2, Download, AlertCircle, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportType = 'leads' | 'data'
type Step = 1 | 2 | 3

const LEAD_FIELDS = [
  { id: 'name',       label: 'Name',        required: true },
  { id: 'phone',      label: 'Phone',       required: true },
  { id: 'email',      label: 'Email',       required: false },
  { id: 'source',     label: 'Source',      required: false },
  { id: 'assignedRm', label: 'Assigned RM', required: false },
  { id: 'tags',       label: 'Tags',        required: false },
  { id: 'notes',      label: 'Notes',       required: false },
]

const DATA_FIELDS = [
  { id: 'phone',  label: 'Phone',  required: true },
  { id: 'name',   label: 'Name',   required: false },
  { id: 'source', label: 'Source', required: false },
  { id: 'status', label: 'Status', required: false },
  { id: 'notes',  label: 'Notes',  required: false },
]

const LEAD_TEMPLATE = ['Name', 'Phone', 'Email', 'Source', 'Assigned RM', 'Tags', 'Notes']
const DATA_TEMPLATE = ['Name', 'Phone', 'Source', 'Status', 'Notes']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function downloadTemplate(importType: ImportType) {
  const headers = importType === 'leads' ? LEAD_TEMPLATE : DATA_TEMPLATE
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, headers.map(() => '')])
  XLSX.utils.book_append_sheet(wb, ws, 'Import')
  XLSX.writeFile(wb, importType === 'leads' ? 'leads_template.xlsx' : 'data_template.xlsx')
}

function autoMatch(headers: string[], fields: typeof LEAD_FIELDS): Record<string, string> {
  const map: Record<string, string> = {}
  headers.forEach(h => {
    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '')
    const match = fields.find(f => {
      const fl = f.id.toLowerCase()
      const ll = f.label.toLowerCase().replace(/[^a-z0-9]/g, '')
      return lower === fl || lower === ll || lower.includes(fl) || lower.includes(ll)
    })
    if (match) map[h] = match.id
  })
  return map
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BulkImportModal({ importType, onClose, onDone }: {
  importType: ImportType
  onClose: () => void
  onDone: () => void
}) {
  const [step, setStep] = useState<Step>(1)
  const [fileHeaders, setFileHeaders] = useState<string[]>([])
  const [fileRows, setFileRows] = useState<any[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')

  const fields = importType === 'leads' ? LEAD_FIELDS : DATA_FIELDS
  const title = importType === 'leads' ? 'Import Leads' : 'Import Data'

  function parseFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        if (rows.length < 2) return
        const headers = (rows[0] as string[]).map(h => String(h || '').trim()).filter(Boolean)
        const dataRows = rows.slice(1).filter((r: any[]) => r.some(c => c !== ''))
        setFileHeaders(headers)
        setFileRows(dataRows)
        setMapping(autoMatch(headers, fields))
        setFileName(file.name)
        setStep(2)
      } catch {}
    }
    reader.readAsArrayBuffer(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  // Build mapped rows for preview/import
  const mappedRows = useMemo(() => fileRows.map(row => {
    const obj: Record<string, string> = {}
    fileHeaders.forEach((h, i) => {
      const field = mapping[h]
      if (field) obj[field] = String(row[i] || '').trim()
    })
    return obj
  }), [fileRows, fileHeaders, mapping])

  // Validate rows
  const validatedRows = useMemo(() => mappedRows.map(row => {
    const missingRequired = fields.filter(f => f.required && !row[f.id])
    return { row, valid: missingRequired.length === 0, error: missingRequired.map(f => f.label).join(', ') }
  }), [mappedRows, fields])

  const readyCount = validatedRows.filter(r => r.valid).length
  const errorCount = validatedRows.filter(r => !r.valid).length

  async function handleImport() {
    const validRows = validatedRows.filter(r => r.valid).map(r => r.row)
    if (validRows.length === 0) return
    setImporting(true)
    try {
      const endpoint = importType === 'leads'
        ? '/api/crm/v2/leads/bulk-import'
        : '/api/crm/v2/data/bulk-import'
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: validRows }),
      })
      const data = await res.json()
      setImportResult({ imported: data.imported || 0, skipped: data.skipped || 0, errors: data.errors || 0 })
    } catch {
      setImportResult({ imported: 0, skipped: 0, errors: validRows.length })
    }
    setImporting(false)
  }

  const STEP_LABELS = ['Upload File', 'Map Fields', 'Review & Import']

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <div className="flex items-center gap-1 mt-1">
              {STEP_LABELS.map((label, i) => (
                <React.Fragment key={label}>
                  <span className={`text-xs font-medium ${step === i + 1 ? 'text-[#422D83]' : step > i + 1 ? 'text-green-600' : 'text-gray-400'}`}>
                    {step > i + 1 ? <Check className="w-3 h-3 inline mr-0.5" /> : null}{label}
                  </span>
                  {i < 2 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── STEP 1: Upload ── */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() => downloadTemplate(importType)}
                className="flex items-center gap-2 text-sm text-[#422D83] hover:underline"
              >
                <Download className="w-4 h-4" />
                Download template (.xlsx)
              </button>

              <label
                className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-[#422D83] bg-[#422D83]/5' : 'border-gray-300 hover:border-[#422D83]/50'}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">Drag & drop your file here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse — .xlsx, .xls, .csv</p>
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileInput} />
              </label>
            </div>
          )}

          {/* ── STEP 2: Map Fields ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                File: <span className="font-medium">{fileName}</span> — {fileRows.length} rows detected.
                Map your columns to PropSarathi fields below.
              </p>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Your Column</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Maps To</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Sample</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fileHeaders.map((h) => (
                      <tr key={h}>
                        <td className="px-4 py-2.5 text-sm text-gray-700 font-medium">{h}</td>
                        <td className="px-4 py-2.5">
                          <select
                            value={mapping[h] || ''}
                            onChange={e => setMapping(p => ({ ...p, [h]: e.target.value }))}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#422D83]/40 bg-white w-40"
                          >
                            <option value="">— Skip —</option>
                            {fields.map(f => (
                              <option key={f.id} value={f.id}>
                                {f.label}{f.required ? ' *' : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-400 truncate max-w-[140px]">
                          {String(fileRows[0]?.[fileHeaders.indexOf(h)] || '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview (first 3 rows)</p>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="text-xs w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {fields.filter(f => Object.values(mapping).includes(f.id)).map(f => (
                          <th key={f.id} className="px-3 py-2 text-left text-gray-500">{f.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mappedRows.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          {fields.filter(f => Object.values(mapping).includes(f.id)).map(f => (
                            <td key={f.id} className="px-3 py-2 text-gray-700 truncate max-w-[120px]">{row[f.id] || '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review & Import ── */}
          {step === 3 && !importResult && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{readyCount}</p>
                  <p className="text-xs text-green-600 mt-0.5">Ready to import</p>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-xs text-red-500 mt-0.5">Errors (will be skipped)</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500 w-8">#</th>
                      {fields.filter(f => Object.values(mapping).includes(f.id)).map(f => (
                        <th key={f.id} className="px-3 py-2 text-left text-gray-500">{f.label}</th>
                      ))}
                      <th className="px-3 py-2 text-left text-gray-500 w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validatedRows.map((vr, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${!vr.valid ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        {fields.filter(f => Object.values(mapping).includes(f.id)).map(f => (
                          <td key={f.id} className="px-3 py-2 text-gray-700 truncate max-w-[100px]">{vr.row[f.id] || '—'}</td>
                        ))}
                        <td className="px-3 py-2">
                          {vr.valid
                            ? <span className="text-green-600 font-medium">Ready</span>
                            : <span className="text-red-500 text-[10px]">Missing: {vr.error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── STEP 3: Import Result ── */}
          {step === 3 && importResult && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Import Complete</h3>
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold text-green-700">{importResult.imported} imported</span>
                {importResult.skipped > 0 && <> · <span className="font-semibold text-amber-600">{importResult.skipped} duplicates skipped</span></>}
                {importResult.errors > 0 && <> · <span className="font-semibold text-red-600">{importResult.errors} errors</span></>}
              </p>
              <button
                onClick={onDone}
                className="bg-[#422D83] hover:bg-[#321f6b] text-white px-6 py-2.5 rounded-xl font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!(step === 3 && importResult) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={() => step === 1 ? onClose() : setStep(s => (s - 1) as Step)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step === 1 && (
              <p className="text-xs text-gray-400">Upload a file to continue</p>
            )}
            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!fields.filter(f => f.required).every(f => Object.values(mapping).includes(f.id))}
                className="px-4 py-2.5 bg-[#422D83] hover:bg-[#321f6b] text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                Preview & Import <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 3 && !importResult && (
              <button
                onClick={handleImport}
                disabled={importing || readyCount === 0}
                className="px-4 py-2.5 bg-[#422D83] hover:bg-[#321f6b] text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? <><Loader2 className="w-4 h-4 animate-spin" />Importing…</> : `Import ${readyCount} Records`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
