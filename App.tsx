
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

  useEffect(() => {
    // 768px 미만(모바일)이면 리스트 뷰를 기본으로 설정하여 가독성 확보
    if (window.innerWidth < 768) {
      setViewMode('LIST');
    }
  }, []);

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

    const baseSlots = 36; 
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
            <div className="max-w-[1700px] mx-auto px-4 sm:px-12 py-12 md:py-24">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4 mb-20">
                <span className="text-[9px] md:text-xs font-black tracking-[0.5em] text-yellow-500/60 uppercase block mb-3 md:mb-4">Archive of Excellence</span>
                <h2 className="text-2xl md:text-5xl font-black serif-title mb-10 tracking-tighter">AI 챔피언 <span className="gold-text">기록 저장소</span></h2>
                <FilterBar 
                  selectedRank={selectedRank} 
                  setSelectedRank={setSelectedRank} 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              </motion.div>

              {/* 모바일 2열, 태블릿 3열 최적화 그리드 */}
              <div className={viewMode === 'GRID' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-8"
                : "flex flex-col space-y-4 max-w-4xl mx-auto"
              }>
                {gridItems.map((item, idx) => (
                  item.type === 'CHAMPION' ? (
                    <ChampionCard 
                      key={item.data.id} 
                      champion={item.data} 
                      index={idx} 
                      onClick={handleSelectChampion} 
                      viewMode={viewMode}
                    />
                  ) : (
                    viewMode === 'GRID' && <PlaceholderCard key={item.id} index={idx} onClick={() => setView('REGISTER')} />
                  )
                ))}
              </div>
            </div>
          )}

          {view === 'REGISTER' && <RegistrationForm onSuccess={() => setView('HALL_OF_FAME')} />}
          {view === 'EDIT_PROFILE' && <RegistrationForm editData={editingChampion} onSuccess={() => setView('HALL_OF_FAME')} />}
        </motion.main>
      </AnimatePresence>

      <ChampionModal 
        champion={selectedChampion} 
        onClose={() => setSelectedChampion(null)} 
        onEdit={handleStartEdit}
        onDelete={handleDeleteChampion}
        onUpdate={handleUpdateChampion}
      />
    </div>
  );
};

export default App;
