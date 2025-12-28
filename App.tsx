
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

  const filteredChampions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return champions;
    return champions.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.department.toLowerCase().includes(query)
    );
  }, [champions, searchQuery]);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black">
      <Background3D />
      <Navigation currentView={view} setView={setView} />

      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-10"
        >
          {view === 'HOME' && (
            <Hero 
              onExplore={() => setView('HALL_OF_FAME')} 
              onJoin={() => setView('REGISTER')} 
            />
          )}

          {view === 'HALL_OF_FAME' && (
            <div className="max-w-7xl mx-auto px-6 py-24">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 text-center"
              >
                <h2 className="text-4xl md:text-5xl font-light serif-title mb-6 tracking-tight uppercase">The Hall of <span className="gold-text font-black">Prestige</span></h2>
                <div className="w-20 h-[1px] bg-yellow-500/50 mx-auto mb-8"></div>
                <p className="text-white/40 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                  대한민국 공공분야의 디지털 대전환을 선도하는 정예 요원들입니다.<br/>
                  지능형 행정의 역사를 새롭게 써 내려가는 그들의 비전을 만나보세요.
                </p>

                <div className="max-w-lg mx-auto relative group">
                  <div className="absolute inset-0 bg-yellow-500/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="성함 또는 소속 부처 검색"
                      className="w-full bg-white/5 border border-white/10 px-8 py-4 rounded-full text-sm font-light focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 backdrop-blur-md"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">Syncing with Master Database...</span>
                </div>
              ) : filteredChampions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                  {filteredChampions.map((champion, index) => (
                    <ChampionCard 
                      key={champion.id} 
                      champion={champion} 
                      index={index}
                      onClick={handleSelectChampion}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-white/20 font-light italic">검색 결과에 해당하는 챔피언이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {view === 'REGISTER' && (
            <div className="py-24">
              <RegistrationForm onSuccess={() => setView('HALL_OF_FAME')} />
            </div>
          )}

          {view === 'EDIT_PROFILE' && editingChampion && (
            <div className="py-24">
              <RegistrationForm 
                onSuccess={() => {
                  setView('HALL_OF_FAME');
                  setEditingChampion(null);
                }} 
                editData={editingChampion}
              />
            </div>
          )}

          {view === 'ABOUT' && (
            <div className="max-w-7xl mx-auto px-6 py-32">
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-32"
               >
                  <h2 className="text-5xl md:text-7xl font-black serif-title mb-8 uppercase tracking-tighter">Certification <span className="gold-text">Hierarchy</span></h2>
                  <div className="w-24 h-1 bg-yellow-500/30 mx-auto mb-10"></div>
                  <p className="text-white/40 font-light max-w-2xl mx-auto text-lg leading-relaxed">
                    대한민국 공공 AI 전문가로서의 여정은 세 단계의 엄격한 인증 과정을 통해<br/> 그 가치를 인정받습니다. 등급이 높을수록 국가적 파급력이 입증된 리더를 의미합니다.
                  </p>
               </motion.div>

               <div className="grid grid-cols-1 gap-16">
                  {Object.entries(CERT_DETAILS).map(([key, detail], idx) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.01 }}
                      className={`relative group p-1 md:p-[2px] rounded-sm overflow-hidden bg-gradient-to-br ${key === 'BLACK' ? 'from-yellow-500/50 via-white/20 to-yellow-900/50' : key === 'BLUE' ? 'from-blue-500/50 to-blue-900/50' : 'from-emerald-500/50 to-emerald-900/50'}`}
                    >
                      <div className="bg-neutral-950 p-10 md:p-16 flex flex-col lg:flex-row gap-16 relative">
                        {/* Huge Decorative Letter */}
                        <div className={`absolute top-0 right-10 text-[200px] font-black italic opacity-[0.03] select-none pointer-events-none ${detail.color}`}>
                          {key[0]}
                        </div>

                        <div className="lg:w-2/5">
                          <span className={`text-sm font-black tracking-[0.5em] uppercase block mb-6 ${detail.color}`}>Rank Certificate</span>
                          <h3 className={`text-5xl font-black tracking-tighter uppercase mb-6 serif-title ${key === 'BLACK' ? 'gold-text' : detail.color}`}>{detail.title}</h3>
                          <div className={`w-16 h-1.5 ${detail.accent} mb-10`}></div>
                          <p className="text-2xl font-bold text-white/90 leading-tight mb-4">{detail.desc}</p>
                          <p className="text-white/40 font-light leading-relaxed">
                            {key === 'BLACK' ? '국가 AI 정책의 기틀을 마련하고 대규모 인프라를 혁신한 최상위 전문가 집단입니다.' : 
                             key === 'BLUE' ? '복잡한 알고리즘을 실무에 성공적으로 이식하여 정량적 성과를 입증한 핵심 요원입니다.' : 
                             'AI 기술의 행정 도입을 기획하고 생성형 AI를 실무에 창의적으로 활용하는 선구적 실무자입니다.'}
                          </p>
                        </div>
                        
                        <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-8 self-center">
                          <div className={`p-8 bg-white/5 border border-white/10 rounded-sm group-hover:${detail.border} transition-colors`}>
                            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Core Competency</h4>
                            <p className="text-base text-white/70 leading-relaxed font-light">
                              {key === 'GREEN' ? '생성형 AI의 행정 업무 적용 및 기초 데이터 활용 역량, 디지털 전환 초기 가속화 주도' : 
                               key === 'BLUE' ? '고급 분석 알고리즘 설계 및 실질적 구현 능력, 부처 내 데이터 기반 의사결정 체계 확립' : 
                               '국가적 AI 거버넌스 수립 및 초거대 AI 기반의 범정부 공통 인프라 기획 및 아키텍처 설계'}
                            </p>
                          </div>
                          <div className={`p-8 bg-white/5 border border-white/10 rounded-sm group-hover:${detail.border} transition-colors`}>
                            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Requirement</h4>
                            <ul className="text-sm text-white/60 space-y-3 font-light">
                              <li className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${detail.accent}`}></div> 전용 교육 과정 이수</li>
                              <li className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${detail.accent}`}></div> {key === 'BLACK' ? '국가 프로젝트 3건 이상' : key === 'BLUE' ? '실무 과제 90점 이상' : '실무 활용 포트폴리오'}</li>
                              <li className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${detail.accent}`}></div> 전문 위원회 최종 심사 통과</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
      />

      <footer className="py-24 border-t border-white/5 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center space-x-6 mb-12 opacity-30">
            <span className="text-[11px] font-black tracking-[0.6em] uppercase">Ministry of Interior</span>
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            <span className="text-[11px] font-black tracking-[0.6em] uppercase">Digital Platform Govt</span>
          </div>
          <p className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-bold text-center leading-loose">
            &copy; 2025 AI Champion Hall of Fame. Authentic Distinction for Digital Architects.<br/>
            All data is synchronized with Supabase Persistent Cloud Infrastructure.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
