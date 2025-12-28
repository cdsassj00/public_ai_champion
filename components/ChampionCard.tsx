
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          delay: (index % 8) * 0.05,
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1]
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.4 }
      }}
      onClick={() => onClick(champion)}
      className={`group relative flex flex-col bg-neutral-900/60 border ${details.border} overflow-hidden transition-all duration-500 cursor-pointer ${details.glow}`}
    >
      {/* Grade Accent Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${details.accent} opacity-50 group-hover:opacity-100 transition-opacity z-20`}></div>

      <div className="relative aspect-[3/4] overflow-hidden grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700">
        <img 
          src={displayImage} 
          alt={champion.name}
          className="w-full h-full object-cover object-top transition-transform duration-[2s] group-hover:scale-110"
        />
        
        {/* Grade Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${details.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
           <div className={`px-3 py-1 text-[8px] font-black tracking-[0.2em] border ${details.border} backdrop-blur-xl bg-black/80 ${details.color} uppercase shadow-2xl`}>
            {details.title}
          </div>
          {isOwner && (
            <div className="px-2 py-0.5 text-[6px] font-bold tracking-widest bg-emerald-500 text-black uppercase w-fit shadow-lg">
              MY PROFILE
            </div>
          )}
        </div>

        <div className="absolute bottom-4 right-4 flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <div className={`w-1.5 h-1.5 ${details.accent} rounded-full animate-pulse shadow-[0_0_8px_currentColor]`}></div>
          <span className="text-[9px] font-bold text-white uppercase tracking-tighter">
            {champion.viewCount?.toLocaleString() || 0} VIEWS
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col bg-black/90 backdrop-blur-2xl border-t border-white/5 relative">
        {/* Subtle Rank Icon Background */}
        <div className={`absolute top-4 right-5 text-[40px] font-black ${details.color} opacity-[0.03] select-none pointer-events-none italic`}>
          {champion.certType[0]}
        </div>

        <span className="text-[8px] text-white/30 uppercase tracking-[0.3em] mb-1 font-bold truncate">{champion.department}</span>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-xl font-bold serif-title text-white group-hover:text-yellow-500 transition-colors">{champion.name}</h3>
          <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">{champion.registeredAt}</span>
        </div>
        <p className="text-[10px] text-white/50 font-light truncate">{champion.role}</p>
        
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
          <div className="flex items-center space-x-2">
             <div className={`w-1 h-1 rounded-full ${details.accent}`}></div>
             <span className="text-[8px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-widest">Digital Leader</span>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
             <span className="text-[8px] font-black tracking-tighter uppercase text-yellow-500">Details</span>
             <svg className="w-2.5 h-2.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChampionCard;
