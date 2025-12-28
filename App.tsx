
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, Champion } from './types';
import { apiService } from './services/apiService';
import { storageService } from './services/storageService';
import { CERT_DETAILS } from './constants';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ChampionCard from './components/ChampionCard';
import RegistrationForm from './components/RegistrationForm';
import Background3D from './components/Background3D';
import ChampionModal from './components/ChampionModal';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [champions, setChampions] = useState<Champion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [editingChampion, setEditingChampion] = useState<Champion | null>(null);

  const shuffleArray = (array: Champion[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchChampions();
      setChampions(shuffleArray(data));
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

  const filteredChampions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return champions;
    return champions.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.department.toLowerCase().includes(query) ||
      c.role.toLowerCase().includes(query)
    );
  }, [champions, searchQuery]);

  const placeholderCount = Math.max(3, 12 - filteredChampions.length);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black overflow-x-hidden">
      <Background3D />
      <Navigation currentView={view} setView={setView} />

      <AnimatePresence mode="wait">
        <motion.main key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="pt-10 w-full">
          {view === 'HOME' && <Hero onExplore={() => setView('HALL_OF_FAME')} onJoin={() => setView('REGISTER')} />}

          {view === 'HALL_OF_FAME' && (
            <div className="max-w-[1600px] mx-auto px-2 sm:px-6 py-12 md:py-24">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-14 md:mb-20 text-center">
                <span className="text-[10px] md:text-xs font-black tracking-[0.4em] text-yellow-500/60 uppercase block mb-4">Official Registry</span>
                <h2 className="text-3xl md:text-5xl font-light serif-title mb-6 tracking-tight uppercase break-keep">공공 AI 챔피언 <span className="gold-text font-black">명예의 전당</span></h2>
                
                <div className="max-w-2xl mx-auto relative group px-4">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative flex items-center">
                    <div className="absolute left-7 text-white/20 group-focus-within:text-yellow-500 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="이름 또는 부처명으로 혁신가를 찾으세요" className="w-full bg-white/[0.02] border border-white/10 pl-14 pr-14 py-5 rounded-full text-sm md:text-base font-light focus:outline-none focus:border-yellow-500/50 focus:bg-white/[0.05] transition-all backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-6 p-2 text-white/20 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-center space-x-6 text-[9px] md:text-[10px] font-black tracking-widest uppercase">
                    <div className="flex items-center space-x-2">
                       <span className="text-white/20">Discovery:</span>
                       <motion.span key={filteredChampions.length} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-yellow-500">{filteredChampions.length} Found</motion.span>
                    </div>
                    <div className="w-[1px] h-3 bg-white/10"></div>
                    <div className="text-white/20">Order: <span className="text-white/40 italic">Randomized</span></div>
                  </div>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span className="text-[8px] font-bold tracking-widest uppercase">Syncing Registry...</span>
                </div>
              ) : (
                <motion.div layout className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 lg:gap-5">
                  <AnimatePresence mode="popLayout">
                    {filteredChampions.map((champion, index) => (
                      <ChampionCard key={champion.id} champion={champion} index={index} onClick={handleSelectChampion} />
                    ))}
                  </AnimatePresence>
                  {!searchQuery && Array.from({ length: placeholderCount }).map((_, i) => (
                    <motion.div key={`placeholder-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} onClick={() => setView('REGISTER')} className="group relative flex flex-col bg-neutral-950/40 border border-white/5 overflow-hidden transition-all duration-500 cursor-pointer aspect-[3/4.2] sm:aspect-auto">
                       <div className="relative aspect-square bg-neutral-900/50 flex items-center justify-center overflow-hidden">
                          <svg className="w-1/2 h-1/2 text-white/5 opacity-40 group-hover:opacity-100 group-hover:text-yellow-500/20 transition-all duration-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                          <div className="absolute inset-0 border-2 border-dashed border-white/5 group-hover:border-yellow-500/20 transition-colors"></div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="bg-black/95 backdrop-blur-2xl px-5 py-2.5 border border-white/10 shadow-2xl rounded-sm">
                               <span className="text-[9px] font-black tracking-[0.3em] text-white uppercase">Your Place Here</span>
                             </div>
                          </div>
                       </div>
                       <div className="p-2.5 sm:p-4 flex flex-col items-center justify-center h-full opacity-10 group-hover:opacity-40 transition-opacity">
                          <span className="text-[7px] font-bold tracking-[0.5em] uppercase">Pending Data</span>
                       </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {view === 'REGISTER' && <div className="py-12 md:py-24"><RegistrationForm onSuccess={() => setView('HALL_OF_FAME')} /></div>}
          {view === 'EDIT_PROFILE' && editingChampion && <div className="py-12 md:py-24"><RegistrationForm onSuccess={() => { setView('HALL_OF_FAME'); setEditingChampion(null); }} editData={editingChampion} /></div>}
          {view === 'ABOUT' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                  <h2 className="text-3xl md:text-6xl font-black serif-title mb-6 uppercase tracking-tighter">Certification</h2>
                  <div className="w-12 h-1 bg-yellow-500/30 mx-auto mb-8"></div>
               </motion.div>
               <div className="grid grid-cols-1 gap-6 md:gap-10">
                  {Object.entries(CERT_DETAILS).map(([key, detail]) => (
                    <div key={key} className="bg-neutral-950/50 p-6 md:p-10 border border-white/5 rounded-sm">
                      <span className={`text-[10px] font-black tracking-widest uppercase mb-2 block ${detail.color}`}>{key} RANK</span>
                      <h3 className="text-xl md:text-3xl font-bold mb-4">{detail.desc}</h3>
                    </div>
                  ))}
               </div>
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
        &copy; 2025 AI Champion Hall of Fame. National Digital Initiative.
      </footer>
    </div>
  );
};

export default App;
