import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">About Aalto Exchange</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5 text-sm text-slate-600 leading-relaxed">
          <p>
            Aalto Exchange is an unofficial discovery dashboard built on top of Aalto University&apos;s MoveON database. 
            It is designed to make finding your ideal exchange destination easier and more insightful.
          </p>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800">Key Features</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Instant, zero-latency search and filtering.</li>
              <li>Interactive global map of all available destinations.</li>
              <li>Automated parsing of complex academic requirements.</li>
              <li>Integration with QS World University Rankings 2026.</li>
              <li>Direct links to student travel reports and fact sheets.</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 mt-6">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900">Disclaimer</h4>
              <p className="text-xs">
                This project is <strong>not officially affiliated</strong> with or endorsed by Aalto University. 
                While it synchronizes with the official MoveON database, parsing errors may occur. Always verify your eligibility, language requirements, and application deadlines on the official Aalto MoveON portal before applying.
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
