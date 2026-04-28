'use client'

import React, { useState } from 'react'
import type { Lead } from '../types'
import { PIPELINE_STAGES, STAGE_COL_COLORS } from '../constants'

export function PipelineView({ leads, onStatusChange }: { leads: Lead[]; onStatusChange: (leadId: string, status: string) => void }) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, leadId: string) {
    setDragging(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e: React.DragEvent, stage: string) {
    e.preventDefault()
    if (dragging) onStatusChange(dragging, stage)
    setDragging(null)
    setDragOver(null)
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault()
    setDragOver(stage)
  }

  const byStage: Record<string, Lead[]> = {}
  PIPELINE_STAGES.forEach(s => { byStage[s] = leads.filter(l => l.status === s) })

  return (
    <div className="h-full overflow-x-auto bg-gray-50">
      <div className="flex gap-3 h-full p-4 min-w-max">
        {PIPELINE_STAGES.map(stage => (
          <div
            key={stage}
            onDragOver={e => handleDragOver(e, stage)}
            onDrop={e => handleDrop(e, stage)}
            onDragLeave={() => setDragOver(null)}
            className={`w-52 flex-shrink-0 flex flex-col rounded-xl border border-gray-200 border-t-4 ${STAGE_COL_COLORS[stage]} bg-white shadow-sm ${dragOver === stage ? 'bg-blue-50' : ''}`}
          >
            <div className="px-3 py-2.5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 truncate">{stage}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">{byStage[stage].length}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {byStage[stage].map(lead => (
                <div
                  key={lead.leadId}
                  draggable
                  onDragStart={e => handleDragStart(e, lead.leadId)}
                  className={`bg-white border border-gray-200 rounded-lg p-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow text-xs ${dragging === lead.leadId ? 'opacity-50' : ''}`}
                >
                  <p className="font-semibold text-gray-800 truncate">{lead.clientName || 'Unknown'}</p>
                  <p className="text-gray-400 truncate mt-0.5">{lead.phone}</p>
                  {lead.budget && <p className="text-[#422D83] font-medium mt-1">{lead.budget}</p>}
                  <div className="flex items-center justify-between mt-1.5 gap-1">
                    {lead.assignedRM ? <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full truncate">{lead.assignedRM}</span> : <span />}
                    {lead.city && <span className="text-gray-400">{lead.city}</span>}
                  </div>
                </div>
              ))}
              {byStage[stage].length === 0 && (
                <div className="text-center py-6 text-gray-300 text-xs">Drop here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
