
import React from 'react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="cursor-pointer group flex items-center space-x-3"
          onClick={() => setView('HOME')}
        >
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm group-hover:bg-yellow-500 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span className="text-black font-black text-lg">AI</span>
          </div>
          <span className="text-xl font-bold tracking-tight serif-title hidden sm:block">
            AI <span className="text-yellow-500">챔피언</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-8 text-sm font-medium tracking-wide">
          <button 
            onClick={() => setView('HALL_OF_FAME')}
            className={`${currentView === 'HALL_OF_FAME' ? 'text-white' : 'text-white/50'} hover:text-white transition-colors`}
          >
            챔피언 목록
          </button>
          <button 
            onClick={() => setView('ABOUT')}
            className={`${currentView === 'ABOUT' ? 'text-white' : 'text-white/50'} hover:text-white transition-colors`}
          >
            인증 안내
          </button>
          <button 
            onClick={() => setView('REGISTER')}
            className="px-5 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-yellow-500 transition-all hover:scale-105 active:scale-95"
          >
            프로필 등록
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
