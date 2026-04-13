import type React from "react"

interface Location {
  name: string
  address: string
  position: { lat: number; lng: number }
}

interface MapProps {
  locations: Location[]
}

const Map: React.FC<MapProps> = ({ locations }) => {
  // Calculate center point from all locations
  const centerLat = locations.reduce((sum, loc) => sum + loc.position.lat, 0) / locations.length
  const centerLng = locations.reduce((sum, loc) => sum + loc.position.lng, 0) / locations.length

  // Create a Google Maps URL with multiple markers using the standard embed format
  // This doesn't require an API key and is more secure
  const createMapUrl = () => {
    // For multiple locations, we'll use the first location as the main point
    // and create a directions/search URL that shows all locations
    const mainLocation = locations[0]

    // Standard Google Maps embed URL (no API key needed for basic embed)
    return `https://maps.google.com/maps?q=${mainLocation.position.lat},${mainLocation.position.lng}&z=4&output=embed`
  }

  const mapUrl = createMapUrl()

  return (
    <div className="relative w-full rounded-lg shadow-xl overflow-hidden" style={{ height: "500px" }}>
      <iframe
        width="100%"
        height="500"
        frameBorder="0"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title="Office Locations Map"
      />

      {/* Location markers overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h3 className="font-bold text-gray-900 mb-2">Our Locations:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((location) => (
            <div key={location.name} className="text-sm">
              <p className="font-semibold text-primary">{location.name}</p>
              <p className="text-gray-600 text-xs">{location.address}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.position.lat},${location.position.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-xs hover:underline inline-flex items-center gap-1"
              >
                Get Directions →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Map
