"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface CardDetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  originRect?: DOMRect | null
}

export default function CardDetailModal({ isOpen, onClose, title, children, originRect }: CardDetailModalProps) {
  const [mounted, setMounted] = useState(false)
  const [animationState, setAnimationState] = useState<"entering" | "entered" | "exiting">("entering")

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setAnimationState("entering")
      const timer = setTimeout(() => setAnimationState("entered"), 50)
      return () => clearTimeout(timer)
    } else {
      setAnimationState("exiting")
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const getTransformOrigin = () => {
    if (!originRect) return "center center"
    const x = ((originRect.left + originRect.width / 2) / window.innerWidth) * 100
    const y = ((originRect.top + originRect.height / 2) / window.innerHeight) * 100
    return `${x}% ${y}%`
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseLeave={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-lg transition-opacity duration-300 ${
          animationState === "entered" ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative bg-gradient-to-br from-brand-light via-white to-brand-light/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto transition-all duration-500 ease-out border-2 border-secondary/30`}
        style={{
          transformOrigin: getTransformOrigin(),
          transform:
            animationState === "entered"
              ? "scale(1) translateY(0)"
              : animationState === "entering"
                ? "scale(0.8) translateY(20px)"
                : "scale(0.9) translateY(10px)",
          opacity: animationState === "entered" ? 1 : 0,
        }}
      >
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-primary/90 text-white p-6 rounded-t-2xl flex justify-between items-center backdrop-blur-sm">
          <h3 className="text-2xl font-serif font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 md:p-8">{children}</div>

        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/20 via-transparent to-secondary/20 opacity-50" />
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
