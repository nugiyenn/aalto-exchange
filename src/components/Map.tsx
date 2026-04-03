"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUniversityContext } from '../context/UniversityContext';

const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Map() {
  const { filteredUniversities, setSelectedUniversityId } = useUniversityContext();

  return (
    <MapContainer
      center={[35, 0]}
      zoom={2}
      scrollWheelZoom={true}
      className="h-full w-full bg-sky-50 z-0 relative"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {filteredUniversities.map((uni) => {
        const lat = parseFloat(uni.latitude);
        const lng = parseFloat(uni.longitude);

        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker
            key={uni.core_id}
            position={[lat, lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                setSelectedUniversityId(uni.core_id);
              },
            }}
          >
            <Popup className="text-slate-900 font-medium text-xs">
              {uni.universityname}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
