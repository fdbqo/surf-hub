"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

interface MapProps {
  location: [number, number]
  name: string
  description: string
}

const Map = ({ location, name, description }: MapProps) => {
  const customIcon = L.divIcon({
    html: `<div class="custom-icon">
    <svg viewBox="0 0 24 36" width="24" height="36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 10.496 12 24 12 24s12-13.504 12-24C24 5.373 18.627 0 12 0zm0 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" />
    </svg>
  </div>`,
    className: "custom-icon-wrapper",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })

  return (
    <MapContainer center={location} zoom={14} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={location} icon={customIcon}>
        <Popup>
          <strong>{name}</strong>
          <br />
          {description}
        </Popup>
      </Marker>
    </MapContainer>
  )
}

// reworking map, this is currently unused

export default Map

