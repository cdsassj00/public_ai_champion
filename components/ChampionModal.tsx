
import React, { useState, useEffect } from 'react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [authAction, setAuthAction] = useState<'EDIT' | 'DELETE' | null>(null);
  
  // 인증 여부를 실시간으로 반영하기 위한 로컬 상태
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (champion) {
      // 컴포넌트 마운트 시 혹은 챔피언 변경 시 권한 체크 (메모리+로컬스토리지)
      setIsAuthorized(storageService.isOwner(champion.id));
      setShowAuthPrompt(false);
      setShowDeleteConfirm(false);
      resetAuthFields();
    }
  }, [champion]);

  if (!champion) return null;

  const details = CERT_DETAILS[champion.certType];

  const handleManagementAction = (action: 'EDIT' | 'DELETE') => {
    // 최신 권한 상태 확인
    if (isAuthorized || storageService.isOwner(champion.id)) {
      if (action === 'EDIT') onEdit(champion);
      else setShowDeleteConfirm(true);
    } else {
      // 권한이 없다면 인증 창 띄우기
      setAuthAction(action);
      setShowAuthPrompt(true);
    }
  };

  const verifyCredentials = () => {
    // 대소문자 구분 없이 이메일 비교 및 비밀번호 확인
    if (authEmail.toLowerCase().trim() === champion.email.toLowerCase().trim() && authPassword === champion.password) {
      // 메모리에 권한 등록 (새로고침 전까지 유지)
      storageService.addOwnership(champion.id);
      setIsAuthorized(true);
      setShowAuthPrompt(false);
      resetAuthFields();
      
      // 즉시 다음 단계 진행
      if (authAction === 'EDIT') {
        onEdit(champion);
      } else {
        setShowDeleteConfirm(true);
      }
    } else {
      alert('등록된 이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const resetAuthFields = () => {
    setAuthEmail('');
    setAuthPassword('');
  };

  const executeDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      // DB 삭제
      await apiService.deleteChampion(champion.id);
      // 권한 정보 삭제
      storageService.removeOwnership(champion.id);
      
      alert('성공적으로 삭제되었습니다.');
      onDelete?.(champion.id);
      onClose();
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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

          {/* 본인 인증 모달 오버레이 */}
          <AnimatePresence>
            {showAuthPrompt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
                <div className="max-w-sm w-full space-y-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold serif-title text-white mb-2">본인 확인 필요</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] leading-relaxed break-keep">
                      임베디드 환경에서는 보안상 자동 로그인이 제한됩니다.<br/>
                      등록 시 사용한 정보를 입력하여 권한을 승인받으세요.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Registered Email</label>
                      <input 
                        autoFocus
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition-all font-mono"
                        placeholder="이메일 주소"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Secure Password</label>
                      <input 
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-yellow-500 transition-all font-mono"
                        placeholder="비밀번호"
                        onKeyDown={(e) => e.key === 'Enter' && verifyCredentials()}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => { setShowAuthPrompt(false); resetAuthFields(); }} className="flex-1 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">취소</button>
                    <button onClick={verifyCredentials} className="flex-1 py-4 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-yellow-400 transition-colors">권한 승인</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 삭제 확인 오버레이 */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] bg-red-950/90 backdrop-blur-3xl flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full space-y-8">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black serif-title mb-3 text-white uppercase tracking-tighter">Archive Deletion</h3>
                    <p className="text-sm text-white/70 font-light break-keep">이 기록을 명예의 전당에서 영구히 삭제하시겠습니까?<br/>데이터베이스에서 즉시 소멸되며 복구할 수 없습니다.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all">취소</button>
                    <button 
                      onClick={executeDelete} 
                      disabled={isDeleting}
                      className={`flex-1 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-red-500 transition-all ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isDeleting ? '처리 중...' : '영구 삭제 승인'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 사이드 이미지 바 */}
          <div className="h-52 sm:h-72 md:h-auto md:w-[350px] lg:w-[400px] shrink-0 relative bg-neutral-900 overflow-hidden md:border-r border-white/5">
            <img src={champion.imageUrl} alt={champion.name} className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] object-top" />
            <div className={`absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90`}></div>
            <div className="absolute top-6 left-6 flex flex-col gap-2">
               <div className={`px-4 py-1.5 bg-black/80 backdrop-blur-2xl border-2 ${details.border} rounded-full flex items-center space-x-2.5`}>
                 <div className={`w-2 h-2 rounded-full ${details.accent} animate-pulse`}></div>
                 <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${details.color}`}>{champion.certType} RANK ELITE</span>
               </div>
            </div>
          </div>

          {/* 상세 정보 영역 */}
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
              </div>
            </div>

            {/* 하단 제어부 */}
            <div className="p-6 md:p-8 border-t border-white/5 bg-neutral-950/80 backdrop-blur-2xl flex flex-wrap items-center justify-end gap-3 relative z-20">
              <button 
                onClick={() => handleManagementAction('DELETE')}
                disabled={isDeleting}
                className="px-6 py-3.5 border border-red-900/30 text-red-500/40 text-[9px] font-black uppercase tracking-widest hover:bg-red-900/20 hover:text-red-500 transition-all rounded-sm"
              >
                {isDeleting ? '처리 중...' : '기록 삭제'}
              </button>
              
              <button 
                onClick={() => handleManagementAction('EDIT')}
                className={`px-8 py-3.5 border-2 ${details.border} ${details.color} text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black hover:border-white transition-all duration-500 shadow-lg active:scale-95 rounded-sm`}
              >
                정보 수정
              </button>
              
              {champion.projectUrl && (
                <a href={champion.projectUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-yellow-500 transition-all text-center rounded-sm">성과 확인</a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChampionModal;
