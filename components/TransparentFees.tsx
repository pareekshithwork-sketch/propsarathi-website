"use client"

import { CheckCircle, Shield, Sparkles } from "lucide-react"
import { useState } from "react"

const feeModels = [
  {
    title: "Primary Sales (From Developer)",
    description: "Zero charges from you. We're paid by the developer, without increasing your cost.",
    icon: Sparkles,
    highlight: "0% Fee",
    color: "primary", // Changed from "emerald" to "primary" (purple)
  },
  {
    title: "Resale, Leasing, Rentals",
    description: "Our standard industry fee is only charged after successful delivery of the service.",
    icon: Shield,
    highlight: "Post-Delivery",
    color: "secondary", // Changed from "blue" to "secondary" (orange)
  },
]

export default function TransparentFees() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
            Transparent Fee Model
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            No hidden charges. No surprises. Just honest, value-driven service.
          </p>
        </div>

        {/* Fee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-12">
          {feeModels.map((model, index) => {
            const Icon = model.icon
            const isHovered = hoveredIndex === index

            return (
              <div
                key={index}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  isHovered ? "scale-105" : "hover:scale-105"
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(hoveredIndex === index ? null : index)}
              >
                <div
                  className={`relative ${
                    model.color === "primary"
                      ? "bg-gradient-to-br from-primary/10 to-primary/5"
                      : "bg-gradient-to-br from-secondary/10 to-secondary/5"
                  } rounded-2xl p-8 md:p-10 shadow-lg transition-all duration-500 border-2 ${
                    isHovered
                      ? model.color === "primary"
                        ? "border-primary shadow-2xl"
                        : "border-secondary shadow-2xl"
                      : "border-transparent"
                  } overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon & Highlight */}
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`w-16 h-16 rounded-xl ${
                          model.color === "primary" ? "bg-primary" : "bg-secondary"
                        } flex items-center justify-center transition-transform duration-500 ${
                          isHovered ? "rotate-12 scale-110" : "group-hover:rotate-12 group-hover:scale-110"
                        }`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          model.color === "primary" ? "bg-primary text-white" : "bg-secondary text-white"
                        } shadow-lg`}
                      >
                        {model.highlight}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{model.title}</h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">{model.description}</p>
                  </div>

                  {/* Animated Border */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 ${
                      model.color === "primary" ? "bg-primary" : "bg-secondary"
                    } transition-all duration-500 ${isHovered ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Key Points */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-50 to-primary/5 rounded-2xl p-8 md:p-10 shadow-lg border border-gray-200">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">Our Promise to You</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["No upfront commitments", "No hidden brokerage", "Pay only when value is delivered"].map(
                (point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 group cursor-pointer transition-transform duration-300 hover:scale-105"
                  >
                    <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover:rotate-12" />
                    <p className="text-sm md:text-base text-gray-700 font-medium">{point}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
