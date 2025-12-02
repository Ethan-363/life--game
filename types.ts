
export type StatKey = 'intelligence' | 'vitality' | 'charisma' | 'skill' | 'wealth' | 'luck';

export type Language = 'zh' | 'en' | 'es' | 'hi' | 'fr' | 'ar' | 'pt';

export interface StatRecord {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  type?: 'event' | 'levelup';
}

export interface CharacterStats {
  intelligence: number;
  vitality: number;
  charisma: number;
  skill: number;
  wealth: number;
  luck: number;
}

export interface StatHistory {
  intelligence: StatRecord[];
  vitality: StatRecord[];
  charisma: StatRecord[];
  skill: StatRecord[];
  wealth: StatRecord[];
  luck: StatRecord[];
}

export const INITIAL_STATS: CharacterStats = {
  intelligence: 0,
  vitality: 0,
  charisma: 0,
  skill: 0,
  wealth: 0,
  luck: 0,
};

export const INITIAL_HISTORY: StatHistory = {
  intelligence: [],
  vitality: [],
  charisma: [],
  skill: [],
  wealth: [],
  luck: [],
};

// Global JSX Type Definition for React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Progressive Level Calculation
// Level 1: Requires 20 XP to complete.
// Level 2: Requires 40 XP to complete (Total 60).
// Level 3: Requires 60 XP to complete (Total 120).
// Requirement increases by 20 for each level.
export const getLevelInfo = (totalXp: number) => {
  let level = 1;
  let xpForNext = 20; // Base requirement for Level 1
  let currentXp = totalXp;

  // Loop to find current level and remaining XP
  while (currentXp >= xpForNext) {
    currentXp -= xpForNext;
    level++;
    xpForNext += 20; // Increase requirement by 20 for each subsequent level
  }

  const progress = (currentXp / xpForNext) * 100;

  return {
    level,
    currentXp,
    reqXp: xpForNext,
    progress
  };
};