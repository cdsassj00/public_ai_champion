
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, Champion } from './types';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

  useEffect(() => {
    const data = storageService.getChampions();
    setChampions(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSearchQuery('');
  }, [view]);

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
                <h2 className="text-4xl md:text-5xl font-light serif-title mb-6 tracking-tight">명예의 전당</h2>
                <div className="w-20 h-[1px] bg-yellow-500/50 mx-auto mb-8"></div>
                <p className="text-white/40 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                  대한민국 공공분야의 디지털 대전환을 선도하는 정예 요원들입니다.<br/>
                  지능형 행정의 역사를 새롭게 써 내려가는 그들의 비전을 만나보세요.
                </p>

                {/* Search Bar Implementation with enhanced aesthetics */}
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

              {filteredChampions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  {filteredChampions.map((champion, index) => (
                    <ChampionCard 
                      key={champion.id} 
                      champion={champion} 
                      index={index}
                      onClick={setSelectedChampion}
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

          {view === 'ABOUT' && (
            <div className="max-w-5xl mx-auto px-6 py-24">
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-24"
               >
                  <h2 className="text-4xl md:text-5xl font-light serif-title mb-6">인증 체계</h2>
                  <p className="text-white/40 font-light">공공 AI 전문가로서의 여정을 지원합니다.</p>
               </motion.div>

               <div className="grid gap-12">
                  {Object.entries(CERT_DETAILS).map(([key, detail], idx) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="group p-10 bg-neutral-900/20 border border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row gap-10"
                    >
                      <div className="md:w-1/3">
                        <span className={`text-4xl font-black tracking-tighter uppercase block mb-4 ${detail.color}`}>{detail.title}</span>
                        <div className="w-12 h-1 bg-yellow-500/20 mb-6"></div>
                        <p className="text-lg font-bold text-white/90 leading-snug">{detail.desc}</p>
                      </div>
                      
                      <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-black/40 border border-white/5">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Core Competency</h4>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {key === 'GREEN' ? '생성형 AI의 행정 업무 적용 및 기초 데이터 활용 역량' : key === 'BLUE' ? '고급 분석 알고리즘 설계 및 실질적 구현 능력' : '국가적 AI 정책 수립 및 조직 전체의 혁신 리딩'}
                          </p>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Requirement</h4>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {key === 'BLACK' ? '최소 3개 이상의 국가 프로젝트 성공 사례' : '실무 과제 80점 이상 획득 및 포트폴리오 심사'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          )}
        </motion.main>
      </AnimatePresence>

      {/* Global Detail Modal */}
      <ChampionModal 
        champion={selectedChampion} 
        onClose={() => setSelectedChampion(null)} 
      />

      <footer className="py-20 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-10 opacity-30">
            <span className="text-[10px] font-bold tracking-[0.5em] uppercase">Ministry of Interior</span>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <span className="text-[10px] font-bold tracking-[0.5em] uppercase">NIA</span>
          </div>
          <p className="text-[9px] text-white/20 tracking-[0.2em] uppercase font-medium text-center">
            &copy; 2025 AI Champion Hall of Fame. Crafted for Digital Leaders.<br/>
            All profiles are stored securely in your browser's persistent database.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
