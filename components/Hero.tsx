
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroProps {
  onExplore: () => void;
  onJoin: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore, onJoin }) => {
  const { scrollY } = useScroll();
  
  const yBadge = useTransform(scrollY, [0, 500], [0, -40]);
  const yTitle = useTransform(scrollY, [0, 500], [0, 10]);
  const yDesc = useTransform(scrollY, [0, 500], [0, 20]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden px-6 pt-16">
      <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto text-center pb-20 md:pb-32">
        <motion.div 
          style={{ y: yBadge }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-6 md:mb-10 px-4 md:px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <span className="text-[8px] md:text-[10px] font-bold tracking-[0.3em] text-white/60 uppercase">
            디지털 정부 혁신의 주역
          </span>
        </motion.div>
        
        <motion.h1 
          style={{ y: yTitle }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-7xl font-light serif-title leading-tight mb-6 md:mb-10 tracking-tight break-keep"
        >
          대한민국 공공부문<br />
          <span className="gold-text font-black">AI 챔피언 명예의 전당</span>
        </motion.h1>
        
        <motion.p 
          style={{ y: yDesc }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-sm md:text-lg text-white/40 mb-10 md:mb-14 max-w-xl mx-auto leading-relaxed font-light break-keep px-4"
        >
          대한민국의 디지털 미래를 설계하는 리더들을 위한 고품격 기록소. 당신의 혁신적인 업적을 국가 데이터베이스에 영구히 기록하세요.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
        >
          <button 
            onClick={onExplore}
            className="w-full sm:w-auto group relative px-10 md:px-14 py-3.5 md:py-4 bg-white text-black font-bold rounded-sm overflow-hidden transition-all"
          >
            <span className="relative z-10">전당 입장하기</span>
            <div className="absolute inset-0 bg-yellow-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </button>
          
          <button 
            onClick={onJoin}
            className="w-full sm:w-auto px-10 md:px-14 py-3.5 md:py-4 glass text-white font-bold rounded-sm border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] md:text-xs"
          >
            AI 챔피언 프로필 등록
          </button>
        </motion.div>
      </motion.div>

      {/* Explore Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4"
      >
        <div className="w-[1px] h-8 md:h-10 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
        <span className="text-[8px] tracking-[0.4em] font-medium uppercase text-white/20">둘러보기</span>
      </motion.div>
    </div>
  );
};

export default Hero;
