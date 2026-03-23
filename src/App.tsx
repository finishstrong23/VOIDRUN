import React, { useEffect, useRef, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    screen, setScreen,
    pendingUpgrades, setPendingUpgrades,
    startRun, endRun, syncRunState,
    setMobile,
  } = useGameState();

  const prevScreen = useRef(screen);

  // Wake lock when playing
  useWakeLock(screen === 'playing');

  // Initialize game engine
  useEffect(() => {
    const container = document.getElementById('game-canvas-container');
    if (!container || gameRef.current) return;

    initAudio();
    setMobile(isMobileDevice());

    const game = new Game();
    gameRef.current = game;

    game.init(container).then(() => {
      // Set up callbacks
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
        syncRunState({ activeBoss: { name, hp, maxHP } });
      });

      game.setOnBossUpdate((hp) => {
        const state = useGameState.getState();
        if (state.activeBoss) {
          syncRunState({ activeBoss: { ...state.activeBoss, hp } });
        }
      });

      game.setOnBossDeath(() => {
        syncRunState({ activeBoss: null });
      });
    });

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleClassSelect = useCallback((classId: string) => {
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
    const classId = useGameState.getState().selectedClass;
    startRun(classId);
    gameRef.current?.startRun(classId);
  }, [startRun]);

  const handleMenu = useCallback(() => {
    setScreen('title');
  }, [setScreen]);

  return (
    <>
      <div id="game-canvas-container" ref={containerRef} />
      <div id="ui-overlay">
        {screen === 'title' && <TitleScreen />}

        {screen === 'class_select' && (
          <ClassSelect onSelect={handleClassSelect} onBack={() => setScreen('title')} />
        )}

        {screen === 'playing' && (
          <GameHUD onPause={handlePause} />
        )}

        {screen === 'upgrade_select' && pendingUpgrades.length > 0 && (
          <UpgradeSelect options={pendingUpgrades} onSelect={handleUpgradeSelect} />
        )}

        {screen === 'paused' && (
          <PauseMenu
            onResume={handleResume}
            onQuit={handleQuit}
            onSettings={() => setScreen('settings')}
          />
        )}

        {screen === 'dead' && (
          <DeathScreen onPlayAgain={handlePlayAgain} onMenu={handleMenu} />
        )}

        {screen === 'stats' && (
          <StatsScreen onBack={() => setScreen('title')} />
        )}

        {screen === 'settings' && (
          <SettingsScreen onBack={() => {
            const prev = prevScreen.current;
            setScreen(prev === 'paused' ? 'paused' : 'title');
          }} />
        )}
      </div>
    </>
  );
};
