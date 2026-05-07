'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { countryCodes } from '@/lib/countryCodes'

// Priority countries shown at top of list
const PRIORITY_CODES = ['+91', '+971', '+1', '+44', '+65', '+61']

interface Country {
  code: string
  flag: string
  country: string
}

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  countryCode: string
  onCountryChange: (code: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
}

function getCountriesSorted(): Country[] {
  const priority = PRIORITY_CODES.flatMap(code =>
    countryCodes.filter(c => c.code === code)
  )
  // Deduplicate by code+country combination
  const seenKeys = new Set(priority.map(c => `${c.code}:${c.country}`))
  const rest = countryCodes.filter(c => !seenKeys.has(`${c.code}:${c.country}`))
  return [...priority, ...rest]
}

const ALL_COUNTRIES = getCountriesSorted()

const STORAGE_KEY = 'ps_phone_country'

export function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryChange,
  placeholder = 'Phone number',
  className = '',
  inputClassName = '',
  disabled = false,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Load persisted country on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !countryCode) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) onCountryChange(saved)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  function selectCountry(code: string) {
    onCountryChange(code)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, code)
    setOpen(false)
    setSearch('')
  }

  const selected = countryCodes.find(c => c.code === countryCode) ||
    ALL_COUNTRIES.find(c => c.code === '+91')!

  const filtered = search.trim()
    ? ALL_COUNTRIES.filter(c =>
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : ALL_COUNTRIES

  const inputCls = [
    'flex-1 border border-gray-200 rounded-r-xl px-3 py-2.5 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-[#422D83]/20 focus:border-[#422D83]',
    'transition-colors bg-gray-50/50',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    inputClassName,
  ].filter(Boolean).join(' ')

  return (
    <div className={`flex gap-0 ${className}`} ref={dropdownRef}>
      {/* Country code button */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 border border-r-0 border-gray-200 rounded-l-xl px-3 py-2.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 transition-colors min-w-[88px] disabled:opacity-50"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-gray-700">{selected.code}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-64 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country or code…"
                  className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Country list */}
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No results</p>
              ) : (
                filtered.map((c, i) => (
                  <button
                    key={`${c.code}:${c.country}:${i}`}
                    type="button"
                    onClick={() => selectCountry(c.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                      c.code === countryCode ? 'bg-[#422D83]/5 text-[#422D83] font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base leading-none w-6 text-center">{c.flag}</span>
                    <span className="flex-1 truncate">{c.country}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">{c.code}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phone number input */}
      <input
        type="tel"
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^\d\s\-()]/g, ''))}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls}
      />
    </div>
  )
}
