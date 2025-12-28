
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CertificationType, Champion } from '../types';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { polishVision, transformPortrait, suggestAchievement } from '../services/geminiService';

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
        setLocalBase64(optimizedBase64);
        setIsUploading(true);
        const publicUrl = await apiService.uploadImage(optimizedBase64, `raw_${formData.name || 'user'}`);
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } catch (error) {
        alert('이미지 업로드에 실패했습니다. 네트워크를 확인하세요.');
      } finally {
        setIsUploading(false);
        setIsOptimizing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleArtisticTransform = async () => {
    let base64ToUse = localBase64;
    
    if (!base64ToUse && formData.imageUrl) {
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
        console.error("Image fetch failed");
      }
    }

    if (!base64ToUse) {
      alert('이미지를 먼저 업로드해주세요.');
      setIsTransforming(false);
      return;
    }
    
    setIsTransforming(true);
    try {
      const [header, data] = base64ToUse.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      const aiResultBase64 = await transformPortrait(data, mime);
      setLocalBase64(aiResultBase64);
      setIsUploading(true);
      const storageUrl = await apiService.uploadImage(aiResultBase64, `ai_portrait_${formData.name || 'champion'}`);
      setFormData(prev => ({ ...prev, imageUrl: storageUrl }));
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'AI 변환 중 오류가 발생했습니다. API 키 설정을 확인하세요.');
    } finally { 
      setIsTransforming(false); 
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) { alert('사진 등록이 필요합니다.'); return; }
    if (!formData.email || !formData.password) { alert('인증 정보를 입력해주세요.'); return; }
    
    setIsSubmitting(true);
    try {
      if (isEditMode && editData) {
        await apiService.updateChampion({ ...editData, ...formData });
        alert('기록이 수정되었습니다.');
        onSuccess();
      } else {
        const newId = `champ_${Date.now()}`;
        await apiService.createChampion({
          id: newId,
          ...formData,
          registeredAt: new Date().toLocaleDateString('ko-KR').replace(/\.$/, ''),
          status: 'APPROVED',
          viewCount: 0
        });
        storageService.addOwnership(newId);
        alert('명예의 전당에 성공적으로 등록되었습니다.');
        onSuccess();
      }
    } catch (err) {
      alert('데이터 저장 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const isAnyLoading = isSubmitting || isUploading || isTransforming || isOptimizing;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black serif-title mb-4 tracking-tighter uppercase">
          {isEditMode ? '챔피언 기록' : 'AI 챔피언'} <span className="gold-text">{isEditMode ? '업데이트' : '등록'}</span>
        </h2>
        <p className="text-yellow-500/60 font-black text-[10px] tracking-[0.4em] uppercase">National Digital Excellence Registry</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Section: Image and Auth */}
        <div className="lg:col-span-5 flex flex-col space-y-8">
          <div className="relative aspect-[3/4] bg-neutral-900 border-2 border-white/10 rounded-sm overflow-hidden flex items-center justify-center group shadow-2xl">
            {isAnyLoading ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black tracking-widest text-yellow-500 uppercase animate-pulse">AI 엔진 가동 중...</p>
              </div>
            ) : formData.imageUrl || localBase64 ? (
              <img src={localBase64 || formData.imageUrl} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="text-center p-10 opacity-30 group-hover:opacity-100 transition-all duration-500">
                <div className="w-20 h-20 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-yellow-500 transition-all">
                  <span className="text-3xl text-white">+</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">사진 업로드</p>
                <p className="text-[8px] text-white/40 mt-2 uppercase tracking-tighter">Click or Drag to Upload</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" disabled={isAnyLoading} />
          </div>
          
          <button 
            type="button" 
            onClick={handleArtisticTransform} 
            disabled={!formData.imageUrl || isAnyLoading}
            className={`w-full py-5 border-2 font-black text-[11px] tracking-[0.3em] uppercase transition-all duration-500 ${formData.imageUrl && !isAnyLoading ? 'bg-white/5 border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-black shadow-lg shadow-yellow-500/10' : 'opacity-20 cursor-not-allowed border-white/10'}`}
          >
            {isTransforming ? 'AI RENDERING...' : 'Gemini Pro 예술적 변환'}
          </button>

          <div className="p-8 bg-white/[0.03] border border-white/10 rounded-sm space-y-6 shadow-xl">
             <div className="flex flex-col space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-yellow-500">관리용 이메일 (Email)</label>
               <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-black/60 border border-white/10 p-4 text-sm text-white focus:border-yellow-500 outline-none transition-all" placeholder="본인 확인용 이메일" />
             </div>
             <div className="flex flex-col space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-yellow-500">관리용 비밀번호 (Password)</label>
               <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-black/60 border border-white/10 p-4 text-sm text-white focus:border-yellow-500 outline-none transition-all" placeholder="기록 수정/삭제 비밀번호" />
             </div>
          </div>
        </div>

        {/* Right Section: Form Fields */}
        <div className="lg:col-span-7 space-y-8 glass p-8 md:p-14 rounded-sm border-white/10">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">성함 (Name)</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-transparent border-b-2 border-white/10 py-3 focus:border-yellow-500 outline-none text-xl font-bold text-white transition-all" />
            </div>
            <div className="flex flex-col space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">소속 (Department)</label>
              <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="bg-transparent border-b-2 border-white/10 py-3 focus:border-yellow-500 outline-none text-xl font-bold text-white transition-all" />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/70">직위 / 역할 (Role)</label>
            <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-transparent border-b-2 border-white/10 py-3 focus:border-yellow-500 outline-none text-base text-white/90 transition-all" placeholder="예: 디지털전무 기획관, 데이터 분석가 등" />
          </div>

          <div className="flex flex-col space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/70">Certification Rank (인증 등급)</label>
            <div className="grid grid-cols-3 gap-3">
              {[CertificationType.GREEN, CertificationType.BLUE, CertificationType.BLACK].map(type => (
                <button key={type} type="button" onClick={() => setFormData({...formData, certType: type})} className={`py-4 border-2 text-[10px] font-black tracking-widest transition-all ${formData.certType === type ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg' : 'border-white/10 text-white/40 hover:border-white/30'}`}>{type}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">Visionary Statement (포부)</label>
              <button type="button" onClick={async () => {
                if (!formData.vision) return alert('포부를 입력해주세요.');
                setIsPolishing(true);
                try {
                  const pol = await polishVision(formData.name, formData.department, formData.vision);
                  setFormData(prev => ({...prev, vision: pol}));
                } finally { setIsPolishing(false); }
              }} className="text-[9px] font-black text-yellow-500 uppercase px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black transition-all">{isPolishing ? 'Refining...' : 'AI 문장 교정'}</button>
            </div>
            <textarea required rows={3} value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} className="bg-white/[0.04] border border-white/10 p-5 text-sm font-medium italic text-white focus:border-yellow-500 outline-none leading-relaxed transition-all placeholder:text-white/10" placeholder="AI를 통해 실현하고자 하는 가치를 입력하세요." />
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">Impact Assessment (주요 업적)</label>
              <button type="button" onClick={async () => {
                if (!formData.name || !formData.department) return alert('성함과 소속을 먼저 입력해주세요.');
                setIsSuggesting(true);
                try {
                  const sugg = await suggestAchievement(formData.name, formData.department, formData.role);
                  setFormData(prev => ({...prev, achievement: sugg}));
                } finally { setIsSuggesting(false); }
              }} className="text-[9px] font-black text-yellow-500 uppercase px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black transition-all">{isSuggesting ? 'Thinking...' : 'AI 업적 추천'}</button>
            </div>
            <textarea required rows={3} value={formData.achievement} onChange={e => setFormData({...formData, achievement: e.target.value})} className="bg-white/[0.04] border border-white/10 p-5 text-sm font-medium text-white focus:border-yellow-500 outline-none leading-relaxed transition-all placeholder:text-white/10" placeholder="주요 AI 혁신 사례 및 성과를 기록하세요." />
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={isAnyLoading} 
              className={`w-full py-6 font-black uppercase tracking-[0.4em] text-[12px] transition-all duration-500 rounded-sm ${isAnyLoading ? 'opacity-20 cursor-not-allowed bg-white/10' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-2xl shadow-yellow-500/20 active:scale-[0.98]'}`}
            >
              {isSubmitting ? 'SYCHRONIZING...' : '명예의 전당 등록하기'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
