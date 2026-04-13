"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSEO } from "./hooks/useSEO"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Partners from "./components/Partners"
import FeaturedProperties from "./components/FeaturedProperties"
import WhyChooseUs from "./components/WhyChooseUs"
import OurServices from "./components/OurServices"
import Testimonials from "./components/Testimonials"
import Footer from "./components/Footer"
import ContactPage from "./components/ContactPage"
import BlogPage from "./components/BlogPage"
import BlogPostPage from "./components/BlogPostPage"
import PartnerPortalPage from "./components/PartnerPortalPage"
import ProblemsAndSolutions from "./components/ProblemsAndSolutions"
import WhyInvest from "./components/WhyInvest"
import HowItWorks from "./components/HowItWorks"

// Helper for scroll animations
const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [node, setNode] = useState<HTMLElement | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntry(entry)
        if (node && observer.current) {
          observer.current.unobserve(node)
        }
      }
    }, options)

    const { current: currentObserver } = observer
    if (node) currentObserver.observe(node)

    return () => currentObserver.disconnect()
  }, [node, options])

  return [setNode, entry] as const
}

const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const [ref, entry] = useIntersectionObserver({ threshold: 0.1 })
  const isVisible = !!entry?.isIntersecting

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={`${className} ${isVisible ? "section-visible" : "section-hidden"}`}
    >
      {children}
    </div>
  )
}

// Page Components
const HomePage: React.FC = () => {
  useSEO("home")

  return (
    <>
      <Hero />
      <AnimatedSection>
        <ProblemsAndSolutions />
      </AnimatedSection>
      <AnimatedSection>
        <Partners />
      </AnimatedSection>
      <AnimatedSection>
        <FeaturedProperties />
      </AnimatedSection>
      <AnimatedSection>
        <OurServices />
      </AnimatedSection>
      <AnimatedSection>
        <WhyInvest />
      </AnimatedSection>
      <AnimatedSection>
        <HowItWorks />
      </AnimatedSection>
      <AnimatedSection>
        <WhyChooseUs />
      </AnimatedSection>
      <AnimatedSection>
        <Testimonials />
      </AnimatedSection>
    </>
  )
}

const AboutUsPage: React.FC = () => {
  useSEO("about")

  const Counter: React.FC<{ end: number; label: string; suffix?: string }> = ({ end, label, suffix = "+" }) => {
    const [count, setCount] = useState(0)
    const [ref, entry] = useIntersectionObserver({ threshold: 0.5 })
    const isVisible = !!entry?.isIntersecting

    useEffect(() => {
      if (isVisible) {
        const duration = 2000
        const frameRate = 1000 / 60
        const totalFrames = Math.round(duration / frameRate)
        let frame = 0

        const counter = setInterval(() => {
          frame++
          const progress = frame / totalFrames
          const currentCount = Math.round(end * progress)
          setCount(currentCount)

          if (frame === totalFrames) {
            clearInterval(counter)
            setCount(end)
          }
        }, frameRate)
        return () => clearInterval(counter)
      }
    }, [isVisible, end])

    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className="text-center">
        <p className="text-5xl md:text-6xl font-serif font-bold">About PropSarathi</p>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mt-4 text-gray-300">
          A specialised Real Estate Investment Portfolio Management Company, serving forward-thinking individuals across
          India and the globe.
        </p>
      </div>
    )
  }

  return (
    <div className="pt-24 bg-brand-light">
      <section className="relative py-20 md:py-32 bg-brand-primary text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url(https://picsum.photos/seed/about-bg/1920/1080)" }}
        ></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <AnimatedSection>
            <h1 className="text-5xl md:text-6xl font-serif font-bold">About PropSarathi</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mt-4 text-gray-300">
              A specialised Real Estate Investment Portfolio Management Company, serving forward-thinking individuals
              across India and the globe.
            </p>
          </AnimatedSection>
        </div>
      </section>
      <section className="py-20 bg-brand-light">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <AnimatedSection>
              <img
                src="https://picsum.photos/seed/dubai/800/600"
                alt="Dubai Skyline"
                className="rounded-lg shadow-2xl"
              />
            </AnimatedSection>
            <AnimatedSection>
              <h2 className="text-4xl font-serif font-bold text-brand-dark mb-4">Our Manifesto</h2>
              <p className="text-brand-muted mb-4">
                <strong>Wealth isn't just built—it's guided.</strong> At PropSarathi, we believe real estate isn't about
                merely acquiring property—it's about building a sustainable, future-proof financial ecosystem. Our goal
                is to guide you through strategic investments that not only generate returns but also align with your
                life goals.
              </p>
              <p className="text-brand-muted">
                We don't just show properties. <strong>We craft opportunities.</strong> We don't push inventory.{" "}
                <strong>We build trust.</strong> We don't aim for transactions.{" "}
                <strong>We deliver transformation.</strong>
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>
      <section className="py-20 bg-brand-bg-alt">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-4xl font-serif font-bold text-brand-dark mb-12">
            Our Track Record & Milestones
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter end={200} label="Cr in Assets Advised" />
            <Counter end={200} label="Clients Served" />
            <Counter end={8} label="Countries Served" suffix="" />
            <Counter end={30} label="Developer Partnerships" />
          </div>
        </div>
      </section>
    </div>
  )
}

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash)
      window.scrollTo(0, 0)
    }

    // Set initial route
    if (!window.location.hash) {
      window.location.hash = "#/"
    }
    setRoute(window.location.hash)

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const renderPage = () => {
    const blogPostRegex = /^#\/blog\/(\d+)$/
    const blogPostMatch = route.match(blogPostRegex)

    if (blogPostMatch) {
      const postId = Number.parseInt(blogPostMatch[1], 10)
      return <BlogPostPage postId={postId} />
    }

    switch (route) {
      case "#/about":
        return <AboutUsPage />
      case "#/contact":
        return <ContactPageWrapper />
      case "#/blog":
        return <BlogPageWrapper />
      case "#/partner":
        return <PartnerPortalPageWrapper />
      case "#/":
      default:
        return <HomePage />
    }
  }

  return (
    <>
      <Header />
      <main>{renderPage()}</main>
      <Footer />
    </>
  )
}

const ContactPageWrapper: React.FC = () => {
  useSEO("contact")
  return <ContactPage />
}

const BlogPageWrapper: React.FC = () => {
  useSEO("blog")
  return <BlogPage />
}

const PartnerPortalPageWrapper: React.FC = () => {
  useSEO("partner")
  return <PartnerPortalPage />
}

export default App
