import type React from "react"
import EnquiryForm from "./EnquiryForm"
import Map from "./Map"
import Header from "./Header"
import Footer from "./Footer"

const officeLocations = [
  {
    name: "Dubai Office",
    address: "Business Bay, Dubai, UAE",
    position: { lat: 25.1856, lng: 55.2743 },
  },
  {
    name: "Bangalore Office",
    address: "MG Road, Bangalore, India",
    position: { lat: 12.9759, lng: 77.6083 },
  },
  {
    name: "Mumbai Office",
    address: "Bandra Kurla Complex, Mumbai, India",
    position: { lat: 19.0689, lng: 72.861 },
  },
]

const ContactPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="pt-24 bg-brand-light">
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-serif font-bold text-brand-dark">Contact Our Offices</h1>
              <p className="text-brand-muted max-w-2xl mx-auto mt-4">
                We have a presence in key global markets to serve you better. Find our locations below or send us a
                message directly.
              </p>
            </div>

            <div className="mb-16">
              <Map locations={officeLocations} />
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center mb-20">
              {officeLocations.map((office) => (
                <div key={office.name}>
                  <h3 className="text-2xl font-serif font-bold text-brand-dark">{office.name}</h3>
                  <p className="text-brand-muted mt-2">{office.address}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 bg-brand-light">
          <div className="container mx-auto px-6">
            <EnquiryForm />
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

export default ContactPage
