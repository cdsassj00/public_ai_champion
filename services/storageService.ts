
const OWNERSHIP_KEY = 'my_champion_ids';

export const storageService = {
  isOwner: (id: string): boolean => {
    const myIds = JSON.parse(localStorage.getItem(OWNERSHIP_KEY) || '[]');
    return myIds.includes(id);
  },

  addOwnership: (id: string): void => {
    const myIds = JSON.parse(localStorage.getItem(OWNERSHIP_KEY) || '[]');
    if (!myIds.includes(id)) {
      myIds.push(id);
      localStorage.setItem(OWNERSHIP_KEY, JSON.stringify(myIds));
    }
  }
};
