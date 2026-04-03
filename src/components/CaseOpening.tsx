"use client";

import React, { useEffect, useState } from 'react';
import { University } from '../types/university';
import { Trophy, MapPin, X } from 'lucide-react';

interface CaseOpeningProps {
  universities: University[];
  onComplete: (winnerId: string) => void;
  onClose: () => void;
}

export function CaseOpening({ universities, onComplete, onClose }: CaseOpeningProps) {
  const [items, setItems] = useState<University[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [finalOffset, setFinalOffset] = useState(0);

  const WINNER_INDEX = 135; // The item that will be chosen
  const ITEM_WIDTH = 256; // 240px width + 16px gap/margin

  useEffect(() => {
    if (universities.length === 0) {
      onClose();
      return;
    }

    // Play the case opening sound (trimmed slightly from the beginning to match pace)
    const audio = new Audio('/csgo-knife-opening.mp3');
    audio.volume = 0.5; // 50% volume so it's not too loud
    
    // Once loaded, skip the first 1.5 seconds to bypass the "clicking/buying" sounds
    audio.addEventListener('canplaythrough', () => {
      audio.currentTime = 1.5; 
      audio.play().catch(e => console.log('Audio autoplay blocked:', e));
    }, { once: true });

    // Generate random items
    const newItems: University[] = [];
    for (let i = 0; i < 150; i++) {
      newItems.push(universities[Math.floor(Math.random() * universities.length)]);
    }

    // Pick a winner and force it to the WINNER_INDEX
    const actualWinner = universities[Math.floor(Math.random() * universities.length)];
    newItems[WINNER_INDEX] = actualWinner;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(newItems);
    
    // Calculate exact offset to land on the winner
    // We want the center of the winner item to align with the center line (left: 50%)
    // Since the track starts at left: 50%, a transform of 0 means the LEFT edge of item 0 is at the center line.
    // To move item N's center to the center line: we shift left by (N * ITEM_WIDTH) + (ITEM_WIDTH / 2)
    const exactCenterOffset = -(WINNER_INDEX * ITEM_WIDTH) - (ITEM_WIDTH / 2);
    
    // Add a little random jitter so it doesn't always land perfectly in the dead center
    const randomJitter = Math.floor(Math.random() * (ITEM_WIDTH - 20)) - (ITEM_WIDTH / 2 - 10);
    
    setFinalOffset(exactCenterOffset + randomJitter);

    // Start animation shortly after mount
    const spinTimer = setTimeout(() => {
      setSpinning(true);
    }, 100);

    // After animation finishes (wait for new duration), wait a bit then complete
    const finishTimer = setTimeout(() => {
      onComplete(actualWinner.core_id);
    }, 8500);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(finishTimer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [universities, onClose, onComplete]);

  // Utility to determine "rarity" color based on QS Rank
  const getRarityColor = (rank: number) => {
    if (rank <= 50) return 'from-amber-300 to-yellow-600 border-yellow-400 shadow-yellow-400/50'; // Legendary (Gold)
    if (rank <= 150) return 'from-rose-400 to-rose-600 border-rose-400 shadow-rose-400/50'; // Covert (Red)
    if (rank <= 300) return 'from-purple-500 to-purple-700 border-purple-500 shadow-purple-500/50'; // Classified (Pink/Purple)
    if (rank < 999) return 'from-blue-500 to-blue-700 border-blue-500 shadow-blue-500/50'; // Restricted (Blue)
    return 'from-slate-600 to-slate-800 border-slate-500 shadow-slate-900/50'; // Mil-Spec (Grey)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-6xl flex flex-col items-center">
        

        {/* The Case Opening Container */}
        <div className="relative w-full h-64 bg-slate-900 border-y-4 border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex items-center">
          
          {/* Center Line (The Selector) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-400 z-20 -translate-x-1/2 shadow-[0_0_20px_rgba(251,191,36,1)]" />
          <div className="absolute left-1/2 top-0 w-4 h-4 bg-amber-400 z-20 -translate-x-1/2 rotate-45 -translate-y-1/2" />
          <div className="absolute left-1/2 bottom-0 w-4 h-4 bg-amber-400 z-20 -translate-x-1/2 rotate-45 translate-y-1/2" />

          {/* The Track */}
          <div 
            className="absolute left-1/2 flex items-center h-full"
            style={{
              transform: `translateX(${spinning ? finalOffset : 0}px)`,
              transitionProperty: 'transform',
              transitionDuration: spinning ? '6500ms' : '0ms',
              transitionTimingFunction: 'cubic-bezier(0.1, 0.85, 0.15, 1)', // Fast start, very long smooth deceleration
            }}
          >
            {items.map((uni, index) => {
              const rarity = getRarityColor(uni.qsRank);
              return (
                <div 
                  key={`${uni.core_id}-${index}`}
                  className={`flex-shrink-0 w-[240px] h-[200px] mx-2 rounded-xl bg-gradient-to-b ${rarity} p-1 border-b-4 shadow-lg`}
                >
                  <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    
                    {/* Country Flag Background watermark */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://flagcdn.com/w160/${uni.country.toLowerCase()}.png`} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-10 filter blur-[2px] pointer-events-none"
                    />

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://flagcdn.com/w80/${uni.country.toLowerCase()}.png`} 
                      alt={uni.country}
                      className="w-10 h-auto rounded shadow-sm border border-white/20 mb-3 z-10"
                    />
                    
                    <h3 className="font-bold text-white text-sm line-clamp-3 mb-3 z-10 drop-shadow-md">
                      {uni.universityname}
                    </h3>
                    
                    <div className="flex flex-col items-center gap-2 mt-auto z-10">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                        <MapPin className="w-3.5 h-3.5" />
                        {uni.country_fullname || uni.country}
                      </div>
                      
                      {uni.qsRank !== 999 ? (
                        <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold border border-white/10">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          Rank #{uni.qsRank}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-black/50 text-slate-400 px-2 py-1 rounded text-xs font-bold border border-white/10">
                          Unranked
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
