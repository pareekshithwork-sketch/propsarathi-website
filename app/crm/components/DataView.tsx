'use client'

import React from 'react'
import { Database, Phone, Loader2 } from 'lucide-react'
import type { DataRecord } from '../types'
import { RM_LIST } from '../constants'

export function DataView({ dataRecords, selectedData, setSelectedData, dataFilter, setDataFilter, showConvert, setShowConvert, convertForm, setConvertForm, onConvert, savingData }: any) {
  const filters = ["All", "Converted", "Not Converted"]

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`${selectedData ? "w-96 flex-shrink-0" : "flex-1"} flex flex-col border-r border-gray-200 bg-white overflow-hidden`}>
        {/* Filter */}
        <div className="border-b border-gray-100 px-3 py-2 flex gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setDataFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                dataFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-50">
          {dataRecords.length} records
        </div>
        <div className="flex-1 overflow-y-auto">
          {dataRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Database className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No data records</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {dataRecords.map((rec: DataRecord) => (
                  <tr
                    key={rec.dataId}
                    onClick={() => setSelectedData(rec)}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedData?.dataId === rec.dataId ? "bg-blue-50" : ""}`}
                  >
                    <td className="pl-3 pr-1 py-2 w-1">
                      <div className={`w-2 h-2 rounded-full ${rec.converted === "Yes" ? "bg-green-500" : "bg-gray-300"}`} />
                    </td>
                    <td className="py-2 pr-2">
                      <p className="font-semibold text-gray-800">{rec.name || "—"}</p>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{rec.countryCode} {rec.phone}</span>
                      </div>
                      {rec.email && <p className="text-gray-400 truncate max-w-[150px]">{rec.email}</p>}
                    </td>
                    <td className="py-2 pr-3">
                      <p className="text-gray-500">{rec.source}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${rec.converted === "Yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {rec.converted === "Yes" ? "Converted" : "Not Converted"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Data detail */}
      {selectedData ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="border-b border-gray-200 p-3 flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
              {selectedData.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 text-sm">{selectedData.name}</h2>
              <p className="text-xs text-gray-500">{selectedData.dataId} · {selectedData.createdAt}</p>
            </div>
            {selectedData.converted !== "Yes" && (
              <button
                onClick={() => setShowConvert(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
              >
                Convert to Lead
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[
              { label: "Phone", value: `${selectedData.countryCode} ${selectedData.phone}` },
              { label: "Email", value: selectedData.email },
              { label: "Source", value: selectedData.source },
              { label: "Gender", value: selectedData.gender },
              { label: "DOB", value: selectedData.dob },
              { label: "Status", value: selectedData.status },
              { label: "Converted", value: selectedData.converted },
              { label: "Converted Lead ID", value: selectedData.convertedLeadId },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className="flex">
                <span className="text-xs text-gray-500 w-36">{row.label}</span>
                <span className="text-xs font-medium text-gray-800">{row.value}</span>
              </div>
            ))}
            {selectedData.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3">{selectedData.notes}</p>
              </div>
            )}
          </div>

          {/* Convert modal inline */}
          {showConvert && (
            <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Convert to Lead</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Assigned RM</label>
                  <select
                    value={convertForm.assignedRM}
                    onChange={e => setConvertForm((p: any) => ({ ...p, assignedRM: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select RM</option>
                    {RM_LIST.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Budget</label>
                  <input
                    value={convertForm.budget}
                    onChange={e => setConvertForm((p: any) => ({ ...p, budget: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none"
                    placeholder="e.g. 50 Lakhs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Property Type</label>
                  <select
                    value={convertForm.propertyType}
                    onChange={e => setConvertForm((p: any) => ({ ...p, propertyType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select type</option>
                    {["Apartment", "Villa", "Penthouse", "Studio", "Townhouse", "Plot"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">City</label>
                  <select
                    value={convertForm.city}
                    onChange={e => setConvertForm((p: any) => ({ ...p, city: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select city</option>
                    {["Bangalore", "Dubai", "Mumbai", "Delhi"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onConvert}
                  disabled={savingData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingData ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Convert
                </button>
                <button onClick={() => setShowConvert(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-300">
          <div className="text-center">
            <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a record to view details</p>
          </div>
        </div>
      )}
    </div>
  )
}
