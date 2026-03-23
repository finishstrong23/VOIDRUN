import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Game } from './game/Game';
import { useGameState } from './ui/hooks/useGameState';
import { useWakeLock } from './ui/hooks/useWakeLock';
import { initAudio } from './utils/sound';
import { isMobileDevice } from './utils/device';
import { TitleScreen } from './ui/screens/TitleScreen';
import { ClassSelect } from './ui/screens/ClassSelect';
import { GameHUD } from './ui/screens/GameHUD';
import { UpgradeSelect } from './ui/screens/UpgradeSelect';
import { PauseMenu } from './ui/screens/PauseMenu';
import { DeathScreen } from './ui/screens/DeathScreen';
import { StatsScreen } from './ui/screens/StatsScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import type { Upgrade } from './types';

export const App: React.FC = () => {
  const gameRef = useRef<Game | null>(null);
  const gameReadyRef = useRef(false);
  const [gameReady, setGameReady] = useState(false);
  const {
    screen, setScreen,
    pendingUpgrades, setPendingUpgrades,
    startRun, endRun, syncRunState,
    setMobile,
  } = useGameState();
  const prevScreenRef = useRef(screen);

  useWakeLock(screen === 'playing');

  // Initialize game engine
  useEffect(() => {
    const container = document.getElementById('game-canvas-container');
    if (!container || gameRef.current) return;

    initAudio();
    setMobile(isMobileDevice());
    setScreen('title');

    const game = new Game();
    gameRef.current = game;

    game.init(container).then(() => {
      gameReadyRef.current = true;
      setGameReady(true);

      game.setOnStateSync((state) => {
        syncRunState(state as Parameters<typeof syncRunState>[0]);
      });

      game.setOnLevelUp((options) => {
        game.isPaused = true;
        setPendingUpgrades(options);
        setScreen('upgrade_select');
      });

      game.setOnPlayerDeath(() => {
        endRun();
        setScreen('dead');
      });

      game.setOnBossSpawn((name, hp, maxHP) => {
        syncRunState({ activeBoss: { name, hp, maxHP } } as Parameters<typeof syncRunState>[0]);
      });

      game.setOnBossUpdate((hp) => {
        const state = useGameState.getState();
        if (state.activeBoss) {
          syncRunState({ activeBoss: { ...state.activeBoss, hp } } as Parameters<typeof syncRunState>[0]);
        }
      });

      game.setOnBossDeath(() => {
        syncRunState({ activeBoss: null } as Parameters<typeof syncRunState>[0]);
      });
    }).catch((err) => {
      console.error('[VOIDRUN] Game init failed:', err);
      // Still allow menu navigation even if game fails
      gameReadyRef.current = true;
      setGameReady(true);
    });

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  // Track previous screen for settings back navigation
  useEffect(() => {
    if (screen !== 'settings') prevScreenRef.current = screen;
  }, [screen]);

  const handleClassSelect = useCallback((classId: string) => {
    if (!gameReadyRef.current) return;
    startRun(classId);
    gameRef.current?.startRun(classId);
  }, [startRun]);

  const handlePause = useCallback(() => {
    gameRef.current?.pause();
    setScreen('paused');
  }, [setScreen]);

  const handleResume = useCallback(() => {
    gameRef.current?.resume();
    setScreen('playing');
  }, [setScreen]);

  const handleUpgradeSelect = useCallback((upgrade: Upgrade) => {
    gameRef.current?.selectUpgrade(upgrade);
    setPendingUpgrades([]);
    setScreen('playing');
  }, [setScreen, setPendingUpgrades]);

  const handleQuit = useCallback(() => {
    gameRef.current?.stopLoop();
    endRun();
    setScreen('title');
  }, [setScreen, endRun]);

  const handlePlayAgain = useCallback(() => {
    if (!gameReadyRef.current) return;
    const classId = useGameState.getState().selectedClass ?? 'voidwalker';
    startRun(classId);
    gameRef.current?.startRun(classId);
  }, [startRun]);

  const handleDash = useCallback(() => {
    gameRef.current?.triggerDash();
  }, []);

  return (
    <>
      <div id="game-canvas-container" />
      <div id="ui-overlay">
        {screen === 'title' && <TitleScreen />}
        {screen === 'class_select' && (
          <ClassSelect onSelect={handleClassSelect} onBack={() => setScreen('title')} ready={gameReady} />
        )}
        {screen === 'playing' && <GameHUD onPause={handlePause} onDash={handleDash} />}
        {screen === 'upgrade_select' && pendingUpgrades.length > 0 && (
          <UpgradeSelect options={pendingUpgrades} onSelect={handleUpgradeSelect} />
        )}
        {screen === 'paused' && (
          <PauseMenu onResume={handleResume} onQuit={handleQuit} onSettings={() => setScreen('settings')} />
        )}
        {screen === 'dead' && (
          <DeathScreen onPlayAgain={handlePlayAgain} onMenu={() => setScreen('title')} />
        )}
        {screen === 'stats' && <StatsScreen onBack={() => setScreen('title')} />}
        {screen === 'settings' && (
          <SettingsScreen onBack={() => setScreen(prevScreenRef.current === 'paused' ? 'paused' : 'title')} />
        )}
      </div>
    </>
  );
};
