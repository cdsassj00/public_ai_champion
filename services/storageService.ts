
const OWNERSHIP_KEY = 'my_champion_ids';

// 브라우저 탭이 열려있는 동안 유지되는 메모리 저장소 (localStorage 차단 대비)
const sessionOwnership = new Set<string>();

export const storageService = {
  /**
   * 해당 챔피언의 소유권(인증 여부) 확인
   */
  isOwner: (id: string): boolean => {
    // 1. 메모리(세션) 먼저 확인 (가장 빠르고 확실함)
    if (sessionOwnership.has(id)) return true;

    // 2. localStorage 확인 (차단되지 않은 환경일 경우)
    try {
      const stored = localStorage.getItem(OWNERSHIP_KEY);
      if (stored) {
        const myIds: string[] = JSON.parse(stored);
        if (myIds.includes(id)) {
          sessionOwnership.add(id);
          return true;
        }
      }
    } catch (e) {
      // localStorage 접근 불가 환경
    }
    return false;
  },

  /**
   * 소유권 추가 (인증 성공 시)
   */
  addOwnership: (id: string): void => {
    sessionOwnership.add(id); // 즉시 메모리에 반영
    
    try {
      const stored = localStorage.getItem(OWNERSHIP_KEY);
      const myIds: string[] = stored ? JSON.parse(stored) : [];
      if (!myIds.includes(id)) {
        myIds.push(id);
        localStorage.setItem(OWNERSHIP_KEY, JSON.stringify(myIds));
      }
    } catch (e) {
      console.warn("localStorage is blocked. Using session memory only.");
    }
  },

  /**
   * 소유권 제거 (삭제 성공 시)
   */
  removeOwnership: (id: string): void => {
    sessionOwnership.delete(id);
    try {
      const stored = localStorage.getItem(OWNERSHIP_KEY);
      if (stored) {
        const myIds: string[] = JSON.parse(stored);
        const filtered = myIds.filter(item => item !== id);
        localStorage.setItem(OWNERSHIP_KEY, JSON.stringify(filtered));
      }
    } catch (e) { }
  }
};
