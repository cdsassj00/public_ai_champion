
import { Champion } from '../types';
import { SAMPLE_CHAMPIONS } from '../constants';

const STORAGE_KEY = 'ai_champions_db';

export const storageService = {
  /**
   * 모든 챔피언 데이터를 가져옵니다. 
   * 로컬 스토리지에 데이터가 없으면 초기 샘플 데이터를 로드하고 저장합니다.
   */
  getChampions: (): Champion[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // 초기 실행 시 샘플 데이터 저장 (상태는 모두 APPROVED로 설정)
      const initialData = SAMPLE_CHAMPIONS.map(c => ({ ...c, status: 'APPROVED' as const }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  },

  /**
   * 새로운 챔피언 프로필을 DB(로컬 스토리지)에 저장합니다.
   */
  saveChampion: (champion: Champion): void => {
    const champions = storageService.getChampions();
    const updated = [champion, ...champions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  /**
   * 특정 챔피언을 삭제하거나 상태를 업데이트하는 기능 (확장용)
   */
  updateChampionStatus: (id: string, status: 'APPROVED' | 'PENDING'): void => {
    const champions = storageService.getChampions();
    const updated = champions.map(c => c.id === id ? { ...c, status } : c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
