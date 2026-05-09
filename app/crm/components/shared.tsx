'use client'

import React, { useEffect } from 'react'
import { X, AlertTriangle, CheckCircle } from 'lucide-react'
import { STATUS_COLORS } from '../constants'

export function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    "MND-1": "bg-purple-600 text-white",
    "DC": "bg-blue-600 text-white",
    "SVND-1": "bg-indigo-600 text-white",
    "Hot": "bg-red-500 text-white",
    "Warm": "bg-orange-500 text-white",
    "Cold": "bg-blue-400 text-white",
    "Escalated": "bg-yellow-500 text-white",
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[tag] || "bg-gray-200 text-gray-700"}`}>
      {tag}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200"
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {status}
    </span>
  )
}

export function RMInitial({ name, color = "bg-blue-500" }: { name: string; color?: string }) {
  if (!name) return null
  return (
    <span title={name} className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold flex-shrink-0 ${color}`}>
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  )
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
    >
      {children}
    </select>
  )
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
    />
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({ message, type = 'default', onClose }: {
  message: string
  type?: 'default' | 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const bg = type === 'success' ? 'bg-green-700' : type === 'error' ? 'bg-red-700' : 'bg-gray-900'

  return (
    <div className={`fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] ${bg} text-white text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 max-w-xs whitespace-nowrap`}>
      {type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
      {type === 'error' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      <span className="truncate">{message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white ml-1 flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', inputLabel, danger = false, onConfirm, onCancel }: {
  title: string
  message: string
  confirmLabel?: string
  inputLabel?: string
  danger?: boolean
  onConfirm: (inputValue?: string) => void
  onCancel: () => void
}) {
  const [inputValue, setInputValue] = React.useState('')
  const needsInput = !!inputLabel
  const canConfirm = !needsInput || inputValue === confirmLabel

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
        {needsInput && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">{inputLabel}</label>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder={confirmLabel}
            />
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => canConfirm && onConfirm(inputValue)}
            disabled={!canConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#422D83] hover:bg-[#321f6b] text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
