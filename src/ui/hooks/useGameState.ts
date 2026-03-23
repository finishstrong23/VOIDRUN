import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameScreen, QualityTier, Upgrade, RunHistoryEntry } from '../../types';

export interface EquippedWeapon {
  id: string;
  level: number;
  name: string;
}

export type WaveState = 'spawning' | 'clearing' | 'complete' | 'boss_warning' | 'between_waves';

export interface ActiveBoss {
  name: string;
  hp: number;
  maxHP: number;
}

export interface GameStore {
  // Screen
  screen: GameScreen;

  // Run state
  runTime: number;
  killCount: number;
  bossKills: number;
  wavesCompleted: number;
  currentWave: number;
  enemiesRemaining: number;
  waveProgress: number;
  waveState: WaveState;
  playerHP: number;
  playerMaxHP: number;
  playerLevel: number;
  xp: number;
  xpToNext: number;
  score: number;
  equippedWeapons: EquippedWeapon[];
  dashCooldownRemaining: number;
  dashCooldownMax: number;
  activeBoss: ActiveBoss | null;
  pendingUpgrades: Upgrade[];
  selectedClass: string | null;

  // Meta (persisted)
  highScore: number;
  totalKills: number;
  totalRuns: number;
  bestTime: number;
  bestWave: number;
  runHistory: RunHistoryEntry[];

  // Settings (persisted)
  masterVolume: number;
  sfxEnabled: boolean;
  qualityOverride: QualityTier | 'auto';

  // Device
  isMobile: boolean;
  currentQuality: QualityTier;

  // Actions
  startRun: (classId: string) => void;
  endRun: () => void;
  syncRunState: (state: Partial<GameStore>) => void;
  setScreen: (screen: GameScreen) => void;
  setPendingUpgrades: (upgrades: Upgrade[]) => void;
  setVolume: (volume: number) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setQualityOverride: (quality: QualityTier | 'auto') => void;
  setMobile: (isMobile: boolean) => void;
  setCurrentQuality: (quality: QualityTier) => void;
}

const initialRunState = {
  runTime: 0,
  killCount: 0,
  bossKills: 0,
  wavesCompleted: 0,
  currentWave: 1,
  enemiesRemaining: 0,
  waveProgress: 0,
  waveState: 'between_waves' as WaveState,
  playerHP: 100,
  playerMaxHP: 100,
  playerLevel: 1,
  xp: 0,
  xpToNext: 100,
  score: 0,
  equippedWeapons: [] as EquippedWeapon[],
  dashCooldownRemaining: 0,
  dashCooldownMax: 2,
  activeBoss: null as ActiveBoss | null,
  pendingUpgrades: [] as Upgrade[],
  selectedClass: null as string | null,
};

export const useGameState = create<GameStore>()(
  persist(
    (set, get) => ({
      // Screen
      screen: 'loading' as GameScreen,

      // Run state
      ...initialRunState,

      // Meta
      highScore: 0,
      totalKills: 0,
      totalRuns: 0,
      bestTime: 0,
      bestWave: 0,
      runHistory: [] as RunHistoryEntry[],

      // Settings
      masterVolume: 0.7,
      sfxEnabled: true,
      qualityOverride: 'auto' as QualityTier | 'auto',

      // Device
      isMobile: false,
      currentQuality: 'medium' as QualityTier,

      // Actions
      startRun: (classId: string) => {
        set({
          ...initialRunState,
          selectedClass: classId,
          screen: 'playing',
        });
      },

      endRun: () => {
        const state = get();
        const isHighScore = state.score > state.highScore;
        const entry: RunHistoryEntry = {
          score: state.score,
          time: state.runTime,
          kills: state.killCount,
          wave: state.currentWave,
          level: state.playerLevel,
          date: Date.now(),
          className: state.selectedClass || 'unknown',
        };
        const updatedHistory = [entry, ...state.runHistory].slice(0, 20);

        set({
          screen: 'dead',
          highScore: isHighScore ? state.score : state.highScore,
          totalKills: state.totalKills + state.killCount,
          totalRuns: state.totalRuns + 1,
          bestTime: state.runTime > state.bestTime ? state.runTime : state.bestTime,
          bestWave: state.currentWave > state.bestWave ? state.currentWave : state.bestWave,
          runHistory: updatedHistory,
        });
      },

      syncRunState: (partial) => {
        set(partial);
      },

      setScreen: (screen) => set({ screen }),
      setPendingUpgrades: (upgrades) => set({ pendingUpgrades: upgrades }),
      setVolume: (volume) => set({ masterVolume: volume }),
      setSfxEnabled: (enabled) => set({ sfxEnabled: enabled }),
      setQualityOverride: (quality) => set({ qualityOverride: quality }),
      setMobile: (isMobile) => set({ isMobile }),
      setCurrentQuality: (quality) => set({ currentQuality: quality }),
    }),
    {
      name: 'voidrun-save',
      partialize: (state) => ({
        highScore: state.highScore,
        totalKills: state.totalKills,
        totalRuns: state.totalRuns,
        bestTime: state.bestTime,
        bestWave: state.bestWave,
        runHistory: state.runHistory,
        masterVolume: state.masterVolume,
        sfxEnabled: state.sfxEnabled,
        qualityOverride: state.qualityOverride,
      }),
    }
  )
);
