"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, TrendingUp, Shield, Clock, Target } from "lucide-react"

const problems = [
  {
    icon: AlertCircle,
    problem: "Overwhelmed by Too Many Options",
    pain: "You're bombarded with property listings, but which one actually fits YOUR goals? Analysis paralysis is costing you opportunities.",
    solution:
      "We curate only properties that match your budget, risk appetite, and ROI expectations—saving you months of research.",
    color: "primary", // Changed to primary (purple)
  },
  {
    icon: Clock,
    problem: "Hidden Costs & Surprise Fees",
    pain: "You thought you budgeted correctly, then BAM—registration fees, maintenance charges, and 'processing fees' you never saw coming.",
    solution:
      "100% transparent pricing. We break down every single cost upfront—no surprises, no fine print, no regrets.",
    color: "secondary", // Changed to secondary (orange)
  },
  {
    icon: Shield,
    problem: "Fear of Getting Scammed",
    pain: "How do you know the builder is legit? What if the property doesn't exist? What if you lose your hard-earned money?",
    solution:
      "We only work with RERA-compliant, verified developers with proven track records. Your investment is protected.",
    color: "primary", // Changed to primary
  },
  {
    icon: Target,
    problem: "No Clear Exit Strategy",
    pain: "You buy a property... then what? How do you rent it? When should you sell? Who manages it while you're away?",
    solution:
      "End-to-end support: from leasing to resale to portfolio rebalancing. We're with you for the entire journey.",
    color: "secondary", // Changed to secondary
  },
  {
    icon: TrendingUp,
    problem: "Missing Out on High-Growth Markets",
    pain: "While you're stuck analyzing, others are locking in pre-launch deals in Dubai & Bangalore's fastest-growing areas.",
    solution:
      "Exclusive access to off-market properties and pre-launch inventory with developer benefits you can't find online.",
    color: "primary", // Changed to primary
  },
  {
    icon: CheckCircle2,
    problem: "Complicated Legal & Documentation",
    pain: "Paperwork nightmares. Legal jargon. Endless back-and-forth. One mistake could cost you lakhs.",
    solution:
      "We handle all documentation, legal compliance, and registration—so you can focus on growing your wealth.",
    color: "secondary", // Changed to secondary
  },
]

export default function ProblemsAndSolutions() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 mix-blend-multiply" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-semibold mb-4">
            The Real Estate Reality Check
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Tired of These Real Estate Nightmares?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            You're not alone. These are the exact problems that keep investors awake at night—and exactly what we solve.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {problems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeIndex === index

            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 ${
                  isActive
                    ? item.color === "primary"
                      ? "border-primary scale-105"
                      : "border-secondary scale-105"
                    : "border-transparent hover:border-primary/20"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl ${item.color === "primary" ? "bg-primary" : "bg-secondary"} flex items-center justify-center mb-6 transition-all duration-500 ${
                    isActive ? "scale-110 rotate-6" : "group-hover:scale-110 group-hover:rotate-6"
                  }`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Problem */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.problem}</h3>
                <p className="text-sm text-red-600 font-medium mb-4 italic">"{item.pain}"</p>

                {/* Solution (appears on hover/active) */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-4 border-t-2 border-secondary/20">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-secondary">Our Solution:</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.solution}</p>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div
                  className={`absolute bottom-0 left-0 h-1 ${item.color === "primary" ? "bg-primary" : "bg-secondary"} transition-all duration-500 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-primary rounded-3xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Invest Without the Headaches?</h3>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Join 200+ smart investors who chose clarity over confusion. Get your personalized investment roadmap today.
          </p>
          <button
            onClick={() => {
              const enquireButton = document.querySelector('[aria-label="Enquire Now"]') as HTMLButtonElement
              if (enquireButton) enquireButton.click()
            }}
            className="inline-flex items-center gap-3 bg-white text-primary px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Your Free Consultation
            <TrendingUp className="w-6 h-6" />
          </button>
          <p className="text-sm mt-4 opacity-80">No obligations. No spam. Just honest advice.</p>
        </div>
      </div>
    </section>
  )
}
