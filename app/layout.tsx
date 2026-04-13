import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import ScrollProgressBar from "@/components/ScrollProgressBar"
import { PortalProvider } from "@/components/PortalProvider"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PropSarathi - Premium Real Estate Advisory | Bangalore & Dubai",
  description: "Discover pre-launch and new launch properties in Bangalore and Dubai. Direct from developers. Expert advisory, transparent pricing.",
  generator: "PropSarathi",
  metadataBase: new URL("https://www.propsarathi.com"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PropSarathi",
  },
  formatDetection: { telephone: true },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "theme-color": "#059669",
    "msapplication-TileColor": "#059669",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <PortalProvider>
          <ScrollProgressBar />
          {children}
          <ServiceWorkerRegistration />
        </PortalProvider>
        <Analytics />
      </body>
    </html>
  )
}
