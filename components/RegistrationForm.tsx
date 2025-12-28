
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CertificationType, Champion } from '../types';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { polishVision, transformPortrait, suggestProfileContent } from '../services/geminiService';

interface RegistrationFormProps {
  onSuccess: () => void;
  editData?: Champion | null;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, editData }) => {
  const isEditMode = !!editData;
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    role: '',
    certType: CertificationType.GREEN,
    vision: '',
    imageUrl: '',
    projectUrl: '',
    achievement: '',
    email: '',
    password: ''
  });

  // AI 변환을 위해 로컬에서 가지고 있을 Base64 데이터 (CORS fetch 방지용)
  const [localBase64, setLocalBase64] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        department: editData.department,
        role: editData.role,
        certType: editData.certType,
        vision: editData.vision,
        imageUrl: editData.imageUrl,
        projectUrl: editData.projectUrl || '',
        achievement: editData.achievement || '',
        email: editData.email || '',
        password: editData.password || ''
      });
    }
  }, [editData]);

  const [isPolishing, setIsPolishing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const optimizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else { resolve(base64Str); }
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOptimizing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const rawBase64 = reader.result as string;
        const optimizedBase64 = await optimizeImage(rawBase64);
        
        // AI 변환을 위해 로컬에 보관
        setLocalBase64(optimizedBase64);

        setIsUploading(true);
        // 즉시 스토리지 업로드
        const publicUrl = await apiService.uploadImage(optimizedBase64, `raw_${formData.name || 'user'}`);
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } catch (error) {
        console.error('Upload flow error:', error);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsUploading(false);
        setIsOptimizing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleArtisticTransform = async () => {
    // 로컬 베이스64가 없으면 업로드된 URL에서라도 가져오려 시도 (최후의 수단)
    let base64ToUse = localBase64;
    
    if (!base64ToUse && formData.imageUrl) {
      // 이미 저장된 URL이 있으면 가져오기 시도 (CORS 주의)
      try {
        setIsTransforming(true);
        const resp = await fetch(formData.imageUrl);
        const blob = await resp.blob();
        base64ToUse = await new Promise((resolve) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("CORS fetch failed, need local base64");
      }
    }

    if (!base64ToUse) {
      alert('변환할 이미지 데이터가 없습니다. 다시 업로드해주세요.');
      setIsTransforming(false);
      return;
    }
    
    setIsTransforming(true);
    try {
      const [header, data] = base64ToUse.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      
      // Gemini AI 호출
      const aiResultBase64 = await transformPortrait(data, mime);
      
      // 결과 로컬 업데이트 (미리보기용)
      setLocalBase64(aiResultBase64);

      // 즉시 스토리지 재업로드 (영구 URL 확보)
      setIsUploading(true);
      const storageUrl = await apiService.uploadImage(aiResultBase64, `ai_portrait_${formData.name || 'champion'}`);
      
      setFormData(prev => ({ ...prev, imageUrl: storageUrl }));
      alert('AI가 예술적 프로필 생성을 완료하고 클라우드에 저장했습니다.');
    } catch (error) {
      console.error("Nano Banana Transformation Failed:", error);
      alert('예술적 변환 또는 서버 저장 중 오류가 발생했습니다.');
    } finally { 
      setIsTransforming(false); 
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) { alert('사진 등록이 필수입니다.'); return; }
    if (formData.imageUrl.startsWith('data:')) {
      alert('이미지가 아직 클라우드에 동기화되지 않았습니다. 잠시만 기다려주세요.');
      return;
    }
    
    if (!formData.email || !formData.password) { alert('관리용 이메일과 비밀번호를 입력해주세요.'); return; }
    
    setIsSubmitting(true);
    try {
      if (isEditMode && editData) {
        const updatedChampion: Champion = { ...editData, ...formData };
        await apiService.updateChampion(updatedChampion);
        alert('성공적으로 수정되었습니다.');
        onSuccess();
      } else {
        const newId = `champ_${Date.now()}`;
        const newChampion: Champion = {
          id: newId,
          ...formData,
          registeredAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, ''),
          status: 'APPROVED',
          viewCount: 0
        };
        await apiService.createChampion(newChampion);
        storageService.addOwnership(newId);
        alert('명예의 전당 등록이 완료되었습니다.');
        onSuccess();
      }
    } catch (err) {
      console.error("Database Submit Failed:", err);
      alert('데이터베이스 저장에 실패했습니다. (DB 연결 확인 필요)');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const canTransform = formData.imageUrl && !isTransforming && !isUploading && !isOptimizing;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black serif-title mb-4 tracking-tighter uppercase">
          {isEditMode ? '기록' : 'AI챔피언'} <span className="gold-text">{isEditMode ? '업데이트' : '등록하기'}</span>
        </h2>
        <p className="text-white/40 font-light italic break-keep px-4 text-xs md:text-sm leading-relaxed">
          혁신가의 업적은 안전한 클라우드 스토리지에 영구 보존됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="relative group aspect-[4/5] bg-neutral-900 border-2 border-dashed border-white/10 rounded-sm overflow-hidden flex items-center justify-center">
            {isOptimizing || isUploading || isTransforming ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
                  {isUploading ? 'Cloud Syncing...' : isTransforming ? 'AI Painting...' : 'Processing...'}
                </p>
              </div>
            ) : formData.imageUrl || localBase64 ? (
              <img src={localBase64 || formData.imageUrl} className="w-full h-full object-cover transition-all duration-500" alt="Profile Preview" />
            ) : (
              <div className="text-center px-8">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500 transition-colors">
                   <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Photo Upload</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" disabled={isUploading || isTransforming} />
          </div>
          
          <button 
            type="button" 
            onClick={handleArtisticTransform} 
            disabled={!canTransform}
            className={`w-full py-4 border font-bold text-[10px] tracking-widest uppercase transition-all group relative overflow-hidden ${canTransform ? 'bg-white/5 border-white/10 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500' : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}`}
          >
            <span className="relative z-10">{isTransforming ? 'AI 아티스트 작업 중...' : 'Nano Banana Pro 예술적 변환'}</span>
            {!isTransforming && <span className="block text-[8px] opacity-40 lowercase group-hover:opacity-100 relative z-10">AI will re-save result to cloud</span>}
            {isTransforming && <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="absolute inset-0 bg-yellow-500/20" />}
          </button>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm space-y-4">
             <div className="flex flex-col space-y-2">
               <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Registry Email</label>
               <input 
                 required
                 type="email" 
                 value={formData.email}
                 onChange={e => setFormData({...formData, email: e.target.value})}
                 className="w-full bg-black/40 border border-white/10 p-3 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                 placeholder="your@email.com"
               />
             </div>
             <div className="flex flex-col space-y-2">
               <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Security Password</label>
               <input 
                 required
                 type="password" 
                 value={formData.password}
                 onChange={e => setFormData({...formData, password: e.target.value})}
                 className="w-full bg-black/40 border border-white/10 p-3 text-sm focus:outline-none focus:border-yellow-500 transition-all font-mono"
                 placeholder="관리용 비밀번호"
               />
             </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8 glass p-8 md:p-10 rounded-sm border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">성함</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-yellow-500 transition-colors text-lg" placeholder="성함" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">소속 부처/기관</label>
              <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-yellow-500 transition-colors text-lg" placeholder="기관명" />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">직위 / 전문 분야</label>
            <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-yellow-500 transition-colors text-sm" placeholder="예: 디지털전략과 사무관" />
          </div>

          <div className="flex flex-col space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Elite Rank Selection</label>
            <div className="grid grid-cols-3 gap-2">
              {[CertificationType.GREEN, CertificationType.BLUE, CertificationType.BLACK].map(type => (
                <button key={type} type="button" onClick={() => setFormData({...formData, certType: type})} className={`py-3 border text-[10px] font-black tracking-widest transition-all ${formData.certType === type ? 'bg-white text-black border-white' : 'bg-transparent text-white/30 border-white/5 hover:border-white/20'}`}>{type}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Visionary Statement</label>
              <button type="button" onClick={async () => {
                if (!formData.vision) return alert('내용을 먼저 작성해주세요.');
                setIsPolishing(true);
                try {
                  const pol = await polishVision(formData.name, formData.department, formData.vision);
                  setFormData(prev => ({...prev, vision: pol}));
                } finally { setIsPolishing(false); }
              }} className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">{isPolishing ? 'Refining...' : 'Gemini AI 교정'}</button>
            </div>
            <textarea required rows={3} value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} className="bg-white/5 border border-white/5 p-4 focus:outline-none focus:border-yellow-500/30 transition-colors text-sm font-light leading-relaxed" placeholder="대한민국 AI의 미래를 향한 포부를 기록하세요." />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isUploading || isTransforming || isOptimizing} 
            className={`w-full py-5 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs transition-all ${isSubmitting || isUploading || isTransforming || isOptimizing ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-2xl shadow-yellow-500/10'}`}
          >
            {isSubmitting ? 'Securing Archive...' : isEditMode ? 'Cloud Data Synchronize' : 'Permanent Record Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
