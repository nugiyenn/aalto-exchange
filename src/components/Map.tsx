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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {filteredUniversities.map((uni, idx) => {
        const lat = parseFloat(uni.latitude);
        const lng = parseFloat(uni.longitude);

        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker
            key={`${uni.core_id}-${uni.relation_id || idx}`}
            position={[lat, lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                // Do not auto-select the university here anymore
              },
            }}
          >
            <Popup className="text-slate-900 font-medium">
              <div className="flex flex-col gap-2 p-1 min-w-[200px]">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-slate-800 leading-tight">
                    {uni.universityname}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5">
                    {uni.country_fullname || uni.country}
                  </span>
                </div>
                
                {uni.qsRank && uni.qsRank !== 999 && (
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold w-fit border border-amber-200">
                    QS Rank: #{uni.qsRank}
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUniversityId(uni.core_id);
                  }}
                  className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}