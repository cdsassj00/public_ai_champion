
import React from 'react';
import { motion } from 'framer-motion';
import { CertificationType } from '../types';
import { CERT_DETAILS, POPULAR_TAGS } from '../constants';

interface FilterBarProps {
  selectedRank: CertificationType | 'ALL';
  setSelectedRank: (rank: CertificationType | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'GRID' | 'LIST';
  setViewMode: (mode: 'GRID' | 'LIST') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  selectedRank, 
  setSelectedRank, 
  searchQuery, 
  setSearchQuery,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="w-full space-y-6 md:space-y-8 mb-10 md:mb-16">
      {/* Top Controls: Rank & View Mode */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 flex-1">
          <button
            onClick={() => setSelectedRank('ALL')}
            className={`px-5 py-2 md:px-6 md:py-2.5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] rounded-full border transition-all duration-300 ${
              selectedRank === 'ALL' 
                ? 'bg-white text-black border-white shadow-lg' 
                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
            }`}
          >
            ALL
          </button>
          
          {Object.entries(CERT_DETAILS).map(([type, detail]) => (
            <button
              key={type}
              onClick={() => setSelectedRank(type as CertificationType)}
              className={`px-5 py-2 md:px-6 md:py-2.5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] rounded-full border transition-all duration-300 flex items-center gap-2 ${
                selectedRank === type 
                  ? `bg-black ${detail.color} ${detail.border} ${detail.glow.replace('shadow-', 'shadow-[0_0_20px_]')}`
                  : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${detail.accent} ${selectedRank === type ? 'animate-pulse' : 'opacity-40 shadow-[0_0_5px_currentColor]'}`}></div>
              {type}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-white/[0.03] border border-white/10 p-1 rounded-full backdrop-blur-md">
          <button 
            onClick={() => setViewMode('GRID')}
            className={`p-2 md:p-2.5 rounded-full transition-all ${viewMode === 'GRID' ? 'bg-white/10 text-yellow-500 shadow-inner' : 'text-white/20 hover:text-white/60'}`}
            title="Grid View"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/></svg>
          </button>
          <button 
            onClick={() => setViewMode('LIST')}
            className={`p-2 md:p-2.5 rounded-full transition-all ${viewMode === 'LIST' ? 'bg-white/10 text-yellow-500 shadow-inner' : 'text-white/20 hover:text-white/60'}`}
            title="List View"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 14h16v-2H4v2zm0 4h16v-2H4v2zM4 6v2h16V6H4zm0 4h16V8H4v2z"/></svg>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto relative group px-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
        <div className="relative flex items-center">
          <div className="absolute left-6 text-white/20 group-focus-within:text-yellow-500 transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="이름, 기관 또는 키워드 검색" 
            className="w-full bg-white/[0.03] border border-white/10 pl-14 pr-6 py-4 md:py-5 rounded-full text-sm md:text-base font-light focus:outline-none focus:border-yellow-500/30 transition-all backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] placeholder:text-white/10" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-6 text-white/20 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 max-w-3xl mx-auto px-4">
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setSearchQuery(tag.replace('#', ''))}
            className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest transition-all duration-300 border uppercase ${
              searchQuery === tag.replace('#', '')
                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20 hover:text-white/60'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
