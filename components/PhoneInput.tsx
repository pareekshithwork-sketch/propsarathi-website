'use client'

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { ChevronDown, Search, Check, X, MapPin } from 'lucide-react'
import {
  COUNTRIES, PINNED_COUNTRIES, CountryCode,
  getCountryByDialCode, detectCountryFromNumber,
  formatPhoneNumber, getIndiaCircle, getTimezone,
} from '@/lib/countryCodes'

export interface DuplicateInfo {
  exists: boolean
  type: 'client' | 'partner' | 'lead'
  name?: string
  assignedRM?: string
  partnerId?: string
}
interface RecentEntry { dialCode: string; number: string; flag: string; name: string }

export interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  countryCode: string
  onCountryChange: (dialCode: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
  context?: 'client' | 'partner' | 'crm_partner' | 'crm_lead' | 'default'
  onValidChange?: (isValid: boolean) => void
  onDuplicateFound?: (info: DuplicateInfo) => void
  showAlternate?: boolean
  autoFocus?: boolean
}

const RECENTS_KEY = 'ps_recent_phones'

function getRecents(): RecentEntry[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]') } catch { return [] }
}
function saveRecent(e: RecentEntry) {
  try {
    const list = getRecents().filter(r => r.number !== e.number || r.dialCode !== e.dialCode)
    localStorage.setItem(RECENTS_KEY, JSON.stringify([e, ...list].slice(0, 3)))
  } catch {}
}

