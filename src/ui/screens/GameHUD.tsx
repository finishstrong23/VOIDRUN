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

  const damageTrigger = playerHP;

  const [showObjective, setShowObjective] = useState(true);

  useEffect(() => {
    setShowObjective(true);
    const timer = setTimeout(() => setShowObjective(false), 3000);
    return () => clearTimeout(timer);
  }, [currentWave]);

  const wavesUntilBoss = 5 - (currentWave % 5);
  const nextBossText = activeBoss
    ? ''
    : `Boss: ${wavesUntilBoss}w`;

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
      {/* ═══ TOP SECTION ═══ */}
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
        {/* Main top bar — gradient panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'linear-gradient(180deg, rgba(20,32,48,0.95) 0%, rgba(15,25,38,0.9) 100%)',
            borderBottom: '1.5px solid rgba(50,80,110,0.35)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
          }}
        >
          {/* Left: Pause */}
          <PauseButton onPause={onPause} />

          {/* Center: Wave info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '4px 16px',
              borderRadius: 10,
              background: 'linear-gradient(180deg, rgba(50,20,28,0.8) 0%, rgba(35,12,18,0.8) 100%)',
              border: '1px solid rgba(180,50,70,0.4)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: '#ff8090',
                textShadow: '0 0 8px rgba(255,80,100,0.3)',
                letterSpacing: 1,
              }}
            >
              WAVE {currentWave}
            </span>
            <span
              style={{
                fontSize: 9,
                color: '#e8d8c0',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
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
              fontSize: 10,
              color: '#e8d8c0',
              textShadow: '0 1px 4px rgba(0,0,0,0.6), 0 0 12px rgba(255,200,150,0.2)',
              padding: '4px 16px',
              borderRadius: 8,
              background: 'rgba(15,20,30,0.6)',
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

      {/* Health bar + Weapons — top left below bar */}
      <div
        style={{
          position: 'absolute',
          top: 68,
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

      {/* ═══ DASH BUTTON — right side ═══ */}
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

      {/* Joystick zone — left side */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 100,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(40,60,80,0.1) 0%, transparent 70%)',
          border: '1.5px solid rgba(60,90,120,0.15)',
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
            background: 'radial-gradient(circle, rgba(60,90,120,0.2) 0%, rgba(40,60,80,0.1) 100%)',
            border: '1px solid rgba(60,90,120,0.25)',
          }}
        />
      </div>

      {/* ═══ BOTTOM SECTION ═══ */}
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
            padding: '5px 12px',
            background: 'linear-gradient(180deg, rgba(15,25,38,0.9) 0%, rgba(10,18,28,0.95) 100%)',
            borderTop: '1px solid rgba(50,80,110,0.3)',
          }}
        >
          <EnemiesRemaining count={enemiesRemaining} />
          {nextBossText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Boss icon */}
              <svg width={14} height={14} viewBox="0 0 14 14">
                <circle cx={7} cy={6} r={4.5} fill="#3a1525" stroke="#6a2535" strokeWidth={0.5} />
                <circle cx={5.5} cy={5.5} r={1} fill="#ff4060" />
                <circle cx={8.5} cy={5.5} r={1} fill="#ff4060" />
                <path d="M4 2 L3 0.5" stroke="#5a2030" strokeWidth={1} strokeLinecap="round" />
                <path d="M10 2 L11 0.5" stroke="#5a2030" strokeWidth={1} strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 7, color: '#90a0b8' }}>
                {nextBossText}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Damage flash overlay */}
      <DamageFlash trigger={damageTrigger} />
    </div>
  );
};
