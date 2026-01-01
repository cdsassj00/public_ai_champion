
import React from 'react';
import { motion } from 'framer-motion';
import { CertificationType } from '../types';
import { CERT_DETAILS, POPULAR_TAGS } from '../constants';

interface FilterBarProps {
  selectedRank: CertificationType | 'ALL';
  setSelectedRank: (rank: CertificationType | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  selectedRank, 
  setSelectedRank, 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="w-full space-y-8 mb-16">
      {/* Rank Filters */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <button
          onClick={() => setSelectedRank('ALL')}
          className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border transition-all duration-500 ${
            selectedRank === 'ALL' 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
              : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
          }`}
        >
          ALL RANKS
        </button>
        
        {Object.entries(CERT_DETAILS).map(([type, detail]) => (
          <button
            key={type}
            onClick={() => setSelectedRank(type as CertificationType)}
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border transition-all duration-500 flex items-center gap-2 ${
              selectedRank === type 
                ? `${detail.bg.split(' ')[0]} ${detail.color} ${detail.border} ${detail.glow}`
                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${selectedRank === type ? detail.accent : 'bg-white/20'}`}></div>
            {type}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
        <div className="relative flex items-center">
          <div className="absolute left-6 text-white/20 group-focus-within:text-yellow-500 transition-colors duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="이름, 기관 또는 키워드를 검색하세요" 
            className="w-full bg-white/[0.03] border border-white/10 pl-14 pr-6 py-5 rounded-full text-base font-light focus:outline-none focus:border-yellow-500/50 transition-all backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] placeholder:text-white/20" 
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
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setSearchQuery(tag.replace('#', ''))}
            className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
              searchQuery === tag.replace('#', '')
                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20 hover:text-white/60'
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
