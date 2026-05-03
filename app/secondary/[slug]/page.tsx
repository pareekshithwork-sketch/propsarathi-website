import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import sql from '@/lib/db'
import Header from '@/components/Header'
import SharedFooter from '@/components/SharedFooter'

function formatPrice(price: number, currency: string): string {
  if (!price || price <= 0) return 'Price on Request'
  if (currency === 'AED') return `AED ${Number(price).toLocaleString('en-AE')}`
  const val = Number(price)
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`
  return `₹${val.toLocaleString('en-IN')}`
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const [listing] = await sql`
    SELECT seo_title, seo_description FROM crm_listings
    WHERE slug = ${slug} AND is_live = TRUE LIMIT 1
  `
  if (!listing) return { title: 'Property Not Found | PropSarathi' }
  return {
    title: listing.seo_title || 'Property for Sale | PropSarathi',
    description: listing.seo_description || 'Resale property listed on PropSarathi.',
    openGraph: {
      title: listing.seo_title || 'Property for Sale | PropSarathi',
      description: listing.seo_description || '',
    },
  }
}

export default async function SecondaryListingPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const [listing] = await sql`
    SELECT ls.*, l.name AS lead_name
    FROM crm_listings ls
    JOIN crm_leads_v2 l ON l.lead_id = ls.lead_id
    WHERE ls.slug = ${slug} AND ls.is_live = TRUE
    LIMIT 1
  `

  if (!listing) notFound()

  const images: string[] = Array.isArray(listing.images) ? listing.images : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-gray-600">Properties</Link>
          <span>/</span>
          <span className="text-gray-600">Resale</span>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — images + details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image gallery */}
            {images.length > 0 ? (
              <div className="rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={images[0]}
                  alt={listing.title}
                  className="w-full h-64 sm:h-80 object-cover"
                />
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 p-1">
                    {images.slice(1, 5).map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-100 h-64 flex items-center justify-center">
                <p className="text-gray-300 text-sm">No photos yet</p>
              </div>
            )}

            {/* Key details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                  {(listing.locality || listing.city) && (
                    <p className="text-gray-500 text-sm mt-1">
                      📍 {[listing.locality, listing.city].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-[#422D83]">{formatPrice(listing.asking_price, listing.currency)}</p>
                  {listing.area_sqft > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{Number(listing.area_sqft).toLocaleString()} sqft</p>
                  )}
                </div>
              </div>

              {/* Property specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
                {listing.property_type && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{listing.property_type}</p>
                  </div>
                )}
                {listing.bedrooms > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Bedrooms</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{listing.bedrooms} BHK</p>
                  </div>
                )}
                {listing.bathrooms > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Bathrooms</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{listing.bathrooms}</p>
                  </div>
                )}
                {listing.possession_status && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Possession</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{listing.possession_status}</p>
                  </div>
                )}
              </div>

              {/* Address */}
              {listing.address && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-1">Address</p>
                  <p className="text-sm text-gray-700">{listing.address}</p>
                </div>
              )}

              {/* Seller notes */}
              {listing.seller_notes && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-1">About this property</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{listing.seller_notes}</p>
                </div>
              )}
            </div>

            {/* Verified badge */}
            {listing.rm_verified && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-blue-600 text-base">✓</span>
                <div>
                  <p className="text-xs font-semibold text-blue-800">PropSarathi Verified</p>
                  <p className="text-xs text-blue-600">Our team has visited and verified this property.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right — contact card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
              <p className="text-sm font-bold text-gray-900 mb-1">Interested in this property?</p>
              <p className="text-xs text-gray-500 mb-4">Contact PropSarathi to schedule a viewing.</p>

              <Link
                href="/contact"
                className="block w-full text-center bg-[#422D83] text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#2d1a60] transition mb-3"
              >
                Contact Us
              </Link>

              <a
                href="https://wa.me/919880000000"
                target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-green-600 transition"
              >
                WhatsApp Us
              </a>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Listed on PropSarathi · Resale Market
                </p>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-[#422D83]/5 rounded-2xl border border-[#422D83]/10 p-4">
              <p className="text-xs font-bold text-[#422D83] mb-2">LISTING SUMMARY</p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Price</dt>
                  <dd className="font-semibold text-gray-800">{formatPrice(listing.asking_price, listing.currency)}</dd>
                </div>
                {listing.area_sqft > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Area</dt>
                    <dd className="font-semibold text-gray-800">{Number(listing.area_sqft).toLocaleString()} sqft</dd>
                  </div>
                )}
                {listing.floor_number > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Floor</dt>
                    <dd className="font-semibold text-gray-800">{listing.floor_number}{listing.total_floors > 0 ? ` / ${listing.total_floors}` : ''}</dd>
                  </div>
                )}
                {listing.city && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">City</dt>
                    <dd className="font-semibold text-gray-800">{listing.city}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>

      <SharedFooter />
    </div>
  )
}
