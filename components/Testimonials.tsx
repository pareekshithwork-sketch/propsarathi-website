"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Testimonial } from "../types"

const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: "Ajay Mehta",
    role: "NRI Investor, UK",
    rating: 5,
    quote:
      "PropSarathi helped me invest in Dubai without setting foot there. Everything was smooth, legal, and ROI-focused.",
    image: "https://picsum.photos/seed/person1/100/100",
  },
  {
    id: 2,
    name: "Shruti Nair",
    role: "Homeowner, Bangalore",
    rating: 5,
    quote:
      "I upgraded to a better apartment in Bangalore through PropSarathi. Their team understood exactly what I needed—no fluff.",
    image: "https://picsum.photos/seed/person2/100/100",
  },
  {
    id: 3,
    name: "Rohit Sheth",
    role: "HNI, Mumbai",
    rating: 5,
    quote:
      "They're not just advisors—they're your extended team. The SPV structuring and rental support were top-notch.",
    image: "https://picsum.photos/seed/person3/100/100",
  },
]

// Duplicate for seamless scroll effect
const extendedTestimonials = [...testimonialsData, ...testimonialsData]

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex text-brand-secondary">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${i < rating ? "fill-current" : "text-gray-300"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div className="flex-shrink-0 w-80 md:w-96 glass-card p-8 rounded-lg mx-4 hover-lift">
    <svg
      className="w-10 h-10 text-brand-primary/20 mb-4"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 18 14"
    >
      <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
    </svg>
    <p className="text-brand-muted mb-6 h-24 italic">"{testimonial.quote}"</p>
    <div className="flex items-center">
      <img
        src={testimonial.image || "/placeholder.svg"}
        alt={testimonial.name}
        className="w-14 h-14 rounded-full mr-4 border-2 border-brand-secondary"
      />
      <div>
        <h3 className="text-lg font-bold font-serif text-brand-dark">{testimonial.name}</h3>
        <p className="text-brand-muted text-sm mb-1">{testimonial.role}</p>
        <StarRating rating={testimonial.rating} />
      </div>
    </div>
  </div>
)

const Testimonials: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return // Skip auto-scroll on mobile

    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += 0.3
        scrollContainer.scrollLeft = scrollPosition

        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0
        }
      }
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationId)
  }, [isPaused, isMobile])

  return (
    <section className="py-12 md:py-16 glass-section overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center mb-12 px-6 animate-fade-in-up">
          <h2 className="text-4xl font-serif font-bold text-gray-900">What Our Clients Say</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mt-4">
            Our success is measured by the trust and confidence our clients place in us.
          </p>
        </div>
        <div
          ref={scrollRef}
          className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-hide"
          onMouseEnter={() => !isMobile && setIsPaused(true)}
          onMouseLeave={() => !isMobile && setIsPaused(false)}
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          <div className="flex">
            {extendedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
