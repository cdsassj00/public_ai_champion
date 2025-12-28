
import React from 'react';
import { motion } from 'framer-motion';

const PlaceholderCard: React.FC<{ index: number; onClick: () => void }> = ({ index, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.05)' }}
      onClick={onClick}
      className="relative aspect-square border-2 border-dashed border-white/20 bg-white/[0.02] backdrop-blur-[2px] flex flex-col items-center justify-center p-4 cursor-pointer group overflow-hidden transition-colors duration-500"
    >
      {/* Decorative inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-50"></div>
      
      {/* Dynamic light sweep effect on hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Silhouette Shape - Enhanced visibility */}
      <div className="w-20 h-20 mb-6 relative">
        <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl group-hover:bg-yellow-500/30 transition-colors duration-700 animate-pulse"></div>
        <svg 
          className="w-full h-full text-white/20 group-hover:text-yellow-500/60 transition-all duration-500 relative z-10 transform group-hover:scale-110" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      <div className="text-center relative z-10">
        <span className="text-[8px] font-black tracking-[0.4em] text-white/40 group-hover:text-yellow-500 transition-colors uppercase leading-relaxed block mb-1">
          Reserved for
        </span>
        <span className="text-[10px] font-black tracking-[0.2em] text-white/20 group-hover:text-white uppercase transition-colors">
          Next Champion
        </span>
      </div>
      
      {/* Quick Action Button - Floating effect */}
      <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
        <span className="px-4 py-1.5 border border-yellow-500/50 text-yellow-500 text-[8px] font-black uppercase tracking-widest bg-yellow-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.2)]">
          Fill this Slot
        </span>
      </div>

      {/* Subtle corner accents */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 group-hover:border-yellow-500/50 transition-colors"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 group-hover:border-yellow-500/50 transition-colors"></div>
    </motion.div>
  );
};

export default PlaceholderCard;
