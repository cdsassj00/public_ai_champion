
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
      whileHover={{ y: -8, transition: { duration: 0.5, ease: "easeOut" } }}
      onClick={() => onClick(champion)}
      className={`group relative aspect-[3/4] md:aspect-[4/5] bg-neutral-950 overflow-hidden cursor-pointer rounded-sm border border-white/[0.05] transition-all duration-700 hover:border-white/20 shadow-2xl`}
    >
      {/* 1. Backdrop Glow - Creates depth behind the subject */}
      <div className={`absolute inset-0 z-0 opacity-10 blur-3xl transition-opacity duration-1000 group-hover:opacity-20 ${details.accent}`}></div>

      {/* 2. Photo - More visible and vibrant */}
      <div className="absolute inset-0 z-10 overflow-hidden bg-black">
        {!imageError ? (
          <img 
            src={displayImage} 
            alt={champion.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05] brightness-[0.85] group-hover:grayscale-0 group-hover:brightness-[0.95] group-hover:contrast-100 transition-all duration-1000 scale-[1.02] group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
            <span className="text-4xl md:text-6xl font-black text-white/5">{champion.name[0]}</span>
          </div>
        )}
      </div>

      {/* 3. Artistic Feathered Masking - Sophisticated bottom scrim */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-all duration-700 group-hover:opacity-100"></div>
      
      {/* 4. Film Grain Texture for Archive feel */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

      {/* 5. Rank Badge - Sharp & Professional */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-5 lg:p-6 z-40 flex justify-between items-start">
        <div className="flex flex-col gap-1.5">
          <div className={`px-2.5 py-1 rounded-sm ${details.rankBg} border ${details.border} backdrop-blur-md shadow-2xl`}>
             <span className={`text-[8px] md:text-[9px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase ${details.color}`}>
                {details.icon} {champion.certType}
             </span>
          </div>
        </div>
        {isOwner && (
          <div className="px-2 py-0.5 text-[6px] md:text-[7px] font-black bg-yellow-500 text-black rounded-sm shadow-xl tracking-tight uppercase">Owner</div>
        )}
      </div>

      {/* 6. Content Block - Optimized Typography */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 lg:p-8 z-40">
        <div className="relative flex flex-col transform transition-transform duration-700 ease-out">
          
          {/* Organization - Golden Accent */}
          <div className="mb-1.5 md:mb-2">
            <p className="text-[9px] md:text-[10px] lg:text-[11px] text-yellow-500/80 font-black tracking-widest group-hover:text-yellow-400 transition-colors duration-500 truncate uppercase">
              {champion.department}
            </p>
          </div>
          
          {/* Name - Reduced Size significantly for Desktop (approx 50% smaller than previous) */}
          <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2.5">
             <h3 className="text-lg md:text-xl lg:text-2xl font-black serif-title text-white tracking-tighter leading-none transition-all duration-500">
              {champion.name}
            </h3>
            <div className={`h-[1px] w-3 md:w-5 ${details.accent} opacity-60 group-hover:w-8 transition-all duration-1000 shadow-[0_0_8px_currentColor]`}></div>
          </div>

          {/* Role - Subtle & Clean */}
          <div className="flex items-center gap-2">
            <span className={`w-1 h-1 rounded-full ${details.accent} opacity-40`}></span>
            <p className="text-[8px] md:text-[9px] lg:text-[10px] text-white/40 font-medium tracking-tight group-hover:text-white/70 transition-colors duration-500 truncate uppercase">
              {champion.role}
            </p>
          </div>

        </div>
      </div>

      {/* Decorative Corner Highlights */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/10 pointer-events-none transition-colors group-hover:border-white/30"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/10 pointer-events-none transition-colors group-hover:border-white/30"></div>
    </motion.div>
  );
};

export default ChampionCard;
