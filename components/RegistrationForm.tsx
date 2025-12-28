
import React, { useState, useRef, useEffect } from 'react';
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
    achievement: ''
  });

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
        achievement: editData.achievement || ''
      });
    }
  }, [editData]);

  const [isPolishing, setIsPolishing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const optimizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(base64Str);
        }
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsOptimizing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        const optimizedBase64 = await optimizeImage(rawBase64);
        setFormData(prev => ({ ...prev, imageUrl: optimizedBase64 }));
        setIsOptimizing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArtisticTransform = async () => {
    if (!formData.imageUrl) {
      alert('먼저 사진을 업로드해주세요.');
      return;
    }

    setIsTransforming(true);
    try {
      const [header, base64Data] = formData.imageUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
      
      const transformed = await transformPortrait(base64Data, mimeType);
      setFormData(prev => ({ ...prev, imageUrl: transformed }));
    } catch (error) {
      console.error(error);
      alert('예술적 변환 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSuggestAchievement = async () => {
    if (!formData.name || !formData.department || !formData.role) {
      alert('성함, 소속, 직위를 먼저 입력해주세요.');
      return;
    }
    setIsSuggesting(true);
    try {
      const suggested = await suggestProfileContent(formData.name, formData.department, formData.role);
      setFormData(prev => ({ ...prev, achievement: suggested }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handlePolish = async () => {
    if (!formData.name || !formData.vision) {
      alert('성함과 포부를 먼저 입력해주세요.');
      return;
    }
    setIsPolishing(true);
    try {
      const polished = await polishVision(formData.name, formData.department, formData.vision);
      setFormData(prev => ({ ...prev, vision: polished }));
    } catch (error) {
      console.error(error);
      alert('포부 다듬기 중 오류가 발생했습니다.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('사진을 등록하고 예술적으로 변환해보세요!');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode && editData) {
        const updatedChampion: Champion = {
          ...editData,
          ...formData,
        };
        await apiService.updateChampion(updatedChampion);
        alert('프로필 수정이 완료되었습니다.');
        onSuccess();
      } else {
        const newChampion: Champion = {
          id: `champ_${Date.now()}`,
          ...formData,
          registeredAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, ''),
          status: 'APPROVED',
          viewCount: 0
        };
        await apiService.createChampion(newChampion);
        storageService.addOwnership(newChampion.id);
        alert('명예의 전당 등록이 완료되었습니다.');
        onSuccess();
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert('데이터베이스 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black serif-title mb-4 tracking-tighter uppercase">
          {isEditMode ? 'Update' : 'Join'} the <span className="gold-text">Elite</span>
        </h2>
        <p className="text-white/40 font-light italic">
          {isEditMode ? '나의 업적을 최신 데이터로 갱신합니다.' : '"당신의 데이터는 영구 데이터베이스에 안전하게 보존됩니다."'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="relative group aspect-[4/5] bg-neutral-900 border-2 border-dashed border-white/10 rounded-sm overflow-hidden flex items-center justify-center">
            {isOptimizing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">최적화 중...</p>
              </div>
            ) : formData.imageUrl ? (
              <img 
                src={formData.imageUrl} 
                className="w-full h-full object-cover transition-all duration-500" 
                alt="Profile Preview"
              />
            ) : (
              <div className="text-center px-8">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500 transition-colors">
                   <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">사진 업로드</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*"
            />
          </div>
          
          <button 
            type="button"
            onClick={handleArtisticTransform}
            disabled={isTransforming || !formData.imageUrl || isOptimizing}
            className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
          >
            {isTransforming ? '예술적 재창조 중...' : 'Nano Banana Pro 예술적 변환'}
          </button>
        </div>

        <div className="lg:col-span-7 space-y-8 glass p-10 rounded-sm border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">성함</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-yellow-500 transition-colors text-lg"
                placeholder="성함을 입력하세요"
              />
            </div>
            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">소속</label>
              <input 
                required
                type="text" 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
                className="bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-yellow-500 transition-colors text-lg"
                placeholder="소속 기관/부처"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">직위 / 역할</label>
            <input 
              required
              type="text" 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-yellow-500 transition-colors text-lg"
              placeholder="직위 및 주요 역할을 기재하세요"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">바이브코딩 / 프로젝트 URL</label>
            <input 
              type="url" 
              value={formData.projectUrl}
              onChange={e => setFormData({...formData, projectUrl: e.target.value})}
              className="bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-yellow-500 transition-colors text-sm font-mono text-yellow-500/80"
              placeholder="https://vibecoding.com/your-project"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">주요 혁신 업적</label>
              <button 
                type="button"
                onClick={handleSuggestAchievement}
                disabled={isSuggesting}
                className="text-[9px] font-bold text-yellow-500 hover:text-yellow-400 disabled:opacity-50 transition-colors uppercase tracking-[0.2em]"
              >
                {isSuggesting ? 'Thinking...' : 'Gemini AI 추천'}
              </button>
            </div>
            <input 
              type="text" 
              value={formData.achievement}
              onChange={e => setFormData({...formData, achievement: e.target.value})}
              className="bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-yellow-500 transition-colors text-sm text-white/80"
              placeholder="자랑스러운 성과를 기록하세요."
            />
          </div>

          <div className="flex flex-col space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">인증 등급</label>
            <div className="grid grid-cols-3 gap-2">
              {[CertificationType.GREEN, CertificationType.BLUE, CertificationType.BLACK].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, certType: type})}
                  className={`py-3 border text-[10px] font-black tracking-widest transition-all ${formData.certType === type ? 'bg-white text-black border-white' : 'bg-transparent text-white/30 border-white/5 hover:border-white/20'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">비전 및 포부</label>
              <button 
                type="button"
                onClick={handlePolish}
                disabled={isPolishing}
                className="text-[9px] font-bold text-yellow-500 hover:text-yellow-400 disabled:opacity-50 transition-colors uppercase tracking-[0.2em]"
              >
                {isPolishing ? 'Refining...' : 'Gemini AI로 품격 높이기'}
              </button>
            </div>
            <textarea 
              required
              rows={3}
              value={formData.vision}
              onChange={e => setFormData({...formData, vision: e.target.value})}
              className="bg-white/5 border border-white/5 p-4 focus:outline-none focus:border-yellow-500/30 transition-colors resize-none text-sm font-light leading-relaxed"
              placeholder="AI 챔피언으로서의 비전을 입력하세요."
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || isOptimizing}
            className="w-full py-5 bg-yellow-500 text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-yellow-400 transition-all disabled:opacity-50 active:scale-95 mt-4"
          >
            {isSubmitting ? '저장 중...' : isEditMode ? '프로필 업데이트' : '명예의 전당 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
