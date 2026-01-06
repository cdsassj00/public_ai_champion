
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, Champion, CertificationType } from './types';
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
import FilterBar from './components/FilterBar';

type GridItem = { type: 'CHAMPION'; data: Champion } | { type: 'PLACEHOLDER'; id: string };
type ViewMode = 'GRID' | 'LIST';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [champions, setChampions] = useState<Champion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState<CertificationType | 'ALL'>('ALL');
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
    if (view !== 'HALL_OF_FAME') {
      setSearchQuery('');
      setSelectedRank('ALL');
    }
  }, [view]);

  const gridItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = champions.filter(c => {
      const matchesSearch = !query || 
        c.name.toLowerCase().includes(query) || 
        c.department.toLowerCase().includes(query) ||
        c.role.toLowerCase().includes(query) ||
        (c.achievement && c.achievement.toLowerCase().includes(query)) ||
        (c.vision && c.vision.toLowerCase().includes(query));
      
      const matchesRank = selectedRank === 'ALL' || c.certType === selectedRank;
      
      return matchesSearch && matchesRank;
    });

    if (query || selectedRank !== 'ALL') {
      return filtered.map(c => ({ type: 'CHAMPION', data: c } as GridItem));
    }

    const shuffledChampions = [...filtered];
    for (let i = shuffledChampions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledChampions[i], shuffledChampions[j]] = [shuffledChampions[j], shuffledChampions[i]];
    }

    const baseSlots = 42; 
    const extraSlots = 12;
    const totalSlots = Math.max(baseSlots, champions.length + extraSlots); 
    
    return [
      ...shuffledChampions.map(c => ({ type: 'CHAMPION', data: c } as GridItem)),
      ...Array.from({ length: totalSlots - shuffledChampions.length }).map((_, i) => ({ type: 'PLACEHOLDER', id: `ph-${i}` } as GridItem))
    ];
  }, [champions, searchQuery, selectedRank]);

  const handleSelectChampion = async (champion: Champion) => {
    await apiService.incrementView(champion.id);
    setChampions(prev => prev.map(c => 
      c.id === champion.id ? { ...c, viewCount: (c.viewCount || 0) + 1 } : c
    ));
    setSelectedChampion({ ...champion, viewCount: (champion.viewCount || 0) + 1 });
  };

  const handleUpdateChampion = (updated: Champion) => {
    setChampions(prev => prev.map(c => c.id === updated.id ? updated : c));
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
            <div className="max-w-[1600px] mx-auto px-3 sm:px-10 py-12 md:py-24">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4 mb-16">
                <span className="text-[9px] md:text-xs font-black tracking-[0.5em] text-yellow-500/60 uppercase block mb-3 md:mb-4">Archive of Excellence</span>
                <h2 className="text-2xl md:text-6xl font-light serif-title mb-12 tracking-tighter uppercase break-keep">공공 AI 챔피언 <span className="gold-text font-black">명예의 전당</span></h2>
                
                <FilterBar 
                  selectedRank={selectedRank} 
                  setSelectedRank={setSelectedRank} 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </motion.div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-[8px] font-bold tracking-widest uppercase">데이터 아카이브 로딩 중...</span>
                </div>
              ) : gridItems.length === 0 ? (
                <div className="text-center py-40 opacity-40">
                  <p className="text-lg font-light italic mb-4">검색 결과와 일치하는 챔피언이 없습니다.</p>
                  <button onClick={() => {setSearchQuery(''); setSelectedRank('ALL');}} className="text-[10px] font-black uppercase tracking-widest text-yellow-500 border-b border-yellow-500/30">필터 초기화</button>
                </div>
              ) : (
                <motion.div 
                  layout
                  className={viewMode === 'GRID' 
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6 lg:gap-8"
                    : "flex flex-col space-y-2 max-w-5xl mx-auto"
                  }
                >
                  <AnimatePresence mode="popLayout">
                    {gridItems.map((item, index) => (
                      <motion.div
                        key={item.type === 'CHAMPION' ? item.data.id : item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.type === 'CHAMPION' ? (
                          <ChampionCard 
                            champion={item.data} 
                            index={index} 
                            onClick={handleSelectChampion} 
                            viewMode={viewMode}
                          />
                        ) : (
                          viewMode === 'GRID' && <PlaceholderCard index={index} onClick={() => setView('REGISTER')} />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
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
            </div>
          )}
        </motion.main>
      </AnimatePresence>

      <ChampionModal 
        champion={selectedChampion} 
        onClose={() => setSelectedChampion(null)} 
        onUpdate={handleUpdateChampion}
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
