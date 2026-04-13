"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { countryCodes } from "@/lib/countryCodes"
import { Search } from "lucide-react"

interface CountryCodeSelectProps {
  value: string
  onChange: (code: string) => void
  className?: string
}

export function CountryCodeSelect({ value, onChange, className = "" }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const dropdownHeight = 300 // Approximate max height

        // Calculate if dropdown should open upward or downward
        const spaceBelow = viewportHeight - rect.bottom
        const shouldOpenUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight

        setDropdownPosition({
          top: shouldOpenUpward ? rect.top + window.scrollY - dropdownHeight - 4 : rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 256), // Use button width or minimum 256px
        })
      }

      updatePosition()

      // Update position on scroll and resize
      window.addEventListener("scroll", updatePosition, true)
      window.addEventListener("resize", updatePosition)

      return () => {
        window.removeEventListener("scroll", updatePosition, true)
        window.removeEventListener("resize", updatePosition)
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const filteredCountries = countryCodes.filter(
    (country) =>
      country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm) ||
      country.flag.includes(searchTerm),
  )

  const selectedCountry = countryCodes.find((c) => c.code === value)

  const handleCountrySelect = (code: string) => {
    console.log("[v0] CountryCodeSelect: User selected country code:", code)
    onChange(code)
    setIsOpen(false)
    setSearchTerm("")
  }

  const dropdownContent =
    isOpen && mounted ? (
      <div
        ref={dropdownRef}
        style={{
          position: "absolute",
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 99999,
        }}
        className="bg-white border border-gray-200 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country or code..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <button
                key={country.code + country.country}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCountrySelect(country.code)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary/10 transition-colors flex items-center gap-2 ${
                  value === country.code ? "bg-secondary/20 font-semibold" : ""
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 truncate">{country.country}</span>
                <span className="text-gray-600 text-xs">{country.code}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">No countries found</div>
          )}
        </div>
      </div>
    ) : null

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          console.log("[v0] CountryCodeSelect: Dropdown toggled, isOpen:", !isOpen)
          setIsOpen(!isOpen)
        }}
        className="w-full bg-input text-foreground px-2 py-2.5 md:py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs md:text-sm flex items-center justify-between gap-1 hover:bg-secondary/10 transition-colors"
      >
        <span className="truncate">
          {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.code}` : "Select"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {mounted && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  )
}

export default CountryCodeSelect
