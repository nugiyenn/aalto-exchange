"use client";

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useUniversityContext } from '../context/UniversityContext';
import { getCostTier } from '../lib/cost';

// Function to create color-coded icon
const createCustomIcon = (tier: number | null) => {
  let bgColor = '#64748b'; // slate-500 (default)
  
  if (tier === 1) bgColor = '#10b981'; // emerald-500
  if (tier === 2) bgColor = '#eab308'; // yellow-500
  if (tier === 3) bgColor = '#f97316'; // orange-500
  if (tier === 4) bgColor = '#f43f5e'; // rose-500

  return L.divIcon({
    html: `<div style="background-color: ${bgColor}; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 0 4px ${bgColor}40, 0 2px 4px rgba(0,0,0,0.3); transition: transform 0.2s ease-in-out;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></div>`,
    className: 'custom-marker-icon', // Removed default styling
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
    tooltipAnchor: [7, 0],
  });
};

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup 
        chunkedLoading 
        disableClusteringAtZoom={8} 
        maxClusterRadius={50}
        showCoverageOnHover={false}
      >
        {filteredUniversities.map((uni, idx) => {
          const lat = parseFloat(uni.latitude);
          const lng = parseFloat(uni.longitude);

          if (isNaN(lat) || isNaN(lng)) return null;

          // Determine marker color based on Cost Tier
          const countryName = uni.country_fullname || uni.country;
          const costTier = getCostTier(countryName || '', uni.universityname || '');
          const icon = createCustomIcon(costTier ? costTier.tier : null);

          return (
            <Marker
              key={`${uni.core_id}-${uni.relation_id || idx}`}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  // Optional: we don't auto-select yet unless required
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="!bg-white !text-slate-900 !border-slate-200 !shadow-md !rounded-md">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">{uni.universityname}</span>
                  {uni.qsRank && uni.qsRank !== 999 && (
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                      #{uni.qsRank}
                    </span>
                  )}
                </div>
              </Tooltip>
              <Popup className="text-slate-900 font-medium">
                <div className="flex flex-col gap-2 p-1 min-w-[200px]">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 leading-tight">
                      {uni.universityname}
                    </span>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">
                      {countryName}
                    </span>
                    {costTier && (
                      <span className="text-xs font-semibold mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: costTier.color }}></span>
                        {costTier.label}
                      </span>
                    )}
                  </div>
                  
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
      </MarkerClusterGroup>
    </MapContainer>
  );
}