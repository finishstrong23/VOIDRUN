import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameScreen, Upgrade, RunHistoryEntry, QualityTier } from '../../types';

interface WeaponInfo {
  id: string;
  level: number;
  name: string;
}

interface BossInfo {
  name: string;
  hp: number;
  maxHP: number;
}

interface GameState {
  screen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  // Run state
  runTime: number;
  killCount: number;
  bossKills: number;
  playerHP: number;
  playerMaxHP: number;
  playerLevel: number;
  xp: number;
  xpToNext: number;
  equippedWeapons: WeaponInfo[];
  score: number;
  activeBoss: BossInfo | null;
  selectedClass: string;

  // Upgrade selection
  pendingUpgrades: Upgrade[];
  setPendingUpgrades: (upgrades: Upgrade[]) => void;

  // Meta state (persisted)
  highScore: number;
  totalKills: number;
  totalRuns: number;
  bestTime: number;
  runHistory: RunHistoryEntry[];

  // Settings (persisted)
  masterVolume: number;
  sfxEnabled: boolean;
  qualityOverride: 'auto' | QualityTier;

  // Device
  isMobile: boolean;
  currentQuality: QualityTier;

  // Actions
  startRun: (classId: string) => void;
  endRun: () => void;
  syncRunState: (state: Partial<{
    runTime: number;
    killCount: number;
    bossKills: number;
    playerHP: number;
    playerMaxHP: number;
    playerLevel: number;
    xp: number;
    xpToNext: number;
    equippedWeapons: WeaponInfo[];
    score: number;
    activeBoss: BossInfo | null;
  }>) => void;
  setVolume: (volume: number) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setQualityOverride: (quality: 'auto' | QualityTier) => void;
  setMobile: (isMobile: boolean) => void;
  setCurrentQuality: (quality: QualityTier) => void;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      setScreen: (screen) => set({ screen }),

      runTime: 0,
      killCount: 0,
      bossKills: 0,
      playerHP: 100,
      playerMaxHP: 100,
      playerLevel: 1,
      xp: 0,
      xpToNext: 10,
      equippedWeapons: [],
      score: 0,
      activeBoss: null,
      selectedClass: '',

      pendingUpgrades: [],
      setPendingUpgrades: (upgrades) => set({ pendingUpgrades: upgrades }),

      highScore: 0,
      totalKills: 0,
      totalRuns: 0,
      bestTime: 0,
      runHistory: [],

      masterVolume: 1.0,
      sfxEnabled: true,
      qualityOverride: 'auto',

      isMobile: false,
      currentQuality: 'high',

      startRun: (classId) => set({
        screen: 'playing',
        selectedClass: classId,
        runTime: 0,
        killCount: 0,
        bossKills: 0,
        playerHP: 100,
        playerMaxHP: 100,
        playerLevel: 1,
        xp: 0,
        xpToNext: 10,
        equippedWeapons: [],
        score: 0,
        activeBoss: null,
        pendingUpgrades: [],
      }),

      endRun: () => {
        const state = get();
        const entry: RunHistoryEntry = {
          score: state.score,
          time: state.runTime,
          kills: state.killCount,
          level: state.playerLevel,
          date: Date.now(),
          className: state.selectedClass,
        };
        const history = [entry, ...state.runHistory].slice(0, 20);
        set({
          highScore: Math.max(state.highScore, state.score),
          totalKills: state.totalKills + state.killCount,
          totalRuns: state.totalRuns + 1,
          bestTime: Math.max(state.bestTime, state.runTime),
          runHistory: history,
        });
      },

      syncRunState: (runState) => set(runState),

      setVolume: (volume) => set({ masterVolume: volume }),
      setSfxEnabled: (enabled) => set({ sfxEnabled: enabled }),
      setQualityOverride: (quality) => set({ qualityOverride: quality }),
      setMobile: (isMobile) => set({ isMobile }),
      setCurrentQuality: (quality) => set({ currentQuality: quality }),
    }),
    {
      name: 'voidrun-storage',
      partialize: (state) => ({
        highScore: state.highScore,
        totalKills: state.totalKills,
        totalRuns: state.totalRuns,
        bestTime: state.bestTime,
        runHistory: state.runHistory,
        masterVolume: state.masterVolume,
        sfxEnabled: state.sfxEnabled,
        qualityOverride: state.qualityOverride,
      }),
    }
  )
);
