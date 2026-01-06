
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';
import { storageService } from '../services/storageService';

interface ChampionCardProps {
  champion: Champion;
  index: number;
  onClick: (champion: Champion) => void;
  viewMode?: 'GRID' | 'LIST';
}

const ChampionCard: React.FC<ChampionCardProps> = ({ champion, index, onClick, viewMode = 'GRID' }) => {
  const [imageError, setImageError] = useState(false);
  const details = CERT_DETAILS[champion.certType];
  const isOwner = storageService.isOwner(champion.id);

  const getImageUrl = () => {
    if (!champion.imageUrl) return `https://i.pravatar.cc/600?u=${champion.id}`;
    const url = champion.imageUrl;
    return url.includes('?') ? `${url}&t=${champion.id}` : `${url}?t=${champion.id}`;
  };

  const displayImage = getImageUrl();
  const isUnrefined = (champion.vision?.length || 0) < 20 || !champion.achievement || champion.achievement.length < 10;

  if (viewMode === 'LIST') {
    return (
      <motion.div
        layout
        whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.03)' }}
        onClick={() => onClick(champion)}
        className={`group relative flex items-center gap-6 p-4 bg-neutral-900/50 border-l-4 ${details.border} border-t border-b border-r border-white/5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
      >
        {/* Compact Thumbnail */}
        <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-black border border-white/10 relative">
          <img src={displayImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={champion.name} />
          <div className={`absolute inset-0 ${details.accent} opacity-10`}></div>
        </div>

        {/* List Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-yellow-500 transition-colors truncate">
              {champion.name}
            </h3>
            <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${details.rankBg} ${details.color} border ${details.border} shadow-sm`}>
              {champion.certType}
            </span>
            {isOwner && <span className="text-[7px] font-black text-yellow-500 uppercase border border-yellow-500/20 px-1.5 rounded-sm">OWNER</span>}
          </div>
          <p className="text-xs text-white/40 font-medium truncate italic">
            {champion.department} · {champion.role}
          </p>
        </div>

        {/* Vision Fragment (Hidden on mobile) */}
        <div className="hidden lg:block flex-[2] text-xs text-white/30 italic truncate pr-8">
          "{champion.vision}"
        </div>

        {/* Right Indicators */}
        <div className="shrink-0 flex items-center gap-4 opacity-20 group-hover:opacity-100 transition-opacity">
           <div className="text-right">
             <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">RECORD NO.</div>
             <div className="text-[10px] font-black text-white">{champion.id.slice(-5).toUpperCase()}</div>
           </div>
           <svg className="w-5 h-5 text-white/20 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </div>
      </motion.div>
    );
  }

  // GRID MODE (Default)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={() => onClick(champion)}
      className={`group relative flex flex-col bg-neutral-900 border ${details.border} overflow-hidden transition-all duration-500 cursor-pointer ${details.glow} hover:shadow-[0_30px_80px_rgba(0,0,0,0.95)] rounded-sm`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${details.accent} z-40 opacity-100 shadow-[0_0_15px_currentColor]`}></div>

      <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center">
        {!imageError ? (
          <>
            <img src={displayImage} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125" alt="Backdrop" />
            <img src={displayImage} alt={champion.name} onError={() => setImageError(true)} loading="lazy" className="relative z-10 w-full h-full object-contain transition-all duration-1000 group-hover:scale-110 group-hover:contrast-[1.1]" />
          </>
        ) : (
          <div className="text-center p-4 z-10 opacity-30"><span className="text-4xl font-black">{champion.name[0]}</span></div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>
        <div className="absolute top-4 left-0 z-40 flex flex-col items-start gap-1">
           <div className={`relative pl-4 pr-3 py-1.5 ${details.rankBg} backdrop-blur-xl border-y border-r ${details.border} rounded-r-full shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center gap-2 group-hover:translate-x-1.5 transition-transform duration-500`}>
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${details.accent} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${details.accent}`}></span>
              </div>
              <span className={`text-[10px] font-black tracking-[0.25em] uppercase ${details.color} drop-shadow-[0_0_8px_currentColor]`}>{champion.certType}</span>
           </div>
           {isOwner && <div className="ml-4 px-2 py-0.5 text-[7px] font-black bg-white text-black uppercase rounded-sm shadow-lg border border-white/20">OWNER</div>}
        </div>
      </div>

      <div className="p-5 flex flex-col bg-neutral-950 border-t border-white/5 relative z-30 min-h-[140px] justify-center">
        <div className="mb-2.5">
          <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${details.color} bg-white/[0.03] border ${details.border} rounded-sm shadow-sm truncate max-w-full`}>
            {champion.department}
          </span>
        </div>
        <h3 className="text-lg font-bold serif-title text-white group-hover:text-white transition-all duration-500 truncate leading-tight">
          {champion.name}
        </h3>
        <p className="text-[11px] text-white/40 font-medium truncate italic mt-1.5">{champion.role}</p>
        <div className="mt-3 flex items-center justify-between opacity-30 group-hover:opacity-60 transition-opacity">
           <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase">EXCELLENCE</span>
           {isUnrefined && <span className="text-[8px] text-yellow-500 font-black animate-pulse">OPTIMIZING</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default ChampionCard;
