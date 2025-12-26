
import React from 'react';
import { motion } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';

interface ChampionCardProps {
  champion: Champion;
  index: number;
  onClick: (champion: Champion) => void;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ champion, index, onClick }) => {
  const details = CERT_DETAILS[champion.certType];

  const displayImage = champion.imageUrl.includes('picsum.photos') 
    ? `https://i.pravatar.cc/600?u=${champion.id}` 
    : champion.imageUrl;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          delay: (index % 8) * 0.08, // Stagger effect based on index (clamped to prevent long delays)
          duration: 0.5,
          ease: [0.215, 0.61, 0.355, 1.0] // Power3 ease-out for a more professional feel
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        y: -5, 
        scale: 1.01,
        boxShadow: "0 10px 25px rgba(191, 149, 63, 0.2)",
        transition: { duration: 0.3 }
      }}
      onClick={() => onClick(champion)}
      className="group relative flex flex-col bg-neutral-900/40 border border-white/5 overflow-hidden transition-all duration-500 cursor-pointer"
    >
      <div className="relative aspect-[3/2] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
        <img 
          src={displayImage} 
          alt={champion.name}
          className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-0 left-0 p-3 flex flex-col gap-1.5">
           <div className={`px-2.5 py-0.5 text-[7px] font-black tracking-[0.15em] border ${details.border} backdrop-blur-md bg-black/60 ${details.color} uppercase`}>
            {details.title}
          </div>
          {champion.status === 'PENDING' && (
            <div className="px-2 py-0.5 text-[6px] font-bold tracking-widest bg-yellow-500 text-black uppercase w-fit">
              IN REVIEW
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col bg-black/80 backdrop-blur-xl border-t border-white/5">
        <span className="text-[7px] text-white/30 uppercase tracking-[0.25em] mb-0.5 font-bold truncate">{champion.department}</span>
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-bold serif-title text-white group-hover:text-yellow-500 transition-colors">{champion.name}</h3>
          <span className="text-[7px] text-white/40 font-bold uppercase tracking-widest">{champion.registeredAt}</span>
        </div>
        <p className="text-[9px] text-white/50 font-light truncate mt-0.5">{champion.role}</p>
        
        <div className="flex items-center justify-end mt-3 pt-2 border-t border-white/5">
          <div className="flex items-center space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
             <span className="text-[7px] font-bold tracking-tighter uppercase">View Details</span>
             <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-yellow-500 group-hover:w-full transition-all duration-700"></div>
    </motion.div>
  );
};

export default ChampionCard;
