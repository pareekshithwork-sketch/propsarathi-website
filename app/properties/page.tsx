import { Suspense } from "react"
import PropertiesClient from "@/components/PropertiesClient"

export const metadata = {
  title: "Properties - Pre-Launch & New Launch Projects | PropSarathi",
  description: "Browse pre-launch and new launch properties in Bangalore and Dubai. Filter by city, type, budget, bedrooms. Direct from developers.",
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PropertiesClient />
    </Suspense>
  )
}
