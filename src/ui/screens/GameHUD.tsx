import React, { useEffect, useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { HealthBar } from '../components/HealthBar';
import { XPBar } from '../components/XPBar';
import { WeaponSlots } from '../components/WeaponSlots';
import { BossHealthBar } from '../components/BossHealthBar';
import { WaveBar } from '../components/WaveBar';
import { DashButton } from '../components/DashButton';
import { KillCounter } from '../components/KillCounter';
import { PauseButton } from '../components/PauseButton';
import { DamageFlash } from '../components/DamageFlash';
import { EnemiesRemaining } from '../components/EnemiesRemaining';

export interface GameHUDProps {
  onPause: () => void;
  onDash: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  onPause,
  onDash,
}) => {
  const {
    currentWave,
    runTime,
    killCount,
    waveProgress,
    playerHP,
    playerMaxHP,
    playerLevel,
    xp,
    xpToNext,
    equippedWeapons,
    dashCooldownRemaining,
    dashCooldownMax,
    activeBoss,
    enemiesRemaining,
  } = useGameState();

  const damageTrigger = playerHP; // use HP changes as damage trigger

  // Objective text fades after 3s
  const [showObjective, setShowObjective] = useState(true);

  useEffect(() => {
    setShowObjective(true);
    const timer = setTimeout(() => setShowObjective(false), 3000);
    return () => clearTimeout(timer);
  }, [currentWave]);

  // Next boss timer estimate (boss every 5 waves)
  const wavesUntilBoss = 5 - (currentWave % 5);
  const nextBossText = activeBoss
    ? ''
    : `Next Boss: ${wavesUntilBoss}w`;

  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Main top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'rgba(28,42,58,0.85)',
            borderBottom: '1px solid rgba(45,74,94,0.4)',
            pointerEvents: 'auto',
          }}
        >
          {/* Left: Pause */}
          <PauseButton onPause={onPause} />

          {/* Center: Wave + Time */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 9, color: '#e8edf2' }}>
              WAVE {currentWave}
            </span>
            <span style={{ fontSize: 7, color: '#7a8fa0' }}>
              {formatTime(runTime)}
            </span>
          </div>

          {/* Right: Kills */}
          <KillCounter kills={killCount} />
        </div>

        {/* Wave progress bar */}
        <WaveBar progress={waveProgress} />
      </div>

      {/* Objective text */}
      {showObjective && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: '#00e5ff',
              textShadow: '0 0 10px #00e5ff66',
              opacity: showObjective ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          >
            Survive the wave!
          </span>
        </div>
      )}

      {/* Boss HP bar */}
      {activeBoss && (
        <BossHealthBar
          name={activeBoss.name}
          hp={activeBoss.hp}
          maxHP={activeBoss.maxHP}
        />
      )}

      {/* Health bar + Weapons - top left area below bar */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pointerEvents: 'auto',
        }}
      >
        <HealthBar hp={playerHP} maxHP={playerMaxHP} />
        <WeaponSlots weapons={equippedWeapons} />
      </div>

      {/* Dash button - right side */}
      <div
        style={{
          position: 'absolute',
          right: 16,
          bottom: 100,
          pointerEvents: 'auto',
        }}
      >
        <DashButton
          cooldownRemaining={dashCooldownRemaining}
          cooldownMax={dashCooldownMax}
          onDash={onDash}
        />
      </div>

      {/* Joystick zone indicator - left side */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 100,
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: '1px solid rgba(45,74,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: 'rgba(45,74,94,0.15)',
            border: '1px solid rgba(45,74,94,0.3)',
          }}
        />
      </div>

      {/* Bottom section */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* XP bar */}
        <XPBar xp={xp} xpToNext={xpToNext} level={playerLevel} />

        {/* Bottom info bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            backgroundColor: 'rgba(28,42,58,0.85)',
            borderTop: '1px solid rgba(45,74,94,0.4)',
          }}
        >
          <EnemiesRemaining count={enemiesRemaining} />
          {nextBossText && (
            <span style={{ fontSize: 8, color: '#7a8fa0' }}>
              {nextBossText}
            </span>
          )}
        </div>
      </div>

      {/* Damage flash overlay */}
      <DamageFlash trigger={damageTrigger} />
    </div>
  );
};
