
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CertificationType, Champion } from '../types';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { polishVision, transformPortrait, polishAchievement } from '../services/geminiService';

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
  const [isAiApplied, setIsAiApplied] = useState(false);

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
      // 이미지 URL에 AI 키워드가 없으면 변환되지 않은 것으로 간주
      const alreadyHasAiImage = editData.imageUrl.includes('ai_') || editData.imageUrl.includes('auto_ai');
      setIsAiApplied(alreadyHasAiImage);
    }
  }, [editData]);

  const [isTransforming, setIsTransforming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  
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
        setIsAiApplied(false); 
        setIsUploading(true);
        const publicUrl = await apiService.uploadImage(optimizedBase64, `raw_${formData.name || 'user'}`);
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } catch (error) {
        alert('이미지 업로드에 실패했습니다.');
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
        setAiStatus("원본 데이터를 분석 중입니다...");
        const resp = await fetch(formData.imageUrl);
        const blob = await resp.blob();
        base64ToUse = await new Promise((resolve) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
      } catch (e) { console.error("Image fetch failed"); }
    }
    
    if (!base64ToUse) { alert('이미지를 먼저 업로드해주세요.'); setIsTransforming(false); return; }
    
    setIsTransforming(true);
    setAiStatus("Gemini가 전문 정장 프로필로 변환 중...");
    try {
      const [header, data] = base64ToUse.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      const aiResultBase64 = await transformPortrait(data, mime);
      setLocalBase64(aiResultBase64);
      setIsAiApplied(true);
      setIsUploading(true);
      const storageUrl = await apiService.uploadImage(aiResultBase64, `ai_profile_${formData.name || 'champion'}`);
      setFormData(prev => ({ ...prev, imageUrl: storageUrl }));
    } catch (error: any) {
      alert('AI 프로필 생성 중 오류가 발생했습니다.');
    } finally { 
      setIsTransforming(false); 
      setIsUploading(false);
      setAiStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) { alert('사진 등록이 필요합니다.'); return; }
    if (!formData.email || !formData.password) { alert('인증 정보를 입력해주세요.'); return; }
    
    setIsSubmitting(true);
    
    let finalImageUrl = formData.imageUrl;
    let finalVision = formData.vision;
    let finalAchievement = formData.achievement;

    try {
      // 1. 자동 정장 프로필 변환 (변환 안 된 상태일 때)
      if (!isAiApplied) {
        let base64ToTransform = localBase64;
        
        if (!base64ToTransform && formData.imageUrl) {
          try {
            setAiStatus("이미지 분석 및 정장 프로필 변환 준비...");
            const resp = await fetch(formData.imageUrl);
            const blob = await resp.blob();
            base64ToTransform = await new Promise((resolve) => {
              const r = new FileReader();
              r.onloadend = () => resolve(r.result as string);
              r.readAsDataURL(blob);
            });
          } catch (e) { console.error("Image fetch failed during auto transform"); }
        }

        if (base64ToTransform) {
          setAiStatus("전문 정장 프로필 사진을 생성 중입니다...");
          const [header, data] = base64ToTransform.split(',');
          const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
          const aiResultBase64 = await transformPortrait(data, mime);
          const storageUrl = await apiService.uploadImage(aiResultBase64, `auto_profile_${formData.name}`);
          finalImageUrl = storageUrl;
          setIsAiApplied(true);
        }
      }

      setAiStatus("Gemini가 포부를 고품격 문장으로 정제 중...");
      finalVision = await polishVision(formData.name, formData.department, finalVision);

      setAiStatus("업적 내용을 분석하여 임팩트 있게 고도화 중...");
      finalAchievement = await polishAchievement(formData.name, formData.department, formData.role, finalAchievement);

      setAiStatus("기록을 아카이브에 안전하게 저장 중...");

      if (isEditMode && editData) {
        await apiService.updateChampion({ 
          ...editData, 
          ...formData, 
          imageUrl: finalImageUrl,
          vision: finalVision, 
          achievement: finalAchievement 
        });
        alert('프로필이 성공적으로 업데이트되었습니다.');
        onSuccess();
      } else {
        const newId = `champ_${Date.now()}`;
        await apiService.createChampion({
          id: newId,
          ...formData,
          imageUrl: finalImageUrl,
          vision: finalVision,
          achievement: finalAchievement,
          registeredAt: new Date().toLocaleDateString('ko-KR').replace(/\.$/, ''),
          status: 'APPROVED',
          viewCount: 0
        });
        storageService.addOwnership(newId);
        alert('명예의 전당 등록이 완료되었습니다. 환영합니다!');
        onSuccess();
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally { 
      setIsSubmitting(false);
      setAiStatus(null);
    }
  };

  const isAnyLoading = isSubmitting || isUploading || isTransforming || isOptimizing;
  const previewImage = localBase64 || formData.imageUrl;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black serif-title mb-4 tracking-tighter uppercase">
          {isEditMode ? '기록 관리' : '공공 AI 챔피언'} <span className="gold-text">{isEditMode ? '업데이트' : '등록'}</span>
        </h2>
        <p className="text-yellow-500/60 font-black text-[10px] tracking-[0.5em] uppercase">National Digital Innovation Archive</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 flex flex-col space-y-8">
          <div className="relative aspect-[3/4] bg-black border-2 border-white/10 rounded-sm overflow-hidden flex items-center justify-center group shadow-2xl">
            {isAnyLoading ? (
              <div className="flex flex-col items-center px-6 text-center z-20">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black tracking-widest text-yellow-500 uppercase animate-pulse leading-relaxed">
                  {aiStatus || "AI 엔진 처리 중..."}
                </p>
              </div>
            ) : previewImage ? (
              <>
                <img src={previewImage} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125" alt="Blur" />
                <img src={previewImage} className="relative z-10 w-full h-full object-contain" alt="Profile" />
              </>
            ) : (
              <div className="text-center p-10 opacity-30 group-hover:opacity-100 transition-all duration-500">
                <div className="w-16 h-16 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-white">+</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">사진 업로드</p>
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
            {isTransforming ? '프로필 생성 중...' : 'Gemini 전문 정장 프로필 변환'}
          </button>

          <div className="p-8 bg-white/[0.03] border border-white/10 rounded-sm space-y-6 shadow-2xl">
             <div className="flex flex-col space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-yellow-500">인증용 이메일</label>
               <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-black/60 border border-white/10 p-4 text-sm text-white focus:border-yellow-500 outline-none transition-all" placeholder="본인 확인용" />
             </div>
             <div className="flex flex-col space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-yellow-500">수정용 비밀번호</label>
               <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-black/60 border border-white/10 p-4 text-sm text-white focus:border-yellow-500 outline-none transition-all" placeholder="기록 수정 시 필요" />
             </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8 glass p-8 md:p-14 rounded-sm border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">성함</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-transparent border-b border-white/10 py-3 focus:border-yellow-500 outline-none text-xl font-bold text-white transition-all" />
            </div>
            <div className="flex flex-col space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">소속</label>
              <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="bg-transparent border-b border-white/10 py-3 focus:border-yellow-500 outline-none text-xl font-bold text-white transition-all" />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/70">직위 / 역할</label>
            <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-transparent border-b border-white/10 py-3 focus:border-yellow-500 outline-none text-base text-white/90 transition-all" placeholder="예: 디지털전환 기획관" />
          </div>

          <div className="flex flex-col space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/70">인증 등급</label>
            <div className="grid grid-cols-3 gap-3">
              {[CertificationType.GREEN, CertificationType.BLUE, CertificationType.BLACK].map(type => (
                <button key={type} type="button" onClick={() => setFormData({...formData, certType: type})} className={`py-4 border text-[10px] font-black tracking-widest transition-all ${formData.certType === type ? 'bg-yellow-500 text-black border-yellow-500 shadow-xl' : 'border-white/10 text-white/40 hover:border-white/30'}`}>{type}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">혁신 포부</label>
              <span className="text-[9px] text-yellow-500/40 uppercase font-black">AI 자동 완성 적용</span>
            </div>
            <textarea required rows={3} value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} className="bg-white/[0.04] border border-white/10 p-5 text-sm font-medium italic text-white focus:border-yellow-500 outline-none leading-relaxed transition-all" placeholder="생각나는 대로 입력하세요. AI가 멋지게 다듬어드립니다." />
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70">주요 혁신 업적</label>
              <span className="text-[9px] text-yellow-500/40 uppercase font-black">AI 고도화 적용</span>
            </div>
            <textarea rows={3} value={formData.achievement} onChange={e => setFormData({...formData, achievement: e.target.value})} className="bg-white/[0.04] border border-white/10 p-5 text-sm font-medium text-white focus:border-yellow-500 outline-none leading-relaxed transition-all" placeholder="업적을 입력하시면 AI가 더욱 임팩트 있게 고도화해드립니다." />
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={isAnyLoading} 
              className={`w-full py-6 font-black uppercase tracking-[0.5em] text-[12px] transition-all duration-500 rounded-sm ${isAnyLoading ? 'opacity-20 cursor-not-allowed bg-white/10' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_20px_60px_rgba(234,179,8,0.2)]'}`}
            >
              {isSubmitting ? 'AI 아카이빙 진행 중...' : '기록물 영구 등록'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
