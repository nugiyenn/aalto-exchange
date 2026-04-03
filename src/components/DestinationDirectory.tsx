"use client";

import React, { useMemo } from 'react';
import { useUniversityContext } from '../context/UniversityContext';
import { getContinent } from '../lib/continents';
import { University } from '../types/university';

export function DestinationDirectory() {
  const { filteredUniversities, setSelectedUniversityId } = useUniversityContext();

  const directory = useMemo(() => {
    const tree: Record<string, Record<string, University[]>> = {};

    filteredUniversities.forEach((uni) => {
      const country = uni.country_fullname || uni.country;
      const continent = getContinent(country);

      if (!tree[continent]) tree[continent] = {};
      if (!tree[continent][country]) tree[continent][country] = [];

      tree[continent][country].push(uni);
    });

    // Sort universities within countries
    Object.values(tree).forEach((countries) => {
      Object.values(countries).forEach((unis) => {
        unis.sort((a, b) => a.universityname.localeCompare(b.universityname));
      });
    });

    return tree;
  }, [filteredUniversities]);

  const sortedContinents = Object.keys(directory).sort();

  return (
    <div className="h-full w-full bg-slate-50 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Destinations Directory</h2>
        
        <div className="space-y-12">
          {sortedContinents.map((continent) => (
            <div key={continent} className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2">{continent}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {Object.keys(directory[continent]).sort().map((country) => (
                  <div key={country} className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                      {country}
                      <span className="text-xs font-medium bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                        {directory[continent][country].length}
                      </span>
                    </h4>
                    <ul className="space-y-1">
                      {directory[continent][country].map((uni) => (
                        <li key={uni.core_id}>
                          <button
                            onClick={() => setSelectedUniversityId(uni.core_id)}
                            className="text-sm text-slate-600 hover:text-blue-600 hover:underline text-left text-balance transition-colors"
                          >
                            {uni.universityname}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {sortedContinents.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No destinations match your current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
