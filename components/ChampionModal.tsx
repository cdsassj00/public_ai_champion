
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { polishVision, polishAchievement } from '../services/geminiService';

const MASTER_PASSWORD = '111111';

interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
  onEdit: (champion: Champion) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (champion: Champion) => void; 
}

const ChampionModal: React.FC<ChampionModalProps> = ({ champion: initialChampion, onClose, onEdit, onDelete, onUpdate }) => {
  const [champion, setChampion] = useState<Champion | null>(initialChampion);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [authAction, setAuthAction] = useState<'EDIT' | 'DELETE' | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [refineStatus, setRefineStatus] = useState<string | null>(null);
  
  const refinedIds = useRef<Set<string>>(new Set());

  const resetAuthFields = useCallback(() => {
    setAuthEmail('');
    setAuthPassword('');
  }, []);

  const autoRefine = useCallback(async (data: Champion) => {
    if (isRefining || refinedIds.current.has(data.id)) return;
    
    const needsVisionRefine = data.vision.length < 25;
    const needsAchievementRefine = !data.achievement || data.achievement.length < 20;
    
    if (!needsVisionRefine && !needsAchievementRefine) return;

    setIsRefining(true);
    setRefineStatus("AI가 기록을 최적화 중...");
    try {
      let refinedVision = data.vision;
      let refinedAchievement = data.achievement || "";

      if (needsVisionRefine) refinedVision = await polishVision(data.name, data.department, data.vision);
      if (needsAchievementRefine) refinedAchievement = await polishAchievement(data.name, data.department, data.role, data.achievement || "");
      
      const updated = { ...data, vision: refinedVision, achievement: refinedAchievement };
      await apiService.updateChampion(updated);
      setChampion(updated);
      onUpdate?.(updated);
      refinedIds.current.add(data.id);
    } catch (error) {
      console.error("Auto Refine Failed:", error);
    } finally {
      setIsRefining(false);
      setRefineStatus(null);
    }
  }, [isRefining, onUpdate]);

  useEffect(() => {
    setChampion(initialChampion);
    if (initialChampion) {
      setIsAuthorized(storageService.isOwner(initialChampion.id));
      setShowAuthPrompt(false);
      setShowDeleteConfirm(false);
      setImageError(false);
      resetAuthFields();
      
      const timer = setTimeout(() => {
        autoRefine(initialChampion);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialChampion?.id]);

  if (!champion) return null;

  const details = CERT_DETAILS[champion.certType];

  const handleManagementAction = (action: 'EDIT' | 'DELETE') => {
    if (isAuthorized || storageService.isOwner(champion.id)) {
      if (action === 'EDIT') onEdit(champion);
      else setShowDeleteConfirm(true);
    } else {
      setAuthAction(action);
      setShowAuthPrompt(true);
    }
  };

  const handleManualRefine = async () => {
    if (isRefining) return;
    setIsRefining(true);
    setRefineStatus("기록물 텍스트 고도화 중...");
    try {
      const refinedVision = await polishVision(champion.name, champion.department, champion.vision);
      const refinedAchievement = await polishAchievement(champion.name, champion.department, champion.role, champion.achievement || "");
      
      const updated = { ...champion, vision: refinedVision, achievement: refinedAchievement };
      await apiService.updateChampion(updated);
      setChampion(updated);
      onUpdate?.(updated);
      alert('AI가 포부 및 업적 프로젝트 고도화를 완료했습니다.');
    } catch (error) {
      alert('AI 고도화 중 오류가 발생했습니다.');
    } finally {
      setIsRefining(false);
      setRefineStatus(null);
    }
  };

  const verifyCredentials = () => {
    const inputEmail = authEmail.toLowerCase().trim();
    const inputPassword = authPassword.trim();
    if (inputPassword === MASTER_PASSWORD) {
      storageService.addOwnership(champion.id);
      setIsAuthorized(true);
      setShowAuthPrompt(false);
      if (authAction === 'EDIT') onEdit(champion);
      else setShowDeleteConfirm(true);
      return;
    }
    if (inputEmail === (champion.email || "").toLowerCase().trim() && inputPassword === (champion.password || "").trim()) {
      storageService.addOwnership(champion.id);
      setIsAuthorized(true);
      setShowAuthPrompt(false);
      if (authAction === 'EDIT') onEdit(champion);
      else setShowDeleteConfirm(true);
    } else {
      alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const executeDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await apiService.deleteChampion(champion.id);
      storageService.removeOwnership(champion.id);
      alert('삭제되었습니다.');
      onDelete?.(champion.id);
      onClose();
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/98 backdrop-blur-2xl" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.98, y: 20 }} 
          className={`relative w-full max-w-6xl bg-neutral-950 border ${details.border} rounded-sm overflow-hidden flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh] shadow-[0_0_150px_rgba(0,0,0,1)] ${details.glow}`}
        >
          {/* Rank Glow Top Bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${details.accent} z-50 shadow-[0_0_20px_currentColor]`}></div>

          <button onClick={onClose} className="absolute top-4 right-4 z-[70] text-white/40 hover:text-white transition-all bg-black/60 p-2.5 rounded-full border border-white/10 backdrop-blur-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <AnimatePresence>
            {showAuthPrompt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[80] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 text-center">
                <div className="max-w-xs w-full space-y-6">
                  <h3 className="text-xl font-bold serif-title gold-text">기록 관리 인증</h3>
                  <div className="space-y-3">
                    <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 px-4 py-3.5 text-sm rounded-sm outline-none focus:border-yellow-500 transition-all font-light" placeholder="이메일 주소" />
                    <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 px-4 py-3.5 text-sm rounded-sm outline-none focus:border-yellow-500 transition-all font-light" placeholder="비밀번호" onKeyDown={(e) => e.key === 'Enter' && verifyCredentials()} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAuthPrompt(false)} className="flex-1 py-3.5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">취소</button>
                    <button onClick={verifyCredentials} className="flex-1 py-3.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest shadow-xl">인증하기</button>
                  </div>
                </div>
              </motion.div>
            )}
            {showDeleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[80] bg-red-950/98 backdrop-blur-3xl flex items-center justify-center p-6 text-center">
                <div className="max-w-xs w-full space-y-6">
                  <h3 className="text-2xl font-black serif-title text-white uppercase tracking-widest">기록 소멸</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-light break-keep">기록을 영구히 삭제하시겠습니까?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3.5 border border-white/10 text-[10px] font-black tracking-widest">유지하기</button>
                    <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-3.5 bg-red-600 text-white text-[10px] font-black tracking-widest shadow-2xl">삭제</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-72 sm:h-96 md:h-auto md:w-[450px] shrink-0 relative bg-black overflow-hidden md:border-r border-white/5 flex items-center justify-center">
            {isRefining && (
              <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className={`w-12 h-12 border-4 ${details.border} border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_currentColor]`}></div>
                <p className={`text-[11px] font-black ${details.color} uppercase tracking-widest animate-pulse`}>{refineStatus}</p>
              </div>
            )}
            {!imageError ? (
              <>
                <img src={champion.imageUrl} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125" alt="Backdrop" />
                <img src={champion.imageUrl} alt={champion.name} onError={() => setImageError(true)} className="relative z-10 w-full h-full object-contain contrast-[1.1] brightness-[1.05] object-center transition-transform duration-1000 hover:scale-110" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-neutral-900 z-10">
                <div className={`w-24 h-24 rounded-full ${details.accent} opacity-20 flex items-center justify-center mb-6 shadow-inner`}>
                  <span className="text-4xl font-black">{champion.name[0]}</span>
                </div>
                <span className="text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase">No Portrait Available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80 pointer-events-none z-15"></div>
            
            {/* Rank Badge on Modal Image */}
            <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
               <div className={`px-5 py-2 ${details.rankBg} backdrop-blur-3xl border ${details.border} rounded-full flex items-center space-x-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)]`}>
                 <div className={`relative flex h-3 w-3`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${details.accent} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${details.accent}`}></span>
                 </div>
                 <span className={`text-[11px] font-black tracking-[0.5em] uppercase ${details.color} drop-shadow-[0_0_10px_currentColor]`}>
                   {champion.certType} RANK ELITE
                 </span>
               </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-10 md:p-16 lg:p-20 custom-scrollbar relative z-10">
              <div className="mb-14">
                <div className={`inline-block px-5 py-2 mb-10 text-[11px] font-black tracking-[0.6em] border ${details.border} ${details.color} uppercase bg-white/5 backdrop-blur-xl rounded-sm shadow-2xl drop-shadow-[0_0_8px_currentColor]`}>
                  {details.title}
                </div>
                <h2 className="text-5xl md:text-8xl font-black serif-title text-white mb-8 tracking-tighter leading-tight break-keep drop-shadow-2xl">{champion.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-white/60 text-sm md:text-lg font-light italic">
                  <span className="px-6 py-2.5 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-md">{champion.department}</span>
                  <span className="px-6 py-2.5 bg-white/[0.04] border border-white/10 rounded-full backdrop-blur-md">{champion.role}</span>
                </div>
              </div>

              <div className="space-y-16 md:space-y-24 pb-12">
                <section className="relative pl-12">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${details.accent.replace('bg-', 'from-')}/60 to-transparent shadow-[0_0_15px_currentColor]`}></div>
                  <div className="mb-6">
                    <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] ${details.color} opacity-60 flex items-center gap-3`}>
                      <span className="w-8 h-[1px] bg-current opacity-30"></span> AI MISSION & VISION
                    </h4>
                  </div>
                  <p className="text-2xl md:text-4xl font-light italic text-white leading-[1.2] break-keep">
                    "{champion.vision}"
                  </p>
                </section>
                
                {champion.achievement && (
                  <section>
                    <div className="mb-8">
                       <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] ${details.color} opacity-60 flex items-center gap-3`}>
                        <span className="w-8 h-[1px] bg-current opacity-30"></span> KEY ACHIEVEMENTS
                      </h4>
                    </div>
                    <div className={`p-10 md:p-14 bg-white/[0.02] border border-white/5 backdrop-blur-3xl relative rounded-sm shadow-inner overflow-hidden`}>
                      <div className={`absolute top-0 left-0 w-2 h-full ${details.accent} opacity-80 shadow-[0_0_20px_currentColor]`}></div>
                      {/* Decorative Background Icon */}
                      <div className={`absolute -right-10 -bottom-10 text-[12rem] font-black opacity-[0.02] pointer-events-none ${details.color}`}>
                        {details.icon}
                      </div>
                      <p className="text-lg md:text-2xl text-white/90 leading-relaxed font-light break-keep relative z-10">{champion.achievement}</p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            <div className="p-8 md:p-12 border-t border-white/5 bg-neutral-950/98 backdrop-blur-3xl flex flex-wrap items-center justify-end gap-4 relative z-20">
              {isAuthorized && (
                <button 
                  onClick={handleManualRefine}
                  disabled={isRefining}
                  className={`mr-auto px-6 py-4 bg-white/5 border ${details.border} ${details.color} text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm flex items-center gap-3 shadow-xl`}
                >
                  <span className="text-sm animate-pulse">✨</span> {isRefining ? 'REFASHIONING...' : 'AI RECORD POLISH'}
                </button>
              )}
              
              <button onClick={() => handleManagementAction('DELETE')} disabled={isDeleting} className="px-8 py-4 border border-white/5 text-white/20 text-[11px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-500/30 transition-all rounded-sm">TERMINATE</button>
              <button onClick={() => handleManagementAction('EDIT')} className={`flex-1 md:flex-none px-14 py-5 border ${details.border} ${details.color} text-[12px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-500 rounded-sm shadow-2xl drop-shadow-[0_0_10px_currentColor]`}>EDIT RECORD</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChampionModal;
