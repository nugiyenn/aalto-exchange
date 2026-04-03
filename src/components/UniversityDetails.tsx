"use client";

import React, { useEffect, useState } from 'react';
import { useUniversityContext } from '../context/UniversityContext';
import { Trophy, MapPin, X, Globe2, BookOpen, AlertTriangle, FileText, ExternalLink, DownloadCloud, Navigation, Info, TrendingUp, Users } from 'lucide-react';
import techStats from '../data/tech-statistics.json';
import dynamic from 'next/dynamic';
import Fuse from 'fuse.js';

const DynamicMiniMap = dynamic<{ lat: number; lng: number; name: string }>(
  () => import('./MiniMap'), 
  { ssr: false }
);

const UNIVERSITY_ALIASES: Record<string, string> = {
  "Institute of Science Tokyo": "Tokyo Institute of Technology",
  "Ceské Vysoké Uceni Technické v Praze": "Czech Technical University (CTU) in Prague",
  "Vysoké Ucení Technické v Brne": "Brno University of Technology",
  "University of Chemistry and Technology, Prague": "Vysoká Skola Chemicko-Technologická v Praze (UCT Prague)",
  "IE Universidad": "IE Business School (Instituto de Empresa)",
  "Universitat Politècnica de València": "Universidad Politécnica de Valencia",
  "Texas A&M University": "Texas A & M University"
};

