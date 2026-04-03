"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet inside Next.js
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MiniMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  if (isNaN(lat) || isNaN(lng)) {
    return <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">Location unknown</div>;
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={5}
      scrollWheelZoom={true}
      zoomControl={true}
      className="h-full w-full z-0 relative"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[lat, lng]} icon={customIcon}>
        <Popup className="text-slate-900 font-medium text-xs">
          {name}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
