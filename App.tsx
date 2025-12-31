
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, Champion } from './types';
import { apiService } from './services/apiService';
import { storageService } from './services/storageService';
import { CERT_DETAILS } from './constants';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ChampionCard from './components/ChampionCard';
import PlaceholderCard from './components/PlaceholderCard';
import RegistrationForm from './components/RegistrationForm';
import Background3D from './components/Background3D';
import ChampionModal from './components/ChampionModal';

type GridItem = { type: 'CHAMPION'; data: Champion } | { type: 'PLACEHOLDER'; id: string };

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [champions, setChampions] = useState<Champion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [editingChampion, setEditingChampion] = useState<Champion | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchChampions();
      setChampions(data);
    } catch (error) {
      console.error("Data Load Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view !== 'HALL_OF_FAME') setSearchQuery('');
  }, [view]);

  // 그리드에 표시될 전체 아이템 리스트 (랜덤 배치 포함)
  const gridItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // 검색어가 있는 경우: 검색 결과만 표시 (랜덤 섞지 않음)
    if (query) {
      return champions
        .filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.department.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query)
        )
        .map(c => ({ type: 'CHAMPION', data: c } as GridItem));
    }

    // 검색어가 없는 경우: 실제 데이터 + 플레이스홀더 섞어서 표시
    // 최소 42개(6열 기준 가득 찬 느낌)를 유지하며, 데이터가 많아지면 슬롯을 자동으로 더 늘림
    const baseSlots = 42; 
    const extraSlots = 12; // 실제 챔피언들 외에 항상 보여줄 여유 공간
    const totalSlots = Math.max(baseSlots, champions.length + extraSlots); 
    
    const items: GridItem[] = [
      ...champions.map(c => ({ type: 'CHAMPION', data: c } as GridItem)),
      ...Array.from({ length: totalSlots - champions.length }).map((_, i) => ({ type: 'PLACEHOLDER', id: `ph-${i}` } as GridItem))
    ];

    // Fisher-Yates Shuffle 적용 (데이터와 빈 자리를 무작위로 섞음)
    const shuffledItems = [...items];
    for (let i = shuffledItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
    }

    return shuffledItems;
  }, [champions, searchQuery]);

  const handleSelectChampion = async (champion: Champion) => {
    await apiService.incrementView(champion.id);
    setChampions(prev => prev.map(c => 
      c.id === champion.id ? { ...c, viewCount: (c.viewCount || 0) + 1 } : c
    ));
    setSelectedChampion({ ...champion, viewCount: (champion.viewCount || 0) + 1 });
  };

  const handleStartEdit = (champion: Champion) => {
    setEditingChampion(champion);
    setSelectedChampion(null);
    setView('EDIT_PROFILE');
  };

  const handleDeleteChampion = (id: string) => {
    setChampions(prev => prev.filter(c => c.id !== id));
    setSelectedChampion(null);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <Background3D />
      <Navigation currentView={view} setView={setView} />

      <AnimatePresence mode="wait">
        <motion.main key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="pt-10 w-full">
          {view === 'HOME' && <Hero onExplore={() => setView('HALL_OF_FAME')} onJoin={() => setView('REGISTER')} />}

          {view === 'HALL_OF_FAME' && (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-10 py-12 md:py-24">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-14 md:mb-20 text-center">
                <span className="text-[10px] md:text-xs font-black tracking-[0.6em] text-yellow-500/60 uppercase block mb-4">Archive of Excellence</span>
                <h2 className="text-3xl md:text-6xl font-light serif-title mb-8 tracking-tighter uppercase break-keep">공공 AI 챔피언 <span className="gold-text font-black">명예의 전당</span></h2>
                
                <div className="max-w-2xl mx-auto relative group px-4">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-7 text-white/20 group-focus-within:text-yellow-500 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="혁신가의 이름을 검색하여 기록을 확인하세요" className="w-full bg-white/[0.02] border border-white/10 pl-14 pr-14 py-5 rounded-full text-sm md:text-base font-light focus:outline-none focus:border-yellow-500/50 focus:bg-white/[0.05] transition-all backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
                  </div>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-[8px] font-bold tracking-widest uppercase">데이터 아카이브 로딩 중...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
                  <AnimatePresence mode="popLayout">
                    {gridItems.map((item, index) => (
                      item.type === 'CHAMPION' ? (
                        <ChampionCard key={item.data.id} champion={item.data} index={index} onClick={handleSelectChampion} />
                      ) : (
                        <PlaceholderCard key={item.id} index={index} onClick={() => setView('REGISTER')} />
                      )
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {view === 'REGISTER' && <div className="py-12 md:py-24"><RegistrationForm onSuccess={() => setView('HALL_OF_FAME')} /></div>}
          {view === 'EDIT_PROFILE' && editingChampion && <div className="py-12 md:py-24"><RegistrationForm onSuccess={() => { setView('HALL_OF_FAME'); setEditingChampion(null); }} editData={editingChampion} /></div>}
          
          {view === 'ABOUT' && (
            <div className="max-w-6xl mx-auto px-6 py-20">
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-24">
                  <h2 className="text-3xl md:text-5xl font-black serif-title mb-8 tracking-tighter uppercase leading-tight">
                    공공부문 AI 챔피언 <br/><span className="gold-text">역량인증 체계 가이드</span>
                  </h2>
                  <p className="max-w-3xl mx-auto text-white/50 font-light leading-relaxed text-sm md:text-base break-keep">
                    행정안전부는 공공행정 분야의 AI 대전환을 주도할 '문제해결형 인재'를 양성하기 위해<br/>
                    대상과 수준별로 4단계 교육과정(공공 AI 역량 트랙)과 연계된 인증 제도를 운영합니다.
                  </p>
               </motion.div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {Object.entries(CERT_DETAILS).map(([key, detail], idx) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className={`group relative bg-neutral-900/50 border ${detail.border} rounded-sm p-8 md:p-10 flex flex-col h-full transition-all duration-500 hover:bg-neutral-900 ${detail.glow}`}
                    >
                      <div className={`text-4xl mb-6 ${detail.color} opacity-60`}>{detail.icon}</div>
                      <div className="mb-8">
                        <span className={`text-[9px] font-black tracking-[0.3em] uppercase mb-2 block ${detail.color}`}>{detail.label}</span>
                        <h3 className="text-xl font-bold mb-3 serif-title">{detail.title}</h3>
                        <p className="text-white/60 text-xs font-light leading-relaxed break-keep">{detail.desc}</p>
                      </div>
                      
                      <div className="space-y-4 mb-10 flex-1">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-white/30 border-l border-yellow-500/50 pl-2">주요 인증 과제 예시</h4>
                        {detail.criteria.map((c, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <div className={`mt-1.5 w-1 h-1 rounded-full ${detail.accent} opacity-40`}></div>
                            <p className="text-xs text-white/50 font-light leading-snug break-keep">{c}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest block mb-1">통과 기준</span>
                        <span className="text-xs font-mono text-yellow-500/80 tracking-tight">수행평가 75점 이상 획득 시 인증</span>
                      </div>
                    </motion.div>
                  ))}
               </div>

               <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
                  {[
                    { title: '교육과정형', icon: '✎', desc: '행안부 AI 종합 교육과정 참여 후 과제 수행평가를 통한 인증' },
                    { title: '자기주도형', icon: '⚡', desc: '민간 교육 수료 등 역량 보유자 대상 수행평가 응시를 통한 인증' },
                    { title: '자격연계형', icon: '⚙', desc: '지정 AI 자격증(AICE, ADP 등) 보유자 대상 지정과목 이수 인증' }
                  ].map((method, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl text-yellow-500 mb-6">{method.icon}</div>
                      <h4 className="text-sm font-bold mb-3 tracking-tight">{method.title}</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed break-keep">{method.desc}</p>
                    </div>
                  ))}
               </div>

               <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-40 p-12 bg-white/[0.02] border border-white/5 text-center rounded-sm"
               >
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/40 mb-6 block">대한민국 공공 AI의 미래</span>
                 <h3 className="text-2xl md:text-3xl font-light serif-title mb-10 tracking-tight">"2030년까지 2만 명의 <span className="gold-text font-black">AI 챔피언</span>이 탄생합니다."</h3>
                 <button 
                  onClick={() => setView('REGISTER')}
                  className="px-12 py-4 bg-yellow-500 text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-yellow-400 transition-all shadow-xl"
                 >
                   기록 등록하기
                 </button>
               </motion.div>
            </div>
          )}
        </motion.main>
      </AnimatePresence>

      <ChampionModal 
        champion={selectedChampion} 
        onClose={() => setSelectedChampion(null)} 
        onEdit={handleStartEdit}
        onDelete={handleDeleteChampion}
      />

      <footer className="py-12 border-t border-white/5 relative z-10 bg-black text-center text-[7px] md:text-[9px] text-white/10 tracking-[0.2em] uppercase font-bold">
        &copy; 2025 공공 AI 챔피언 명예의 전당. DIGITAL GOVERNMENT INNOVATION.
      </footer>
    </div>
  );
};

export default App;