const normalizeName = (name: string) => {
  if (!name) return "";
  return name.replace(/[\u2010-\u2015\-]/g, '-')
             .replace(/['"“”]/g, "'")
             .replace(/\s+/g, " ")
             .toLowerCase();
};

export function UniversityDetails() {
  const { selectedUniversityId, setSelectedUniversityId, universities } = useUniversityContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [details, setDetails] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');

  const baseUni = universities.find((u) => u.core_id === selectedUniversityId);

  useEffect(() => {
    setActiveTab('overview');
  }, [selectedUniversityId]);

  useEffect(() => {
    if (!selectedUniversityId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const uni = universities.find(u => u.core_id === selectedUniversityId);
        if (!uni) return;

        const res = await fetch('/api/fetch-uni-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coreId: uni.core_id, relationId: uni.relation_id }),
        });
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error('Failed to fetch uni details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedUniversityId, universities]);

  if (!selectedUniversityId || !baseUni) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
        <Globe2 className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-500">Select a university to view details</p>
      </div>
    );
  }

  // Find matching tech stats if available
  // Direct match or partial match
  const getTechStat = () => {
    if (!baseUni) return null;
    
    // Check if we have an alias for this university name, else use the default
    const originalName = baseUni.universityname;
    const rawSearchName = UNIVERSITY_ALIASES[originalName] || originalName;
    const searchName = normalizeName(rawSearchName);
    
    // First, try exact or simple inclusion
    const match = techStats.find(stat => {
      const statName = normalizeName(stat.university_name);
      return searchName.includes(statName) || statName.includes(searchName);
    });

    if (match) return match;

    // Fallback to fuzzy matching if exact inclusion fails
    const fuse = new Fuse(techStats, {
      keys: ['university_name', 'original_name'],
      threshold: 0.15, // tightened to avoid false positive matches like 'Institute of Science'
      ignoreLocation: true,
      minMatchCharLength: 5,
    });

    const results = fuse.search(rawSearchName);
    if (results.length > 0) {
      return results[0].item;
    }

    return null;
  };

  const techStat = getTechStat() || {
    applicants_1st: '-',
    applicants_2nd: '-',
    applicants_3rd: '-',
    applicants_total: '-',
    index_2025: '-',
    index_2024: '-',
    index_2023: '-',
    index_2022: '-'
  };

  // Parse details map
  const info = details?.details || {};
  const reportsCount = (details?.travelReports?.length || 0) + (details?.attachments?.length || 0);

  const shortFacts: {key: string, value: string}[] = [];
  const longSections: {key: string, value: string}[] = [];

  Object.entries(info).forEach(([key, value]) => {
    if (
      ['In brief', 'Data protection', 'Language of Instruction', 'Study level', 'Places available', 'Open for applications (active)'].includes(key)
    ) {
      return;
    }
    // Skip empty values or 'null' strings
    if (!value || typeof value !== 'string' || value.trim() === '' || value === 'null') {
      return;
    }

    const stripped = value.replace(/<[^>]+>/g, '').trim();
    // If it's short and has no complex HTML (like lists or multiple paragraphs)
    if (stripped.length < 150 && !value.includes('</li>') && !value.includes('</p><p>')) {
      shortFacts.push({ key, value });
    } else {
      longSections.push({ key, value });
    }
  });

  return (
    <div className="h-full w-full bg-white flex flex-col relative shadow-inner overflow-hidden">
      
      {/* Header Banner */}
      <div className="shrink-0 bg-white relative">
        <button 
          onClick={() => setSelectedUniversityId(null)}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">
              {baseUni.country}
            </span>
            {baseUni.qsRank !== 999 && (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">
                <Trophy className="w-3 h-3 text-amber-500" />
                QS Rank #{baseUni.qsRank}
              </span>
            )}
            {info['Open for applications (active)'] && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${info['Open for applications (active)'].includes('Active') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                {info['Open for applications (active)']}
              </span>
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2 pr-12">
            {baseUni.universityname}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <MapPin className="w-4 h-4 text-rose-400" />
            {baseUni.country_fullname}
          </div>
        </div>

        {/* Navigation Tabs */}
        {!loading && (
          <div className="flex border-b border-slate-200 px-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reports' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              Travel Reports & Documents
              {reportsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'reports' ? 'bg-black text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {reportsCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        {loading ? (
          <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-200 rounded-xl h-64 w-full"></div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2 mt-4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2 mt-4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-4xl mx-auto space-y-8">
            
            {activeTab === 'overview' && (
              <>
            {/* High Level Map & Quick Facts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-64 relative">
                 <DynamicMiniMap lat={parseFloat(baseUni.latitude)} lng={parseFloat(baseUni.longitude)} name={baseUni.universityname} />
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center space-y-4">
                 {info['Language of Instruction'] && (
                   <div>
                     <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Language of Instruction</p>
                     <p className="text-sm text-slate-800 font-medium">{info['Language of Instruction']}</p>
                   </div>
                 )}
                 {info['Study level'] && (
                   <div>
                     <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Study Level</p>
                     <p className="text-sm text-slate-800 font-medium">{info['Study level'].replace(/\|\|/g, ', ')}</p>
                   </div>
                 )}
                 {info['Places available'] && (
                   <div>
                     <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Places Available</p>
                     <p className="text-sm text-slate-800 font-medium">{info['Places available']}</p>
                   </div>
                 )}
              </div>
            </div>

            {/* Historical Tech Stats */}
            {techStat && (
              <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Historical Tech Applications (AY2022-2025)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Applicant Breakdown (AY2025)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                        <span className="text-sm text-indigo-700">1st Choice</span>
                        <span className="font-bold text-indigo-900">{techStat.applicants_1st}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                        <span className="text-sm text-indigo-700">2nd Choice</span>
                        <span className="font-bold text-indigo-900">{techStat.applicants_2nd}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                        <span className="text-sm text-indigo-700">3rd Choice</span>
                        <span className="font-bold text-indigo-900">{techStat.applicants_3rd}</span>
                      </div>
                      <div className="flex justify-between items-center bg-indigo-100 px-3 py-2 rounded-lg border border-indigo-200">
                        <span className="text-sm font-bold text-indigo-800">Total Applicants</span>
                        <span className="font-bold text-indigo-900">{techStat.applicants_total}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-indigo-400" />
                      Lowest Accepted Academic Index
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-indigo-600 font-medium mb-1">AY2025</p>
                        <p className="font-bold text-indigo-900 text-lg">{techStat.index_2025 !== '-' ? techStat.index_2025 : 'N/A'}</p>
                      </div>
                      <div className="bg-white/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-indigo-600 font-medium mb-1">AY2024</p>
                        <p className="font-bold text-indigo-900 text-lg">{techStat.index_2024 !== '-' ? techStat.index_2024 : 'N/A'}</p>
                      </div>
                      <div className="bg-white/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-indigo-600 font-medium mb-1">AY2023</p>
                        <p className="font-bold text-indigo-900 text-lg">{techStat.index_2023 !== '-' ? techStat.index_2023 : 'N/A'}</p>
                      </div>
                      <div className="bg-white/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-indigo-600 font-medium mb-1">AY2022</p>
                        <p className="font-bold text-indigo-900 text-lg">{techStat.index_2022 !== '-' ? techStat.index_2022 : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* In Brief / Description */}
            {info['In brief'] && (
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-blue-500" />
                  In brief
                </h3>
                <div className="prose prose-sm prose-slate max-w-none text-slate-600 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800" dangerouslySetInnerHTML={{ __html: info['In brief'] }} />
              </section>
            )}

                {/* Dynamic Additional Sections */}
            {shortFacts.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-500" />
                  Quick Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shortFacts.map(({ key, value }) => (
                    <div key={key}>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{key}</p>
                      <div className="text-sm text-slate-800 font-medium [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 break-words" dangerouslySetInnerHTML={{ __html: value.replace(/\|\|/g, ', ') }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {longSections.map(({ key, value }) => (
              <section key={key} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  {key}
                </h3>
                <div className="prose prose-sm prose-slate max-w-none text-slate-600 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800" dangerouslySetInnerHTML={{ __html: value.replace(/\|\|/g, '<br />') }} />
              </section>
            ))}

            {/* Data Protection Warning */}
                {info['Data protection'] && (
                  <section className="bg-amber-50 rounded-xl border border-amber-200 p-5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800" dangerouslySetInnerHTML={{ __html: info['Data protection'] }} />
                  </section>
                )}
              </>
            )}

            {/* Travel Reports Tab Content */}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <DownloadCloud className="w-6 h-6 text-blue-500" />
                      Student Travel Reports & Documents
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Read first-hand experiences from Aalto students who previously exchanged here.
                    </p>
                  </div>
                </div>
                
                {reportsCount > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-indigo-100 p-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 p-2 rounded-lg shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-purple-900 flex items-center gap-2 mb-1">
                          AI Summary
                          <span className="bg-purple-200 text-purple-700 text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">Coming Soon</span>
                        </h4>
                      </div>
                    </div>
                  </div>
                )}

                {reportsCount === 0 ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <FileText className="w-12 h-12 text-slate-200 mb-3" />
                    <p>No travel reports or documents available for this destination.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {details?.travelReports?.map((report: Record<string, unknown>) => (
                      <a
                        key={report.id as string}
                        href={`/api/fetch-pdf?fileId=${report.id as string}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 hover:bg-sky-50 transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 group-hover:text-sky-700">{report.title as string}</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Navigation className="w-3.5 h-3.5 text-sky-500" />
                            <span className="text-xs font-medium text-sky-600">Travel Report</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-full text-slate-300 group-hover:text-sky-600 group-hover:bg-sky-100 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                      </a>
                    ))}
                    
                    {details?.attachments?.map((doc: Record<string, unknown>) => (
                      <a
                        key={doc.id as string}
                        href={`/api/fetch-pdf?fileId=${doc.id as string}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 hover:bg-emerald-50 transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 group-hover:text-emerald-700">{doc.title as string}</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">Fact Sheet / Info</span>
                          </div>
                        </div>
                        <div className="p-2 rounded-full text-slate-300 group-hover:text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
