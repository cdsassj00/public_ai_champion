
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroProps {
  onExplore: () => void;
  onJoin: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore, onJoin }) => {
  const { scrollY } = useScroll();
  
  const yBadge = useTransform(scrollY, [0, 500], [0, -80]);
  const yTitle = useTransform(scrollY, [0, 500], [0, 20]);
  const yDesc = useTransform(scrollY, [0, 500], [0, 40]);
  const yButtons = useTransform(scrollY, [0, 500], [0, 60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
      <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto text-center pb-32">
        <motion.div 
          style={{ y: yBadge }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-block mb-10 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <span className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">
            Excellence in Digital Governance
          </span>
        </motion.div>
        
        <motion.h1 
          style={{ y: yTitle }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-light serif-title leading-tight mb-10 tracking-tight"
        >
          대한민국 공공부문<br />
          <span className="gold-text font-black">AI Champion</span>
        </motion.h1>
        
        <motion.p 
          style={{ y: yDesc }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-base md:text-lg text-white/40 mb-14 max-w-xl mx-auto leading-relaxed font-light"
        >
          대한민국의 디지털 미래를 설계하는 리더들을 위한 고품격 명예의 전당.<br/>
          당신의 업적을 브라우저 DB에 영구히 기록하고 세계와 공유하세요.
        </motion.p>

        <motion.div 
          style={{ y: yButtons }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button 
            onClick={onExplore}
            className="group relative px-14 py-4 bg-white text-black font-bold rounded-sm overflow-hidden transition-all hover:pr-16"
          >
            <span className="relative z-10">전당 입장하기</span>
            <div className="absolute inset-0 bg-yellow-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </button>
          
          <button 
            onClick={onJoin}
            className="px-14 py-4 glass text-white font-bold rounded-sm border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
          >
            내 프로필 등록
          </button>
        </motion.div>
      </motion.div>

      {/* Explore Indicator - Collision Fixed */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
        <span className="text-[9px] tracking-[0.5em] font-medium uppercase text-white/30">SCROLL TO DISCOVER</span>
      </motion.div>

      <motion.div 
        style={{ y: useTransform(scrollY, [0, 1000], [0, -200]), opacity: 0.05 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-yellow-500 rounded-full pointer-events-none"
      />
    </div>
  );
};

export default Hero;
