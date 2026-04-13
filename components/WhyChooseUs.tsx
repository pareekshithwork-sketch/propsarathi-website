import type React from "react"
import type { USP } from "../types"
import BuildingIcon from "./icons/BuildingIcon"
import KeyIcon from "./icons/KeyIcon"
import UsersIcon from "./icons/UsersIcon"
import CheckIcon from "./icons/CheckIcon"

const uspData: USP[] = [
  {
    id: 1,
    title: "Strategic Portfolio Planning",
    description:
      "We go beyond single transactions to build full, future-proof portfolios. Our goal is a sustainable financial ecosystem aligned with your life goals.",
    icon: <BuildingIcon />,
  },
  {
    id: 2,
    title: "Vetted & Exclusive Opportunities",
    description:
      "Gain access to a curated inventory from verified builders. We handpick assets aligned with your objectives, ensuring your capital is protected and poised for growth.",
    icon: <KeyIcon />,
  },
  {
    id: 3,
    title: "Seamless 4-Step Execution",
    description:
      "Our signature process—Consult, Curate, Execute, Grow—handles everything from discovery to documentation, from leasing to legacy.",
    icon: <UsersIcon />,
  },
  {
    id: 4,
    title: "A Client-First Commitment",
    description:
      "We treat every client's portfolio as if it were our own. This is the level of care, insight, and long-term thinking we bring to every relationship.",
    icon: <CheckIcon />,
  },
]

const WhyChooseUs: React.FC = () => {
  return (
    <section id="why-us" className="py-12 md:py-16 glass-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-serif font-bold text-brand-dark">Why PropSarathi?</h2>
          <p className="text-brand-muted max-w-2xl mx-auto mt-4">
            We are more than advisors; we are your strategic partners in wealth creation through real estate.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center stagger-fade-in">
          {uspData.map((item) => (
            <div key={item.id} className="glass-card p-8 rounded-lg hover-lift">
              <div className="flex items-center justify-center h-16 w-16 mx-auto mb-6 rounded-full bg-brand-primary/10 text-brand-primary animate-float-gentle">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-dark mb-2">{item.title}</h3>
              <p className="text-brand-muted text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
