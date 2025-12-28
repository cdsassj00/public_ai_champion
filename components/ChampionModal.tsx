
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
  onEdit: (champion: Champion) => void;
  onDelete?: (id: string) => void;
}

const ChampionModal: React.FC<ChampionModalProps> = ({ champion, onClose, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authAction, setAuthAction] = useState<'EDIT' | 'DELETE' | null>(null);

  if (!champion) return null;

  const details = CERT_DETAILS[champion.certType];
  const isOwner = storageService.isOwner(champion.id);
  
  // 이미지는 이제 Supabase Storage의 Public URL 또는 샘플 이미지
  const displayImage = champion.imageUrl;

  const handleManagementAction = (action: 'EDIT' | 'DELETE') => {
    if (isOwner) {
      if (action === 'EDIT') onEdit(champion);
      else confirmDelete();
    } else {
      setAuthAction(action);
      setShowAuthPrompt(true);
    }
  };

  const verifyCredentials = () => {
    if (authEmail.toLowerCase().trim() === champion.email.toLowerCase().trim() && authPassword === champion.password) {
      storageService.addOwnership(champion.id);
      if (authAction === 'EDIT') onEdit(champion);
      else confirmDelete();
      setShowAuthPrompt(false);
      resetAuthFields();
    } else {
      alert('인증 정보가 올바르지 않습니다.');
    }
  };

  const resetAuthFields = () => {
    setAuthEmail('');
    setAuthPassword('');
  };

  const confirmDelete = async () => {
    if (window.confirm('이 고귀한 기록을 명예의 전당에서 영구적으로 삭제하시겠습니까?')) {
      setIsDeleting(true);
      try {
        await apiService.deleteChampion(champion.id);
        alert('성공적으로 삭제되었습니다.');
        onDelete?.(champion.id);
        onClose();
      } catch (e) {
        alert('삭제 중 오류가 발생했습니다.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/98 backdrop-blur-2xl" />
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className={`relative w-full max-w-5xl bg-neutral-950 border ${details.border} rounded-sm overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col md:flex-row h-full max-h-[92vh] md:max-h-[85vh]`}>
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${details.accent} z-50 shadow-[0_0_20px_rgba(0,0,0,0.8)]`}></div>

          <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white/20 hover:text-white transition-all hover:rotate-90 duration-500 bg-white/5 p-2 rounded-full backdrop-blur-xl border border-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <AnimatePresence>
            {showAuthPrompt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 text-center">
                <div className="max-w-sm w-full space-y-6">
                  <div>
                    <h3 className="text-xl font-bold serif-title mb-2">Registry Access Control</h3>
                    <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] mb-8">Secure Identity Verification Required</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col items-start space-y-2">
                       <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Email Address</label>
                       <input 
                         autoFocus
                         type="email"
                         value={authEmail}
                         onChange={(e) => setAuthEmail(e.target.value)}
                         className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                         placeholder="Registered Email"
                       />
                    </div>
                    <div className="flex flex-col items-start space-y-2">
                       <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Password</label>
                       <input 
                         type="password"
                         value={authPassword}
                         onChange={(e) => setAuthPassword(e.target.value)}
                         className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                         placeholder="Password"
                         onKeyDown={(e) => e.key === 'Enter' && verifyCredentials()}
                       />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => { setShowAuthPrompt(false); resetAuthFields(); }} className="flex-1 py-3 border border-white/10 text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">Cancel</button>
                    <button onClick={verifyCredentials} className="flex-1 py-3 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-yellow-400 transition-colors">Confirm Identity</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-56 sm:h-72 md:h-auto md:w-[350px] lg:w-[400px] shrink-0 relative bg-neutral-900 overflow-hidden md:border-r border-white/5">
            <img src={displayImage} alt={champion.name} className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] object-top" />
            <div className={`absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90`}></div>
            <div className="absolute top-6 left-6 flex flex-col gap-2">
               <div className={`px-4 py-1.5 bg-black/80 backdrop-blur-2xl border-2 ${details.border} rounded-full flex items-center space-x-2.5`}>
                 <div className={`w-2 h-2 rounded-full ${details.accent} animate-pulse`}></div>
                 <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${details.color}`}>{champion.certType} RANK ELITE</span>
               </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-10 h-[1px] ${details.accent}`}></div>
                <span className={`text-[10px] font-black tracking-[0.5em] uppercase ${details.color}`}>RECORD_ID: {champion.id.split('_')[1]?.substring(0, 6)}</span>
              </div>
              <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.3em]">National Cloud Innovation Repository</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-8 md:p-14 custom-scrollbar relative z-10">
              <div className="mb-10">
                <div className={`inline-block px-5 py-2 mb-8 text-[11px] font-black tracking-[0.5em] border-2 ${details.border} ${details.color} uppercase bg-black/40 shadow-2xl rounded-sm`}>{details.title}</div>
                <h2 className="text-4xl md:text-6xl font-black serif-title text-white mb-5 tracking-tighter break-keep leading-tight">{champion.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-white/50 text-[11px] md:text-sm font-medium">
                  <span className="px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full">{champion.department}</span>
                  <span className="px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full">{champion.role}</span>
                </div>
              </div>

              <div className="space-y-12 md:space-y-16">
                <section className="relative">
                  <div className={`absolute -left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b ${details.accent.replace('bg-', 'from-')}/50 to-transparent`}></div>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${details.color} mb-4 opacity-40`}>The Visionary Statement</h4>
                  <p className="text-xl md:text-3xl font-light italic text-white leading-tight break-keep">"{champion.vision}"</p>
                </section>
                {champion.achievement && (
                  <section>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${details.color} mb-4 opacity-40`}>Impact Assessment</h4>
                    <div className={`p-8 bg-white/[0.02] border ${details.border} border-opacity-10 backdrop-blur-xl relative rounded-sm`}>
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${details.accent}`}></div>
                      <p className="text-sm md:text-lg text-white/80 leading-relaxed font-light break-keep">{champion.achievement}</p>
                    </div>
                  </section>
                )}
                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
                  <div className="group">
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] block font-black mb-2">Archive Synced</span>
                    <span className="text-sm font-mono text-white/70 tracking-widest">{champion.registeredAt}</span>
                  </div>
                  <div className="group">
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] block font-black mb-2">Verified Influence</span>
                    <span className={`text-sm font-black tracking-[0.2em] uppercase ${details.color}`}>{champion.viewCount || 0} IMPACTS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-white/5 bg-neutral-950/80 backdrop-blur-2xl flex flex-wrap items-center justify-end gap-3 relative z-20">
              <button 
                onClick={() => handleManagementAction('DELETE')}
                disabled={isDeleting}
                className="px-6 py-3.5 border border-red-900/30 text-red-500/40 text-[9px] font-black uppercase tracking-widest hover:bg-red-900/20 hover:text-red-500 transition-all rounded-sm"
              >
                {isDeleting ? 'Erasing...' : 'Delete Archive'}
              </button>
              
              <button 
                onClick={() => handleManagementAction('EDIT')}
                className={`px-8 py-3.5 border-2 ${details.border} ${details.color} text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black hover:border-white transition-all duration-500 shadow-lg active:scale-95 rounded-sm`}
              >
                Update Identity
              </button>
              
              {champion.projectUrl && (
                <a href={champion.projectUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-yellow-500 transition-all text-center rounded-sm">Explore Achievement</a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChampionModal;
