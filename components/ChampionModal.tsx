
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';
import { storageService } from '../services/storageService';

interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
  onEdit: (champion: Champion) => void;
}

const ChampionModal: React.FC<ChampionModalProps> = ({ champion, onClose, onEdit }) => {
  if (!champion) return null;

  const details = CERT_DETAILS[champion.certType];
  const isOwner = storageService.isOwner(champion.id);
  const displayImage = champion.imageUrl.includes('picsum.photos') 
    ? `https://i.pravatar.cc/800?u=${champion.id}` 
    : champion.imageUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 20 }}
          className={`relative w-full max-w-5xl bg-neutral-950 border ${details.border} rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-h-[85vh]`}
        >
          {/* Top Rank Accent Line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${details.accent} z-50`}></div>

          <button 
            onClick={onClose}
            className="absolute top-5 right-5 z-50 text-white/30 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          {/* Left Side: Photo (Fixed Width to prevent oversized image) */}
          <div className="md:w-[380px] shrink-0 relative bg-neutral-900 overflow-hidden border-r border-white/5">
            <img 
              src={displayImage} 
              alt={champion.name}
              className="w-full h-full object-cover grayscale-[0.1] contrast-[1.1]"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60`}></div>
            
            {/* Status Badge Over Image */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
               <div className={`px-3 py-1 bg-black/60 backdrop-blur-md border ${details.border} rounded-full flex items-center space-x-2`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${details.accent} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
                 <span className={`text-[9px] font-black tracking-widest uppercase ${details.color}`}>
                   {champion.status === 'APPROVED' ? 'Certified Master' : 'Verified Member'}
                 </span>
               </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <span className={`text-[10px] font-black tracking-[0.4em] uppercase block mb-1 ${details.color}`}>Official Digital Architect</span>
              <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest leading-relaxed">
                AI Innovation Hall of Fame<br/>Republic of Korea
              </p>
            </div>
          </div>

          {/* Right Side: Content (Scrollable but fixed within modal) */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 md:p-12 custom-scrollbar">
              <div className="mb-8">
                <div className={`inline-block px-2 py-0.5 mb-4 text-[9px] font-black tracking-widest border ${details.border} ${details.color} uppercase`}>
                  {details.title}
                </div>
                <h2 className="text-4xl md:text-5xl font-black serif-title text-white mb-3 tracking-tighter">{champion.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-white/40 text-xs font-medium">
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">{champion.department}</span>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">{champion.role}</span>
                </div>
              </div>

              <div className="space-y-10">
                <section>
                  <div className="flex items-center space-x-2 mb-4 opacity-40">
                     <div className={`w-1 h-1 rounded-full ${details.accent}`}></div>
                     <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">The Vision</h4>
                  </div>
                  <p className="text-xl md:text-2xl font-light italic text-white/90 leading-snug">
                    "{champion.vision}"
                  </p>
                </section>

                {champion.achievement && (
                  <section>
                    <div className="flex items-center space-x-2 mb-4 opacity-40">
                       <div className={`w-1 h-1 rounded-full ${details.accent}`}></div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Core Achievement</h4>
                    </div>
                    <div className={`p-6 bg-white/[0.02] border-l-2 ${details.border} backdrop-blur-sm`}>
                      <p className="text-base text-white/70 leading-relaxed font-light">
                        {champion.achievement}
                      </p>
                    </div>
                  </section>
                )}

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div>
                    <span className="text-[9px] text-white/20 uppercase tracking-widest block mb-1 font-bold">Authenticated At</span>
                    <span className="text-sm font-mono text-white/60">{champion.registeredAt}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/20 uppercase tracking-widest block mb-1 font-bold">Public Views</span>
                    <span className="text-sm font-bold text-white/60 tracking-tighter uppercase">{champion.viewCount?.toLocaleString() || 0} Interactions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Sticky */}
            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-end gap-4">
              {isOwner && (
                <button 
                  onClick={() => onEdit(champion)}
                  className={`w-full sm:w-auto px-8 py-3 border ${details.border} ${details.color} text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all`}
                >
                  Edit Profile
                </button>
              )}
              {champion.projectUrl && (
                <a 
                  href={champion.projectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all text-center"
                >
                  View Case Study
                </a>
              )}
              {!champion.projectUrl && !isOwner && (
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  Endorsed by Ministry of Interior
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChampionModal;
