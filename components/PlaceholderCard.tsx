
import React from 'react';
import { motion } from 'framer-motion';

const PlaceholderCard: React.FC<{ index: number; onClick: () => void }> = ({ index, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          delay: (index % 5) * 0.05 + 0.2
        }
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
      onClick={onClick}
      className="relative aspect-[3/4] border-2 border-dashed border-white/10 bg-white/[0.01] backdrop-blur-[1px] flex flex-col items-center justify-center p-4 cursor-pointer group overflow-hidden transition-colors duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-50"></div>
      
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
        whileHover={{ x: '200%' }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      <div className="w-16 h-16 mb-6 relative">
        <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-colors duration-700 animate-pulse"></div>
        <svg 
          className="w-full h-full text-white/10 group-hover:text-yellow-500/40 transition-all duration-500 relative z-10 transform group-hover:scale-110" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      <div className="text-center relative z-10">
        <span className="text-[8px] font-black tracking-[0.4em] text-white/30 group-hover:text-yellow-500 transition-colors uppercase leading-relaxed block mb-1">
          Next Champion
        </span>
        <span className="text-[10px] font-black tracking-[0.2em] text-white/10 group-hover:text-white uppercase transition-colors">
          Reserved Slot
        </span>
      </div>
      
      <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-white/10 group-hover:border-yellow-500/30 transition-colors"></div>
      <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-white/10 group-hover:border-yellow-500/30 transition-colors"></div>
    </motion.div>
  );
};

export default PlaceholderCard;
