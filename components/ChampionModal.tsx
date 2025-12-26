
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';

interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
}

const ChampionModal: React.FC<ChampionModalProps> = ({ champion, onClose }) => {
  if (!champion) return null;

  const details = CERT_DETAILS[champion.certType];
  const displayImage = champion.imageUrl.includes('picsum.photos') 
    ? `https://i.pravatar.cc/800?u=${champion.id}` 
    : champion.imageUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-neutral-900 border border-white/10 rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-20 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          {/* Left: Image Section */}
          <div className="md:w-5/12 relative aspect-square md:aspect-auto">
            <img 
              src={displayImage} 
              alt={champion.name}
              className="w-full h-full object-cover grayscale-[0.3]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60"></div>
          </div>

          {/* Right: Content Section */}
          <div className="md:w-7/12 p-8 md:p-14 flex flex-col max-h-[80vh] overflow-y-auto">
            <div className="mb-10">
              <span className={`text-[10px] font-black tracking-[0.3em] uppercase mb-4 block ${details.color}`}>
                {details.title} — {details.desc}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold serif-title text-white mb-2">{champion.name}</h2>
              <div className="flex items-center space-x-3 text-white/40 text-sm font-light">
                <span>{champion.department}</span>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <span>{champion.role}</span>
              </div>
            </div>

            <div className="space-y-10">
              <section>
                <h4 className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-4">The Vision</h4>
                <p className="text-xl md:text-2xl font-light italic text-white/90 leading-relaxed border-l-2 border-yellow-500/30 pl-6">
                  "{champion.vision}"
                </p>
              </section>

              {champion.achievement && (
                <section>
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Core Achievement</h4>
                  <div className="p-6 bg-white/5 border border-white/5 rounded-sm">
                    <p className="text-base text-white/70 leading-relaxed">
                      {champion.achievement}
                    </p>
                  </div>
                </section>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-10 mt-auto border-t border-white/5">
                <div>
                  <span className="text-[9px] text-white/20 uppercase tracking-widest block mb-1">Registered At</span>
                  <span className="text-sm font-mono text-white/60">{champion.registeredAt}</span>
                </div>
                
                {champion.projectUrl && (
                  <a 
                    href={champion.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-colors"
                  >
                    View Project Case
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChampionModal;