export function PhoneInput({
  value, onChange, countryCode, onCountryChange,
  placeholder = 'Phone number', disabled = false, className = '', inputClassName = '',
  context = 'default', onValidChange, onDuplicateFound, autoFocus = false,
}: PhoneInputProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [touched, setTouched] = useState(false)
  const [dupInfo, setDupInfo] = useState<DuplicateInfo | null>(null)
  const [recents, setRecents] = useState<RecentEntry[]>([])
  const [kbIndex, setKbIndex] = useState(-1)
  const hasTyped3 = useRef(false)

  const country = getCountryByDialCode(countryCode) ?? PINNED_COUNTRIES[0]
  const digits = value.replace(/\D/g, '')
  const isValid = digits.length >= country.minLength && digits.length <= country.maxLength
  const showError = touched && digits.length > 0 && !isValid
  const errorMsg = digits.length < country.minLength ? 'Number too short' : 'Number too long'
  const circle = country.dialCode === '+91' && digits.length === 10 ? getIndiaCircle(digits) : null
  const isIntl = country.dialCode !== '+91' && country.dialCode !== '+971'
  const isUae = country.dialCode === '+971'

  // Load recents on focus
  useEffect(() => { if (focused) setRecents(getRecents()) }, [focused])

  // Notify parent of validity
  useEffect(() => { onValidChange?.(isValid) }, [isValid, onValidChange])

  // Timezone detection
  useEffect(() => {
    try { sessionStorage.setItem('ps_user_timezone', getTimezone(country.code)) } catch {}
  }, [country.code])

  // Duplicate check (debounced 800ms)
  useEffect(() => {
    if (!isValid || context === 'crm_lead') return
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/auth/check-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: countryCode + digits, context }),
        })
        const d = await r.json()
        const info: DuplicateInfo = d.exists ? d : { exists: false, type: 'client' }
        setDupInfo(d.exists ? info : null)
        onDuplicateFound?.(info)
      } catch {}
    }, 800)
    return () => clearTimeout(t)
  }, [digits, countryCode, isValid, context, onDuplicateFound])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  useEffect(() => { if (open) setTimeout(() => searchRef.current?.focus(), 50) }, [open])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, country.maxLength)
    setTouched(true)
    if (raw.length >= 3) hasTyped3.current = true
    onChange(formatPhoneNumber(raw, country))
    if (raw.length >= country.minLength) { try { navigator.vibrate(50) } catch {} }
    else if (showError) { try { navigator.vibrate([50, 50, 50]) } catch {} }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const raw = e.clipboardData.getData('text')
    const cleaned = raw.replace(/[^\d+]/g, '')
    const norm = cleaned.startsWith('+') ? cleaned
      : cleaned.startsWith('00') ? '+' + cleaned.slice(2) : null
    if (norm) {
      const detected = detectCountryFromNumber(norm)
      if (detected) {
        onCountryChange(detected.dialCode)
        const num = norm.slice(detected.dialCode.length).replace(/\D/g, '').slice(0, detected.maxLength)
        onChange(formatPhoneNumber(num, detected))
        setTouched(true); return
      }
    }
    const d = cleaned.replace(/\D/g, '').slice(0, country.maxLength)
    onChange(formatPhoneNumber(d, country)); setTouched(true)
  }

  function handleBlur() {
    setFocused(false)
    if (hasTyped3.current && !isValid) {
      fetch('/api/analytics/phone-dropoff', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, partialLength: digits.length, countryCode, timestamp: Date.now() }),
      }).catch(() => {})
    }
    if (isValid) saveRecent({ dialCode: country.dialCode, number: value, flag: country.flag, name: country.name })
  }

  function selectCountry(c: CountryCode) {
    onCountryChange(c.dialCode)
    try { localStorage.setItem('ps_phone_country', c.dialCode) } catch {}
    onChange(''); setTouched(false); setDupInfo(null)
    setOpen(false); setSearch('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const listItems: (CountryCode | 'divider')[] = search.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search))
    : [...PINNED_COUNTRIES, 'divider', ...COUNTRIES]

  const selectableItems = listItems.filter(x => x !== 'divider') as CountryCode[]

  function handleDropdownKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setKbIndex(i => Math.min(i + 1, selectableItems.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setKbIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && kbIndex >= 0) { e.preventDefault(); selectCountry(selectableItems[kbIndex]) }
    else if (e.key === 'Escape') { setOpen(false); setSearch('') }
  }

  const borderCls = showError
    ? 'border-red-400 focus:ring-red-200'
    : isValid && touched
      ? 'border-green-400 focus:ring-green-100'
      : 'border-gray-200 focus:ring-[#422D83]/20 focus:border-[#422D83]'

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Recent chips */}
      {focused && !value && recents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recents.map((r, i) => (
            <div key={i} className="flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5 text-xs">
              <button type="button" onClick={() => { onCountryChange(r.dialCode); onChange(r.number); setTouched(true) }}
                className="text-violet-700 font-medium">{r.flag} {r.number}</button>
              <button type="button" onClick={() => {
                const u = recents.filter((_, j) => j !== i); setRecents(u)
                try { localStorage.setItem(RECENTS_KEY, JSON.stringify(u)) } catch {}
              }} className="text-violet-400 hover:text-violet-700 ml-0.5"><X className="h-2.5 w-2.5" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex" ref={wrapRef}>
        {/* Country selector */}
        <div className="relative flex-shrink-0">
          <button type="button" disabled={disabled} onClick={() => { setOpen(o => !o); setKbIndex(-1) }}
            role="combobox" aria-expanded={open} aria-label="Select country code"
            className="flex items-center gap-1.5 border border-r-0 border-gray-200 rounded-l-xl px-3 py-2.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 transition-colors min-w-[90px] disabled:opacity-50">
            <span className="text-base leading-none">{country.flag}</span>
            <span className="text-gray-700">{country.dialCode}</span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-72 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input ref={searchRef} type="text" value={search}
                    onChange={e => { setSearch(e.target.value); setKbIndex(-1) }}
                    onKeyDown={handleDropdownKey}
                    placeholder="Search country or code…"
                    className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none placeholder:text-gray-400"
                    aria-label="Search countries" />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {listItems.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-4">No results</p>
                  : listItems.map((item, idx) => item === 'divider'
                    ? <div key="divider" className="mx-3 my-1 border-t border-gray-100" />
                    : (() => {
                        const selIdx = selectableItems.indexOf(item)
                        return (
                          <button key={`${item.dialCode}:${item.code}`} type="button"
                            onClick={() => selectCountry(item)} aria-selected={item.dialCode === countryCode}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                              selIdx === kbIndex ? 'bg-violet-50' : 'hover:bg-gray-50'
                            } ${item.dialCode === countryCode ? 'text-[#422D83] font-medium' : 'text-gray-700'}`}>
                            <span className="text-base leading-none w-6 text-center">{item.flag}</span>
                            <span className="flex-1 truncate">{item.name}</span>
                            <span className="text-gray-400 text-xs flex-shrink-0">{item.dialCode}</span>
                            {item.dialCode === countryCode && <Check className="w-3 h-3 text-[#422D83] flex-shrink-0" />}
                          </button>
                        )
                      })()
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Phone input */}
        <div className="relative flex-1">
          <input ref={inputRef} type="tel" value={value} name="phone"
            autoComplete="tel" inputMode="tel" disabled={disabled}
            autoFocus={autoFocus} placeholder={placeholder}
            aria-label="Phone number" aria-invalid={showError}
            aria-describedby={showError ? 'phone-error' : undefined}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            onChange={handleChange}
            onPaste={handlePaste}
            className={[
              'w-full border rounded-r-xl px-3 py-2.5 text-sm transition-colors bg-gray-50/50',
              'focus:outline-none focus:ring-2',
              borderCls,
              isValid && touched ? 'pr-8' : '',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
              inputClassName,
            ].filter(Boolean).join(' ')}
          />
          {isValid && touched && (
            <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Error */}
      {showError && (
        <p id="phone-error" role="alert" aria-live="polite" className="text-xs text-red-600 px-1">{errorMsg}</p>
      )}

      {/* India circle badge */}
      {circle && (
        <p className="text-xs text-gray-400 flex items-center gap-1 px-1">
          <MapPin className="h-3 w-3" />{circle} circle
        </p>
      )}

      {/* NRI / UAE tag */}
      {!circle && isUae && (
        <p className="text-xs text-gray-400 px-1">🇦🇪 UAE number</p>
      )}
      {!circle && isIntl && !isUae && (
        <p className="text-xs text-gray-400 px-1">🌍 International number</p>
      )}

      {/* Duplicate banner */}
      {dupInfo && dupInfo.exists && (
        <div aria-live="polite" className={`text-xs px-3 py-2 rounded-lg border ${
          context === 'crm_partner'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {context === 'crm_partner'
            ? `Already a partner — ${dupInfo.name}${dupInfo.assignedRM ? `, assigned to ${dupInfo.assignedRM}` : ''}`
            : `Welcome back${dupInfo.name ? ` ${dupInfo.name}` : ''}! We'll send an OTP to sign in.`}
        </div>
      )}
    </div>
  )
}
