"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import PortalLoginModal from "./PortalLoginModal"

interface Viewer {
  id: number
  phone: string
  countryCode: string
  name: string
}

interface PortalContextType {
  viewer: Viewer | null
  isLoggedIn: boolean
  showLoginModal: (forced?: boolean, projectName?: string) => void
  logout: () => void
  trackTime: (projectSlug: string, projectName: string) => void
  stopTracking: () => void
}

const PortalContext = createContext<PortalContextType>({
  viewer: null,
  isLoggedIn: false,
  showLoginModal: () => {},
  logout: () => {},
  trackTime: () => {},
  stopTracking: () => {},
})

export function usePortal() {
  return useContext(PortalContext)
}

// Time thresholds (seconds)
const PROJECT_LOGIN_THRESHOLD = 60    // 1 min on a project page → show login gate
const PROJECT_BROWSE_THRESHOLD = 60   // 1 min on project page while logged in → capture as "Browsing" lead

// localStorage key for gate flag
const GATE_KEY = "ps_portal_gate_triggered"

// Pages where the portal modal should NEVER appear
const INTERNAL_PATHS = ["/crm", "/partner-portal", "/admin-portal", "/api"]

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isInternalPage = INTERNAL_PATHS.some(p => pathname?.startsWith(p))
  const isProjectPage = pathname?.startsWith("/properties/") && pathname !== "/properties"

  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginForced, setLoginForced] = useState(false)
  const [loginProject, setLoginProject] = useState<string | undefined>()
  const [checked, setChecked] = useState(false)

  // Timers
  const gateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const browseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const projectSlugRef = useRef<string | null>(null)
  const projectNameRef = useRef<string | null>(null)

  // Check auth on mount
  useEffect(() => {
    fetch("/api/portal/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d.success) setViewer(d.viewer)
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [])

  // Gate logic — only on project pages, only if not logged in
  useEffect(() => {
    if (!checked || viewer || isInternalPage || !isProjectPage) return

    // If gate was already triggered before (across refreshes), show immediately
    const alreadyGated = typeof window !== "undefined" && localStorage.getItem(GATE_KEY) === "1"
    if (alreadyGated) {
      setLoginForced(true)
      setLoginOpen(true)
      return
    }

    // First time on a project page — give 1 min then gate
    gateTimerRef.current = setTimeout(() => {
      if (typeof window !== "undefined") localStorage.setItem(GATE_KEY, "1")
      setLoginForced(true)
      setLoginOpen(true)
    }, PROJECT_LOGIN_THRESHOLD * 1000)

    return () => {
      if (gateTimerRef.current) clearTimeout(gateTimerRef.current)
    }
  }, [checked, viewer, isInternalPage, isProjectPage, pathname])

  const showLoginModal = useCallback((forced = false, projectName?: string) => {
    setLoginForced(forced)
    setLoginProject(projectName)
    setLoginOpen(true)
  }, [])

  const handleLoginSuccess = useCallback((v: Viewer) => {
    setViewer(v)
    setLoginOpen(false)
    setLoginForced(false)
    // Clear gate flag — they're logged in now, no more gates
    if (typeof window !== "undefined") localStorage.removeItem(GATE_KEY)
    if (gateTimerRef.current) clearTimeout(gateTimerRef.current)
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/portal/auth/me", { method: "DELETE" })
    setViewer(null)
  }, [])

  // Track time on a project page (for logged-in viewers)
  // After 1 min → auto-capture as "Browsing" lead in CRM
  const trackTime = useCallback((projectSlug: string, projectName: string) => {
    projectSlugRef.current = projectSlug
    projectNameRef.current = projectName

    if (browseTimerRef.current) clearTimeout(browseTimerRef.current)

    browseTimerRef.current = setTimeout(async () => {
      if (!viewer?.phone) return // not logged in

      try {
        await fetch("/api/portal/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectSlug,
            projectName,
            type: "browsing",
            durationSeconds: PROJECT_BROWSE_THRESHOLD,
          }),
        })
      } catch {}
    }, PROJECT_BROWSE_THRESHOLD * 1000)
  }, [viewer])

  const stopTracking = useCallback(() => {
    if (browseTimerRef.current) clearTimeout(browseTimerRef.current)
    projectSlugRef.current = null
    projectNameRef.current = null
  }, [])

  if (!checked) return null

  return (
    <PortalContext.Provider value={{ viewer, isLoggedIn: !!viewer, showLoginModal, logout, trackTime, stopTracking }}>
      {children}
      {loginOpen && !isInternalPage && (
        <PortalLoginModal
          forced={loginForced}
          projectName={loginProject}
          onSuccess={handleLoginSuccess}
          onClose={loginForced ? undefined : () => setLoginOpen(false)}
        />
      )}
    </PortalContext.Provider>
  )
}
