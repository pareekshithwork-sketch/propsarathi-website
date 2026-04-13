"use client"

import { useState } from "react"
import { CheckCircle, Search, FileCheck, TrendingUp } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "CONSULT",
    description:
      "We decode your goals, budget, and risk appetite—then match you with properties that actually make sense for YOUR wealth plan.",
    icon: Search,
    color: "primary", // Changed to primary (purple)
  },
  {
    number: "02",
    title: "CURATE",
    description:
      "No spam. No irrelevant listings. Just hand-picked properties with proven ROI potential and verified developers.",
    icon: CheckCircle,
    color: "secondary", // Changed to secondary (orange)
  },
  {
    number: "03",
    title: "EXECUTE",
    description:
      "From site visits to paperwork nightmares—we handle everything so you can focus on what matters: growing your wealth.",
    icon: FileCheck,
    color: "primary", // Changed to primary
  },
  {
    number: "04",
    title: "GROW",
    description:
      "Your investment doesn't end at purchase. We help with leasing, resale timing, and portfolio optimization for maximum returns.",
    icon: TrendingUp,
    color: "secondary", // Changed to secondary
  },
]

interface HowItWorksProps {
  openEnquiryForm?: () => void
}

export default function HowItWorks({ openEnquiryForm }: HowItWorksProps = {}) {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const handleEnquireClick = () => {
    if (openEnquiryForm) {
      openEnquiryForm()
    } else {
      const enquireButton = document.querySelector('[aria-label="Enquire Now"]') as HTMLButtonElement
      if (enquireButton) {
        enquireButton.click()
      }
    }
  }

  return (
    <section
      id="how-it-works"
      className="py-12 md:py-16 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(74, 43, 124, 0.05)), url('/luxury-dubai-skyscrapers-modern-architecture.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30 mix-blend-multiply" />

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(74, 43, 124, 0.1) 10px, rgba(74, 43, 124, 0.1) 20px)`,
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
            From Confusion to Clarity in 4 Simple Steps
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            No guesswork. No hidden surprises. Just a proven system that's helped 200+ investors build wealth through
            real estate.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = activeStep === index

            return (
              <div
                key={index}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  isActive ? "scale-105" : "hover:scale-105"
                }`}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
                onClick={() => setActiveStep(activeStep === index ? null : index)}
              >
                {/* Card */}
                <div
                  className={`relative bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg transition-all duration-500 border-2 ${
                    isActive
                      ? step.color === "primary"
                        ? "border-primary shadow-2xl"
                        : "border-secondary shadow-2xl"
                      : "border-transparent hover:border-primary/20"
                  }`}
                >
                  {/* Step Number */}
                  <div
                    className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${step.color === "primary" ? "bg-primary" : "bg-secondary"} flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform duration-500 ${
                      isActive ? "rotate-12 scale-110" : "group-hover:rotate-12 group-hover:scale-110"
                    }`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl ${step.color === "primary" ? "bg-primary" : "bg-secondary"} flex items-center justify-center mb-6 transition-all duration-500 ${
                      isActive ? "scale-110 rotate-6" : "group-hover:scale-110 group-hover:rotate-6"
                    }`}
                  >
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{step.description}</p>

                  {/* Animated Border */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 ${step.color === "primary" ? "bg-primary" : "bg-secondary"} transition-all duration-500 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </div>

                {/* Connector Line (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <div className="inline-block bg-white/90 backdrop-blur-md rounded-2xl px-8 py-6 shadow-xl">
            <p className="text-base md:text-lg text-gray-900 font-semibold mb-6">
              Ready to stop overthinking and start investing?
            </p>
            <button
              onClick={handleEnquireClick}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-semibold text-base md:text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
            >
              Get Your Free Investment Roadmap
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
