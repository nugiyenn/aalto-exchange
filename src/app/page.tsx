"use client";

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, ChevronDown, ChevronRight, Map as MapIcon, Dices } from 'lucide-react';
import { useUniversityContext } from '../context/UniversityContext';
import { UniversityCard } from '../components/UniversityCard';
import { UniversityDetails } from '../components/UniversityDetails';
import { CaseOpening } from '../components/CaseOpening';

// Dynamically import the big map component with ssr: false to prevent Next.js hydration errors
const DynamicMap = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4 opacity-50 z-10">
      <MapIcon className="w-16 h-16 text-slate-300 animate-pulse" />
      <p className="text-sm font-medium tracking-wide animate-pulse">Initializing map...</p>
    </div>
  ),
});

export default function Dashboard() {
  const { 
    filteredUniversities, 
    isLoading, 
    searchQuery, 
    setSearchQuery,
    selectedUniversityId,
    setSelectedUniversityId,
    selectedSchool,
    setSelectedSchool,
  } = useUniversityContext();

  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [sortMethod, setSortMethod] = useState<'country' | 'qs'>('country');

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => ({
      ...prev,
      [country]: !prev[country]
    }));
  };

  const handleFeelingLucky = () => {
    if (filteredUniversities.length === 0) return;
    setIsSpinning(true);
  };

  const handleCaseOpeningComplete = (winnerId: string) => {
    setIsSpinning(false);
    setSelectedUniversityId(winnerId);
    
    // Auto-expand the country accordion so it shows in the list
    const randomUni = filteredUniversities.find(u => u.core_id === winnerId);
    if (randomUni) {
      const country = randomUni.country_fullname || 'Other';
      setExpandedCountries(prev => ({ ...prev, [country]: true }));
    }
  };

  const groupedUniversities = useMemo(() => {
    const grouped = filteredUniversities.reduce((acc, uni) => {
      const country = uni.country_fullname || 'Other';
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(uni);
      return acc;
    }, {} as Record<string, typeof filteredUniversities>);
    
    return grouped;
  }, [filteredUniversities]);

  const sortedCountries = useMemo(() => Object.keys(groupedUniversities).sort(), [groupedUniversities]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 text-slate-900 overflow-hidden font-sans">
      <div className="h-1 w-full bg-black z-30 shrink-0" />
      {/* Top Navigation / Control Bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0 bg-white z-20 shadow-sm">
        <div className="flex items-center gap-4 font-bold text-xl tracking-tight cursor-pointer" onClick={() => setSelectedUniversityId(null)}>
          <img src="/aalto-icon.jpg" alt="Aalto University" className="h-10 w-auto object-contain" />
          <span className="text-black">Aalto Exchange</span>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Global Discovery Dashboard
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Filters & University List */}
        <aside className="w-[420px] flex flex-col border-r border-slate-200 bg-white relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
          
          {/* Prominent Filters Area */}
          <div className="p-5 flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Universities, cities, or countries..." 
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-slate-900 placeholder-slate-400 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by School</label>
              <div className="relative">
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-slate-900 font-medium shadow-sm appearance-none cursor-pointer"
                >
                  <option value="">All Aalto Schools</option>
                  <option value="1">School of Chemical Engineering (CHEM)</option>
                  <option value="2">School of Science (SCI)</option>
                  <option value="3">School of Engineering (ENG)</option>
                  <option value="4">School of Electrical Engineering (ELEC)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleFeelingLucky}
              disabled={isLoading || filteredUniversities.length === 0}
              className="mt-2 w-full bg-slate-900 text-white rounded-lg py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              Feeling Lucky?
            </button>
          </div>

          {/* List Header */}
          <div className="px-5 py-3 border-b border-slate-200 flex flex-col gap-3 bg-white z-10 sticky top-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{isLoading ? 'Loading...' : `${filteredUniversities.length} Destinations Available`}</span>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-md">
              <button 
                onClick={() => setSortMethod('country')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-sm transition-all ${sortMethod === 'country' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Group by Country
              </button>
              <button 
                onClick={() => setSortMethod('qs')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-sm transition-all ${sortMethod === 'qs' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Top QS Ranked
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 relative">
            {isLoading ? (
              <div className="p-10 text-center text-slate-500 text-sm flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Fetching destinations...</span>
              </div>
            ) : filteredUniversities.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm bg-white m-4 rounded-xl border border-dashed border-slate-200">
                No universities match your current filters.
              </div>
            ) : sortMethod === 'country' ? (
              sortedCountries.map(country => {
                const isExpanded = searchQuery.trim().length > 0 || expandedCountries[country];
                
                return (
                  <div key={country} className="border-b border-slate-200">
                    <div 
                      className="sticky top-0 bg-slate-100/95 backdrop-blur px-5 py-3 text-xs font-bold text-slate-700 tracking-wider z-10 flex items-center justify-between cursor-pointer hover:bg-slate-200/50 transition-colors"
                      onClick={() => toggleCountry(country)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className="uppercase">{country}</span>
                      </div>
                      <span className="bg-white text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200 shadow-sm">
                        {groupedUniversities[country].length}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="bg-white">
                        {groupedUniversities[country].map((uni, idx) => (
                          <UniversityCard 
                            key={`${uni.core_id}-${idx}`} 
                            university={uni} 
                            isSelected={selectedUniversityId === uni.core_id}
                            onClick={() => setSelectedUniversityId(uni.core_id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white">
                {[...filteredUniversities].sort((a, b) => a.qsRank - b.qsRank).map((uni, idx) => (
                  <UniversityCard 
                    key={`${uni.core_id}-${idx}`} 
                    university={uni} 
                    isSelected={selectedUniversityId === uni.core_id}
                    onClick={() => setSelectedUniversityId(uni.core_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Details Profile or Big Map with floating padding */}
        <section className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-hidden">
          <div className="w-full h-full rounded-2xl shadow-sm border border-slate-200 bg-white overflow-hidden relative">
            {selectedUniversityId ? (
              <UniversityDetails />
            ) : (
              <DynamicMap />
            )}
          </div>
        </section>

      </main>

      {/* Case Opening Overlay */}
      {isSpinning && (
        <CaseOpening 
          universities={filteredUniversities} 
          onComplete={handleCaseOpeningComplete}
          onClose={() => setIsSpinning(false)}
        />
      )}
    </div>
  );
}
