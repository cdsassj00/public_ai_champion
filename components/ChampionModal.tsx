
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Champion } from '../types';
import { CERT_DETAILS } from '../constants';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { polishVision, polishAchievement, transformPortrait } from '../services/geminiService';

const MASTER_PASSWORD = '111111';

interface ChampionModalProps {
  champion: Champion | null;
  onClose: () => void;
  onEdit: (champion: Champion) => void;
  onDelete?: (id: string) => void;
}

const ChampionModal: React.FC<ChampionModalProps> = ({ champion: initialChampion, onClose, onEdit, onDelete }) => {
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

  const resetAuthFields = useCallback(() => {
    setAuthEmail('');
    setAuthPassword('');
  }, []);

  const autoRefine = useCallback(async (data: Champion) => {
    if (isRefining) return;
    
    const needsVisionRefine = data.vision.length < 25;
    const needsAchievementRefine = !data.achievement || data.achievement.length < 20;
    const needsImageRefine = !data.imageUrl.includes('profile_') && !data.imageUrl.includes('auto_profile');
    
    if (!needsVisionRefine && !needsAchievementRefine && !needsImageRefine) return;

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
    } catch (error) {
      console.error("Auto Refine Failed:", error);
    } finally {
      setIsRefining(false);
      setRefineStatus(null);
    }
  }, [isRefining]);

  useEffect(() => {
    setChampion(initialChampion);
    if (initialChampion) {
      setIsAuthorized(storageService.isOwner(initialChampion.id));
      setShowAuthPrompt(false);
      setShowDeleteConfirm(false);
      setImageError(false);
      resetAuthFields();
      autoRefine(initialChampion);
    }
  }, [initialChampion, resetAuthFields, autoRefine]);

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
    setRefineStatus("전문 정장 프로필 사진 생성 및 문구 고도화 중...");
    try {
      // 1. 텍스트 고도화
      const refinedVision = await polishVision(champion.name, champion.department, champion.vision);
      const refinedAchievement = await polishAchievement(champion.name, champion.department, champion.role, champion.achievement || "");
      
      // 2. 이미지 변환
      let finalImageUrl = champion.imageUrl;
      try {
        const resp = await fetch(champion.imageUrl);
        const blob = await resp.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const [header, data] = base64.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const aiResultBase64 = await transformPortrait(data, mime);
        finalImageUrl = await apiService.uploadImage(aiResultBase64, `manual_profile_${champion.name}`);
      } catch (imgErr) {
        console.warn("Image transform failed during manual refine, skipping image part.");
      }

      const updated = { ...champion, vision: refinedVision, achievement: refinedAchievement, imageUrl: finalImageUrl };
      await apiService.updateChampion(updated);
      setChampion(updated);
      alert('AI가 전문 정장 프로필 사진 및 기록물 고도화를 완료했습니다.');
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
          className={`relative w-full max-w-5xl bg-neutral-950 border ${details.border} rounded-sm overflow-hidden flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh] shadow-[0_0_120px_rgba(0,0,0,1)]`}
        >
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${details.accent} z-50`}></div>

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
                  <p className="text-xs text-white/60 leading-relaxed font-light break-keep">이 챔피언의 기록을 명예의 전당에서 영구히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3.5 border border-white/10 text-[10px] font-black tracking-widest">유지하기</button>
                    <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-3.5 bg-red-600 text-white text-[10px] font-black tracking-widest shadow-2xl">{isDeleting ? '소멸 중' : '영구 삭제'}</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-72 sm:h-96 md:h-auto md:w-[400px] lg:w-[450px] shrink-0 relative bg-black overflow-hidden md:border-r border-white/5 flex items-center justify-center">
            {isRefining && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest animate-pulse">{refineStatus}</p>
              </div>
            )}
            {!imageError ? (
              <>
                <img src={champion.imageUrl} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125" alt="Backdrop" />
                <img src={champion.imageUrl} alt={champion.name} onError={() => setImageError(true)} className="relative z-10 w-full h-full object-contain contrast-[1.05] object-center transition-transform duration-1000 hover:scale-105" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-neutral-900 z-10">
                <div className={`w-20 h-20 rounded-full ${details.accent} opacity-20 flex items-center justify-center mb-6`}>
                  <span className="text-3xl font-bold">{champion.name[0]}</span>
                </div>
                <span className="text-xs font-bold text-white/30 tracking-[0.5em] uppercase">No Profile Photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60 pointer-events-none z-15"></div>
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
               <div className={`px-4 py-1.5 bg-black/80 backdrop-blur-2xl border ${details.border} rounded-full flex items-center space-x-2.5 shadow-2xl`}>
                 <div className={`w-2 h-2 rounded-full ${details.accent} animate-pulse`}></div>
                 <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${details.color}`}>{champion.certType} RANK ELITE</span>
               </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-8 md:p-14 lg:p-16 custom-scrollbar relative z-10">
              <div className="mb-12">
                <div className={`inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.5em] border ${details.border} ${details.color} uppercase bg-black/40 rounded-sm shadow-xl`}>
                  {details.title}
                </div>
                <h2 className="text-4xl md:text-7xl font-black serif-title text-white mb-6 tracking-tighter leading-tight break-keep">{champion.name}</h2>
                <div className="flex flex-wrap items-center gap-2.5 text-white/50 text-xs md:text-base font-light">
                  <span className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">{champion.department}</span>
                  <span className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">{champion.role}</span>
                </div>
              </div>

              <div className="space-y-12 md:space-y-16 pb-12">
                <section className="relative">
                  <div className={`absolute -left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b ${details.accent.replace('bg-', 'from-')}/50 to-transparent`}></div>
                  <div className="flex items-center justify-between mb-5">
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${details.color} opacity-40`}>The Visionary Statement</h4>
                  </div>
                  <p className="text-xl md:text-3xl font-light italic text-white/95 leading-tight break-keep">"{champion.vision}"</p>
                </section>
                
                {champion.achievement && (
                  <section>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${details.color} mb-5 opacity-40`}>Impact Assessment</h4>
                    <div className={`p-8 md:p-10 bg-white/[0.02] border border-white/5 backdrop-blur-3xl relative rounded-sm shadow-inner`}>
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${details.accent} shadow-2xl`}></div>
                      <p className="text-sm md:text-xl text-white/80 leading-relaxed font-light break-keep">{champion.achievement}</p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            <div className="p-6 md:p-10 border-t border-white/5 bg-neutral-950/95 backdrop-blur-3xl flex flex-wrap items-center justify-end gap-3 relative z-20">
              {isAuthorized && (
                <button 
                  onClick={handleManualRefine}
                  disabled={isRefining}
                  className="mr-auto px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all rounded-sm flex items-center gap-2"
                >
                  <span className="text-xs">✨</span> {isRefining ? 'AI 고도화 중' : 'AI 프로필 및 기록물 고도화'}
                </button>
              )}
              
              <button onClick={() => handleManagementAction('DELETE')} disabled={isDeleting} className="px-6 py-4 border border-white/5 text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-all rounded-sm">삭제</button>
              <button onClick={() => handleManagementAction('EDIT')} className={`flex-1 md:flex-none px-10 py-4 border ${details.border} ${details.color} text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500 rounded-sm shadow-2xl`}>기록 수정</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChampionModal;
