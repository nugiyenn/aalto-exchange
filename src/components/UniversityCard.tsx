import React from 'react';
import { Trophy, MapPin, GraduationCap } from 'lucide-react';
import { University } from '../types/university';

interface UniversityCardProps {
  university: University;
  isSelected?: boolean;
  onClick?: () => void;
}

export function UniversityCard({ university, isSelected = false, onClick }: UniversityCardProps) {
  const { universityname, country, qsRank, gpaReq, studyOpportunity } = university;
  
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
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
          {universityname}
          {formattedOpp && (
            <span className="block text-xs font-medium text-slate-500 mt-1">
              {formattedOpp}
            </span>
          )}
        </h3>
        {qsRank !== 999 && (
          <div className="flex items-center gap-1 bg-amber-100/80 text-amber-700 px-2 py-1 rounded-md text-xs font-semibold shrink-0 border border-amber-200/50">
            <Trophy className="w-3 h-3 text-amber-500" />
            #{qsRank}
          </div>
        )}
      </div>
      
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-500 mr-1">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          {/* We remove country_fullname here since the sidebar itself will be grouped by country */}
          <span className="font-medium">{universityname.split(',')[0]}</span>
          <span className="bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded text-[10px] ml-0.5 font-bold border border-sky-200">
            {country}
          </span>
        </div>
      </div>

      {/* Colorful Badges for Requirements */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {gpaReq && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.5 rounded-md text-[10px] font-medium" title="GPA Requirement">
              <GraduationCap className="w-3 h-3 text-emerald-500" />
              {gpaReq}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
