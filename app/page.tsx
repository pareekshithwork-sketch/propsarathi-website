import { Suspense } from "react"
import HomepageClient from "@/components/HomepageClient"
import { getAllProjects } from "@/lib/projectsDb"

export const metadata = {
  title: "PropSarathi - Find Your Dream Property | Bangalore & Dubai Real Estate",
  description: "Discover pre-launch and new launch properties in Bangalore and Dubai. Direct from developers. Expert advisory, transparent pricing, seamless investment.",
  openGraph: {
    title: "PropSarathi - Premium Real Estate Advisory",
    description: "Pre-launch & new launch properties in Bangalore and Dubai. Direct developer pricing.",
    images: ["/propsarathi-og.jpg"],
  },
}

export default async function HomePage() {
  let featuredProjects: any[] = []
  try {
    const all = await getAllProjects()
    featuredProjects = all.filter((p: any) => p.isFeatured).slice(0, 6)
  } catch {}

  return <HomepageClient featuredProjects={featuredProjects} />
}
