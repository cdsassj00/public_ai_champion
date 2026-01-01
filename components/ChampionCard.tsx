
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
    return champion.imageUrl;
  };

  const displayImage = getImageUrl();
  
  // 내용이 짧거나 업적이 없으면 'Raw' (AI 미정제) 상태로 간주
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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onClick(champion)}
      className={`group relative flex flex-col bg-neutral-900 border ${details.border} overflow-hidden transition-all duration-500 cursor-pointer ${details.glow} hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]`}
    >
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${details.accent} opacity-40 group-hover:opacity-100 transition-opacity z-20`}></div>

      <div className="relative aspect-[3/4] overflow-hidden bg-black flex items-center justify-center">
        {!imageError ? (
          <>
            {/* 비율 보존을 위한 배경 블러 - 사진이 잘리지 않게 여백을 채움 */}
            <img 
              src={displayImage} 
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125"
              alt="Backdrop"
            />
            <img 
              src={displayImage} 
              alt={champion.name}
              onError={() => setImageError(true)}
              loading="lazy"
              className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="text-center p-2 z-10">
            <div className={`w-8 h-8 rounded-full ${details.accent} opacity-20 mx-auto mb-1 flex items-center justify-center`}>
              <span className="text-white/40 text-[10px] font-bold">{champion.name ? champion.name[0] : '?'}</span>
            </div>
            <p className="text-[6px] text-white/20 uppercase tracking-widest font-bold">Image Info</p>
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/90 to-transparent z-15"></div>
        
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-20">
           <div className={`px-1.5 py-0.5 text-[6px] sm:text-[8px] font-black tracking-tighter border ${details.border} backdrop-blur-3xl bg-black/70 ${details.color} uppercase flex items-center gap-1 shadow-lg`}>
            {champion.certType}
          </div>
          {isOwner && <div className="px-1.5 py-0.5 text-[5px] font-black bg-white text-black uppercase w-fit">MY</div>}
          {isUnrefined && <div className="px-1.5 py-0.5 text-[5px] font-black bg-yellow-500 text-black uppercase w-fit animate-pulse">RAW</div>}
        </div>
      </div>

      <div className="p-1.5 sm:p-2.5 flex flex-col bg-neutral-950 border-t border-white/5 relative">
        <span className={`text-[6px] sm:text-[7px] ${details.color} opacity-60 uppercase tracking-widest mb-0.5 font-black truncate`}>
          {champion.department}
        </span>
        <h3 className="text-[10px] sm:text-[13px] font-bold serif-title text-white group-hover:text-yellow-500 transition-colors truncate">
          {champion.name}
        </h3>
        <p className="text-[7px] sm:text-[8px] text-white/20 font-medium truncate italic leading-none mt-0.5">
          {champion.role}
        </p>
      </div>
    </motion.div>
  );
};

export default ChampionCard;
