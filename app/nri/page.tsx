import { getAllProjects } from '@/lib/projectsDb'
import NRIPageClient from '@/components/NRIPageClient'

export const metadata = {
  title: 'NRI Property Investment — India & Dubai | PropSarathi',
  description: 'Invest in India and Dubai real estate from anywhere in the world. Expert NRI advisory, FEMA guidance, 7-12% rental yields, and seamless transactions across borders.',
  openGraph: {
    title: 'NRI Property Investment — India & Dubai | PropSarathi',
    description: 'Expert real estate advisory for NRIs investing in Bangalore and Dubai.',
  },
}

export default async function NRIPage() {
  let dubaiProjects: any[] = []
  let bangaloreProjects: any[] = []
  try {
    const all = await getAllProjects()
    dubaiProjects = all.filter((p: any) => p.city === 'Dubai').slice(0, 3)
    bangaloreProjects = all.filter((p: any) => p.city === 'Bangalore').slice(0, 3)
  } catch {}
  return <NRIPageClient dubaiProjects={dubaiProjects} bangaloreProjects={bangaloreProjects} />
}
