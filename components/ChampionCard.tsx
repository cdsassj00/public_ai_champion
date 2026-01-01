
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';
import { storageService } from '../services/storageService';

interface ChampionCardProps {
  champion: Champion;
  index: number;
  onClick: (champion: Champion) => void;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ champion, index, onClick }) => {
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 22,
          delay: (index % 12) * 0.04
        }
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={() => onClick(champion)}
      className={`group relative flex flex-col bg-neutral-900 border ${details.border} overflow-hidden transition-all duration-500 cursor-pointer ${details.glow} hover:shadow-[0_30px_80px_rgba(0,0,0,0.95)] rounded-sm`}
    >
      {/* Dynamic Glow Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${details.accent} z-40 opacity-100 shadow-[0_0_15px_currentColor]`}></div>

      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-black flex items-center justify-center">
        {!imageError ? (
          <>
            <img 
              src={displayImage} 
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125"
              alt="Backdrop"
            />
            <img 
              src={displayImage} 
              alt={champion.name}
              onError={() => setImageError(true)}
              loading="lazy"
              className="relative z-10 w-full h-full object-contain transition-all duration-1000 group-hover:scale-110 group-hover:contrast-[1.1]"
            />
          </>
        ) : (
          <div className="text-center p-4 z-10 opacity-30">
            <span className="text-4xl font-black">{champion.name ? champion.name[0] : 'AI'}</span>
          </div>
        )}
        
        {/* Protection Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>
        
        {/* Enhanced Rank Badge */}
        <div className="absolute top-4 left-0 z-40 flex flex-col items-start gap-1">
           <div className={`relative pl-4 pr-3 py-1.5 ${details.rankBg} backdrop-blur-xl border-y border-r ${details.border} rounded-r-full shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center gap-2 group-hover:translate-x-1.5 transition-transform duration-500`}>
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${details.accent} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${details.accent}`}></span>
              </div>
              <span className={`text-[10px] font-black tracking-[0.25em] uppercase ${details.color} drop-shadow-[0_0_8px_currentColor]`}>
                {champion.certType}
              </span>
           </div>
           
           {isOwner && (
            <div className="ml-4 px-2 py-0.5 text-[7px] font-black bg-white text-black uppercase rounded-sm shadow-lg border border-white/20">
              OWNER
            </div>
           )}
        </div>

        {/* Floating Icon Decoration */}
        <div className={`absolute -right-4 -top-4 text-8xl font-black opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none select-none ${details.color}`}>
          {details.icon}
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-5 flex flex-col bg-neutral-950 border-t border-white/5 relative z-30 min-h-[140px] justify-center">
        <div className="mb-2.5">
          <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${details.color} bg-white/[0.03] border ${details.border} rounded-sm shadow-sm`}>
            {champion.department}
          </span>
        </div>

        <h3 className="text-xl font-bold serif-title text-white group-hover:text-white transition-all duration-500 truncate leading-tight">
          {champion.name}
        </h3>

        <p className="text-[11px] text-white/40 font-medium truncate italic mt-1.5 group-hover:text-white/60 transition-colors">
          {champion.role}
        </p>

        <div className="mt-3 flex items-center justify-between opacity-30 group-hover:opacity-60 transition-opacity">
           <span className="text-[8px] font-bold tracking-widest text-white/40 uppercase">EXCELLENCE ARCHIVE</span>
           {isUnrefined && (
            <span className="text-[8px] text-yellow-500 font-black animate-pulse">OPTIMIZING</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChampionCard;
