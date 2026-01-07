
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

  if (viewMode === 'LIST') {
    return (
      <motion.div
        layout
        whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.03)' }}
        onClick={() => onClick(champion)}
        className={`group relative flex items-center gap-4 md:gap-6 p-3 md:p-4 bg-neutral-900/50 border-l-4 ${details.border} border-t border-b border-r border-white/5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
      >
        <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-full overflow-hidden bg-black border border-white/10 relative">
          <img src={displayImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={champion.name} />
          <div className={`absolute inset-0 ${details.accent} opacity-10`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
            <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-yellow-500 transition-colors truncate">{champion.name}</h3>
            <span className={`text-[7px] md:text-[9px] font-black tracking-widest px-1.5 md:px-2 py-0.5 rounded-full ${details.rankBg} ${details.color} border ${details.border} shadow-sm uppercase`}>{champion.certType}</span>
            {isOwner && <span className="text-[6px] md:text-[7px] font-black text-yellow-500 uppercase border border-yellow-500/20 px-1 rounded-sm">OWNER</span>}
          </div>
          <p className="text-[9px] md:text-xs text-white/40 font-medium truncate italic">{champion.department} · {champion.role}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2 md:gap-4 opacity-20 group-hover:opacity-100 transition-opacity">
           <svg className="w-4 h-4 md:w-5 md:h-5 text-white/20 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { delay: (index % 12) * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }
      }}
      whileHover={{ y: -10, transition: { duration: 0.5, ease: "easeOut" } }}
      onClick={() => onClick(champion)}
      className={`group relative aspect-[3/4] md:aspect-[4/5] bg-neutral-950 overflow-hidden cursor-pointer rounded-sm border border-white/[0.05] transition-all duration-700 hover:border-white/20 shadow-2xl`}
    >
      {/* 1. Base Image - "Silver-Contrast" Grayscale */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!imageError ? (
          <img 
            src={displayImage} 
            alt={champion.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover grayscale contrast-[1.2] brightness-[1.05] saturate-0 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 transition-all duration-1000 scale-[1.01] group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            <span className="text-4xl md:text-6xl font-black text-white/5">{champion.name[0]}</span>
          </div>
        )}
      </div>

      {/* 2. Asymmetric Editorial Scrim */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover:opacity-50 transition-opacity duration-1000"></div>
      
      {/* 3. Micro Film Texture */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

      {/* 4. Minimal Rank Indicator - Distinct Color Points */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-5 z-40 flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className={`w-5 h-[2px] md:w-6 md:h-[3px] ${details.accent} shadow-[0_0_15px_currentColor] group-hover:w-16 transition-all duration-700 ease-in-out`}></div>
          <span className={`text-[7px] md:text-[9px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase ${details.color} opacity-90 group-hover:opacity-100 drop-shadow-md`}>
            {details.icon} {champion.certType}
          </span>
        </div>
        {isOwner && (
          <div className="px-1.5 py-0.5 text-[5px] md:text-[6px] font-black bg-yellow-500 text-black rounded-sm shadow-xl tracking-tight uppercase">Owner</div>
        )}
      </div>

      {/* 5. Editorial Content - Name size optimized for Mobile */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 lg:p-10 z-40">
        <div className="relative transform group-hover:translate-x-1 transition-transform duration-700 ease-out">
          
          <div className="mb-1 md:mb-2 flex items-center gap-1.5">
            <div className={`w-1 h-1 rounded-full ${details.accent} opacity-90 group-hover:scale-150 transition-transform shadow-[0_0_8px_currentColor]`}></div>
            <p className="text-[8px] md:text-[11px] text-white/60 font-bold tracking-tight group-hover:text-white transition-colors duration-500 truncate uppercase">
              {champion.role}
            </p>
          </div>
          
          <div className="flex items-end gap-2 md:gap-3">
             <h3 className="text-xl md:text-3xl lg:text-5xl font-black serif-title text-white tracking-tighter leading-none group-hover:text-yellow-500 transition-colors duration-500">
              {champion.name}
            </h3>
            <div className={`h-1 md:h-2 w-4 md:w-8 mb-0.5 md:mb-1.5 ${details.accent} opacity-50 group-hover:opacity-100 group-hover:w-12 transition-all duration-1000 shadow-[0_0_10px_currentColor]`}></div>
          </div>
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/10 pointer-events-none group-hover:border-white/30 transition-colors"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/10 pointer-events-none group-hover:border-white/30 transition-colors"></div>
    </motion.div>
  );
};

export default ChampionCard;
