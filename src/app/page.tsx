"use client";

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Search, ChevronDown, ChevronRight, ChevronLeft, Map as MapIcon, Dices, Info, MessageSquare, List as ListIcon, Heart } from 'lucide-react';
import { useUniversityContext } from '../context/UniversityContext';
import { UniversityCard } from '../components/UniversityCard';
import { UniversityDetails } from '../components/UniversityDetails';
import { CaseOpening } from '../components/CaseOpening';
import { AboutModal } from '../components/AboutModal';
import { ShortlistModal } from '../components/ShortlistModal';
import { DestinationDirectory } from '../components/DestinationDirectory';

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
    selectedRegion,
    setSelectedRegion,
    shortlist,
  } = useUniversityContext();

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sortMethod, setSortMethod] = useState<'country' | 'qs'>('country');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [rightPaneView, setRightPaneView] = useState<'map' | 'directory'>('map');

  // If a user selects a university on mobile, auto-switch to map view to show details
  React.useEffect(() => {
    if (selectedUniversityId) {
      setMobileView('map');
    } else {
      setMobileView('list');
    }
  }, [selectedUniversityId]);

  // Open shortlist automatically if URL has '?top=' on first render
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current && shortlist.length > 0) {
      setIsShortlistOpen(true);
      isFirstRender.current = false;
    }
  }, [shortlist]);

  // Clear selected country when search query changes to ensure users see filtered flat results if needed
  React.useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setSelectedCountry(null);
    }
  }, [searchQuery]);

  const handleFeelingLucky = () => {
    if (filteredUniversities.length === 0) return;
    setIsSpinning(true);
  };

  const handleCaseOpeningComplete = (winnerId: string) => {
    setIsSpinning(false);
    setSelectedUniversityId(winnerId);
    
    // Auto-select the country so it shows in the drill-down list
    const randomUni = filteredUniversities.find(u => u.core_id === winnerId);
    if (randomUni) {
      const country = randomUni.country_fullname || 'Other';
      setSelectedCountry(country);
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
          <Image src="/aalto-icon.jpg" alt="Aalto University" className="h-10 w-auto object-contain" width={40} height={40} />
          <span className="text-black">Aalto Exchange</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-500">
          <button 
            onClick={() => setIsShortlistOpen(true)} 
            className={`flex items-center gap-1.5 transition-colors ${shortlist.length > 0 ? 'text-rose-500 hover:text-rose-600 font-bold' : 'hover:text-slate-900'}`}
          >
            <Heart className={`w-4 h-4 ${shortlist.length > 0 ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Shortlist {shortlist.length > 0 && `(${shortlist.length}/3)`}</span>
          </button>

          <button 
            onClick={() => setIsAboutOpen(true)} 
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">About</span>
          </button>
          
          <a 
            href="mailto:mshpj51b4@mozmail.com" 
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Feedback</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar - Filters & University List */}
        <aside className={`w-full md:w-[420px] flex flex-col border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0 ${mobileView === 'list' ? 'flex z-20 absolute inset-0 md:relative' : 'hidden md:flex relative z-10'}`}>
          
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">School</label>
                <div className="relative">
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-slate-900 font-medium shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">All Schools</option>
                    <option value="1">CHEM</option>
                    <option value="2">SCI</option>
                    <option value="3">ENG</option>
                    <option value="4">ELEC</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Region</label>
                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-slate-900 font-medium shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">Anywhere</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Oceania">Oceania</option>
                    <option value="Africa">Africa</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              onClick={handleFeelingLucky}
              suppressHydrationWarning
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
            
            <div className="flex bg-slate-100 p-1 rounded-md mt-2">
              <button 
                onClick={() => setSortMethod('country')}
                className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-sm transition-all ${sortMethod === 'country' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Country
              </button>
              <button 
                onClick={() => setSortMethod('qs')}
                className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-sm transition-all ${sortMethod === 'qs' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                QS Rank
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
              selectedCountry && groupedUniversities[selectedCountry] ? (
                <div className="bg-white flex flex-col">
                  <div className="sticky top-0 bg-slate-100/95 backdrop-blur px-5 py-3 border-b border-slate-200 z-10 flex items-center gap-3 shadow-sm">
                    <button
                      onClick={() => setSelectedCountry(null)}
                      className="flex items-center justify-center p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-600 active:scale-95"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider truncate">{selectedCountry}</h3>
                      <p className="text-xs text-slate-500 font-medium">{groupedUniversities[selectedCountry].length} Destinations</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white">
                    {groupedUniversities[selectedCountry].map((uni, idx) => (
                      <UniversityCard 
                        key={`${uni.core_id}-${idx}`} 
                        university={uni} 
                        isSelected={selectedUniversityId === uni.core_id}
                        onClick={() => setSelectedUniversityId(uni.core_id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white">
                  {sortedCountries.map(country => (
                    <div 
                      key={country} 
                      className="border-b border-slate-200 flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors group"
                      onClick={() => setSelectedCountry(country)}
                    >
                      <span className="text-sm font-bold text-slate-700 uppercase tracking-wider group-hover:text-blue-700 transition-colors">{country}</span>
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                          {groupedUniversities[country].length}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )
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
        <section className={`flex-1 bg-slate-100 p-0 sm:p-6 overflow-hidden ${mobileView === 'map' ? 'flex absolute inset-0 z-20 sm:relative' : 'hidden sm:flex relative z-10'}`}>
          <div className="w-full h-full sm:rounded-2xl shadow-sm sm:border border-slate-200 bg-white overflow-hidden relative">
            {selectedUniversityId ? (
              <UniversityDetails />
            ) : (
              <>
                <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-md flex p-1 border border-slate-200">
                  <button 
                    onClick={() => setRightPaneView('map')} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${rightPaneView === 'map' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <MapIcon className="w-4 h-4" />
                    Map View
                  </button>
                  <button 
                    onClick={() => setRightPaneView('directory')} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${rightPaneView === 'directory' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <ListIcon className="w-4 h-4" />
                    Directory
                  </button>
                </div>
                {rightPaneView === 'map' ? <DynamicMap /> : <DestinationDirectory />}
              </>
            )}
          </div>
        </section>

        {/* Mobile Toggle Button */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
          <button
            onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white shadow-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95"
          >
            {mobileView === 'list' ? (
              <>
                <MapIcon className="w-4 h-4" />
                Show Map
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Show List
              </>
            )}
          </button>
        </div>

      </main>

      {/* Case Opening Overlay */}
      {isSpinning && (
        <CaseOpening 
          universities={filteredUniversities} 
          onComplete={handleCaseOpeningComplete}
          onClose={() => setIsSpinning(false)}
        />
      )}

      {/* About / Disclaimer Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Shortlist Modal */}
      <ShortlistModal isOpen={isShortlistOpen} onClose={() => setIsShortlistOpen(false)} />
    </div>
  );
}
