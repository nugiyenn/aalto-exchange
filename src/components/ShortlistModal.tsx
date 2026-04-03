import React, { useState } from 'react';
import { X, Share2, MapPin, Trophy, Trash2, Check, ExternalLink } from 'lucide-react';
import { useUniversityContext } from '../context/UniversityContext';

export function ShortlistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { shortlist, removeFromShortlist, universities, setSelectedUniversityId } = useUniversityContext();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shortlistedUnis = shortlist
    .map(id => universities.find(u => u.core_id === id))
    .filter(Boolean);

  const handleShare = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('top', shortlist.join(','));
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = (id: string) => {
    setSelectedUniversityId(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 pb-6 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-orange-50">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            My Top 3 Shortlist 
            <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full font-bold">
              {shortlist.length}/3
            </span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
          {shortlist.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Your shortlist is empty</h3>
              <p className="text-slate-500 text-sm mt-2">
                Browse destinations and click the "Add to Shortlist" button to build your top 3 tier list.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {shortlistedUnis.map((uni, idx) => (
                <div key={uni!.core_id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 relative">
                  <div className="absolute top-0 left-0 bg-slate-900 text-white w-8 h-8 rounded-br-xl rounded-tl-xl flex items-center justify-center font-bold shadow-sm">
                    #{idx + 1}
                  </div>
                  <div className="pl-6 flex-1 cursor-pointer group" onClick={() => handleClick(uni!.core_id)}>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors pr-8">
                      {uni!.universityname}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium mt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {uni!.country_fullname || uni!.country}
                      </span>
                      {uni!.qsRank !== 999 && (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <Trophy className="w-3.5 h-3.5" />
                          QS #{uni!.qsRank}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:flex-col gap-2 shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleClick(uni!.core_id); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromShortlist(uni!.core_id); }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {shortlist.length < 3 && (
                <div className="bg-transparent border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <span className="font-bold text-sm">Empty Slot #{shortlist.length + 1}</span>
                  <span className="text-xs text-slate-500">Keep exploring to fill this spot</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={handleShare}
            disabled={shortlist.length === 0}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              shortlist.length > 0 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied Link!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Generate Share Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
