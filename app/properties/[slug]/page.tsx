import { notFound } from "next/navigation"
import { getProjectBySlug } from "@/lib/projectsDb"
import ProjectDetailClient from "@/components/ProjectDetailClient"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: "Project Not Found" }
  return {
    title: project.seoTitle || `${project.name} by ${project.developer} | PropSarathi`,
    description: project.seoDescription || `${project.name} in ${project.location}, ${project.city}. ${project.status}. Starting from ${project.minPrice}. Book with PropSarathi.`,
    openGraph: {
      title: project.seoTitle || project.name,
      description: project.seoDescription || project.description?.slice(0, 160),
      images: [project.coverImage || '/propsarathi-og.jpg'],
    },
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()
  return <ProjectDetailClient project={project} />
}
