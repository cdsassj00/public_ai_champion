
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
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ 
        opacity: 1, 
        scale: 1,
        transition: {
          delay: (index % 12) * 0.03,
          duration: 0.4
        }
      }}
      viewport={{ once: true, margin: "-10px" }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      onClick={() => onClick(champion)}
      className={`group relative flex flex-col bg-neutral-900 border ${details.border} overflow-hidden transition-all duration-500 cursor-pointer ${details.glow} hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]`}
    >
      {/* Grade Accent Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${details.accent} opacity-40 group-hover:opacity-100 transition-opacity z-20`}></div>

      <div className="relative aspect-square overflow-hidden grayscale-[0.6] group-hover:grayscale-0 transition-all duration-700">
        <img 
          src={displayImage} 
          alt={champion.name}
          className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Grade Color Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${details.bg} opacity-10 group-hover:opacity-40 transition-opacity`}></div>
        
        {/* Rank Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
           <div className={`px-2 py-0.5 text-[7px] md:text-[8px] font-black tracking-[0.1em] border ${details.border} backdrop-blur-2xl bg-black/80 ${details.color} uppercase flex items-center gap-1 shadow-lg`}>
            <div className={`w-1 h-1 rounded-full ${details.accent} animate-pulse`}></div>
            {champion.certType}
          </div>
          {isOwner && (
            <div className="px-2 py-0.5 text-[6px] font-black bg-white text-black uppercase w-fit shadow-md tracking-tighter">
              MY RECORD
            </div>
          )}
        </div>
      </div>

      <div className="p-2.5 sm:p-3 flex flex-col bg-neutral-950 border-t border-white/5 relative">
        <span className={`text-[6px] sm:text-[8px] ${details.color} opacity-50 uppercase tracking-[0.2em] mb-0.5 font-black truncate`}>
          {champion.department}
        </span>
        <h3 className="text-[11px] sm:text-[14px] font-bold serif-title text-white group-hover:text-white transition-colors truncate">
          {champion.name}
        </h3>
        <p className="text-[7px] sm:text-[9px] text-white/20 font-medium truncate italic mt-0.5">
          {champion.role}
        </p>
      </div>
    </motion.div>
  );
};

export default ChampionCard;
