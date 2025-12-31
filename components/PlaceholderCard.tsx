
import React from 'react';
import { motion } from 'framer-motion';

const PlaceholderCard: React.FC<{ index: number; onClick: () => void }> = ({ index, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 0.65, // 기존 0.4에서 상향하여 가독성 확보
        scale: 1,
        transition: {
          delay: (index % 10) * 0.03
        }
      }}
      whileHover={{ 
        opacity: 1, 
        scale: 1.02, 
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        transition: { duration: 0.3 }
      }}
      onClick={onClick}
      className="relative aspect-[3/4] border-2 border-dashed border-white/10 bg-white/[0.01] backdrop-blur-[1px] flex flex-col items-center justify-center p-6 cursor-pointer group overflow-hidden transition-all duration-500 rounded-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.03] to-transparent opacity-50"></div>
      
      {/* 은은한 광원 효과 */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent group-hover:via-white/[0.05] transition-all duration-1000"></div>

      <div className="w-14 h-14 mb-8 relative">
        <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all duration-700 animate-pulse"></div>
        <svg 
          className="w-full h-full text-white/10 group-hover:text-yellow-500/40 transition-all duration-500 relative z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <div className="text-center relative z-10 px-2">
        <span className="text-[9px] font-black tracking-[0.4em] text-white/20 group-hover:text-yellow-500/60 transition-colors uppercase block mb-4">
          Reserve Your Spot
        </span>
        <div className="space-y-2">
          <p className="text-[13px] md:text-[15px] font-bold text-white/30 group-hover:text-white transition-colors break-keep leading-tight duration-500 serif-title">
            당신을 세상에 보여주세요
          </p>
          <div className="w-8 h-[1px] bg-white/10 mx-auto group-hover:w-16 group-hover:bg-yellow-500/30 transition-all duration-700"></div>
        </div>
      </div>
      
      {/* 미니 코너 가이드 */}
      <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-white/5 group-hover:border-yellow-500/30 transition-colors"></div>
      <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-white/5 group-hover:border-yellow-500/30 transition-colors"></div>
    </motion.div>
  );
};

export default PlaceholderCard;
