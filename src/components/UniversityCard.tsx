import React from 'react';
import { University } from '../types/university';
import { MapPin, Trophy, Wallet } from 'lucide-react';
import { getCostTier } from '../lib/cost';

interface UniversityCardProps {
  university: University;
  isSelected?: boolean;
  onClick?: () => void;
}

export function UniversityCard({ university, isSelected = false, onClick }: UniversityCardProps) {
  const { universityname, country, qsRank, studyOpportunity, country_fullname } = university;
  
  const cName = country_fullname || country;
  const costTier = getCostTier(cName, universityname);
  
  // Format study opportunity (e.g., "Erasmus: Universiteit Twente - SCI (IEM)" -> "Erasmus: SCI (IEM)")
  const formatStudyOpp = (opp: string | null, uniName: string) => {
    if (!opp) return null;
    const escapedName = uniName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let cleaned = opp.replace(new RegExp(escapedName, 'i'), '')
                     .replace(/\s*-\s*-?\s*/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();
    if (cleaned.startsWith(':')) cleaned = cleaned.substring(1).trim();
    if (cleaned.startsWith('-')) cleaned = cleaned.substring(1).trim();
    if (cleaned.endsWith(':')) cleaned = cleaned.substring(0, cleaned.length - 1).trim();
    return cleaned || opp;
  };

  const formattedOpp = formatStudyOpp(studyOpportunity, universityname);

  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer transition-all duration-200 border-b border-slate-200
        hover:bg-white/90 
        ${isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600 shadow-sm' : 'bg-slate-50 border-l-4 border-l-transparent'}
      `}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm leading-snug">
            {universityname}
          </h3>
          {formattedOpp && (
            <div className="text-xs font-medium text-slate-500 mt-1.5 leading-snug">
              {formattedOpp}
            </div>
          )}
        </div>
        {qsRank !== 999 && (
          <div className="flex items-center gap-1 bg-amber-100/80 text-amber-700 px-2 py-1 rounded-md text-xs font-semibold shrink-0 border border-amber-200/50">
            <Trophy className="w-3 h-3 text-amber-500" />
            #{qsRank}
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center text-xs">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-start gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="font-medium leading-snug flex flex-wrap items-center gap-1.5">
              <span>{cName}</span>
            </div>
          </div>
          {costTier && (
            <div className="flex gap-1.5 flex-wrap">
              <span title="Relative Cost of Living vs Helsinki" className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${costTier.color} border bg-opacity-30 flex items-center gap-1`}>
                <Wallet className="w-3 h-3" />
                {costTier.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
