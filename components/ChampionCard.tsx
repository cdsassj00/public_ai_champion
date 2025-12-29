
import React from 'react';
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
  const details = CERT_DETAILS[champion.certType];
  const isOwner = storageService.isOwner(champion.id);

  const displayImage = champion.imageUrl.includes('picsum.photos') 
    ? `https://i.pravatar.cc/600?u=${champion.id}` 
    : champion.imageUrl;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay: (index % 10) * 0.05
        }
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.95,
        transition: { duration: 0.2 } 
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onClick={() => onClick(champion)}
      className={`group relative flex flex-col bg-neutral-900 border ${details.border} overflow-hidden transition-all duration-500 cursor-pointer ${details.glow} hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
    >
      {/* Grade Accent Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${details.accent} opacity-40 group-hover:opacity-100 transition-opacity z-20`}></div>

      <div className="relative aspect-[3/4] overflow-hidden grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700">
        <img 
          src={displayImage} 
          alt={champion.name}
          className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Grade Color Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${details.bg} opacity-10 group-hover:opacity-40 transition-opacity`}></div>
        
        {/* Rank Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
           <div className={`px-2.5 py-1 text-[8px] font-black tracking-[0.1em] border ${details.border} backdrop-blur-2xl bg-black/80 ${details.color} uppercase flex items-center gap-1.5 shadow-lg`}>
            <div className={`w-1.5 h-1.5 rounded-full ${details.accent} animate-pulse`}></div>
            {champion.certType}
          </div>
          {isOwner && (
            <div className="px-2.5 py-1 text-[7px] font-black bg-white text-black uppercase w-fit shadow-md tracking-tighter">
              MY RECORD
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col bg-neutral-950 border-t border-white/5 relative">
        <span className={`text-[7px] sm:text-[9px] ${details.color} opacity-60 uppercase tracking-[0.2em] mb-1 font-black truncate`}>
          {champion.department}
        </span>
        <h3 className="text-[13px] sm:text-[16px] font-bold serif-title text-white group-hover:text-yellow-500 transition-colors truncate">
          {champion.name}
        </h3>
        <p className="text-[8px] sm:text-[10px] text-white/30 font-medium truncate italic mt-1">
          {champion.role}
        </p>
      </div>
    </motion.div>
  );
};

export default ChampionCard;
