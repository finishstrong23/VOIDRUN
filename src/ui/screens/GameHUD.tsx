import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { HealthBar } from '../components/HealthBar';
import { XPBar } from '../components/XPBar';
import { WeaponSlots } from '../components/WeaponSlots';
import { BossHealthBar } from '../components/BossHealthBar';
import { KillCounter } from '../components/KillCounter';
import { PauseButton } from '../components/PauseButton';
import { DamageFlash } from '../components/DamageFlash';

interface Props {
  onPause: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const GameHUD: React.FC<Props> = ({ onPause }) => {
  const {
    playerHP, playerMaxHP, xp, xpToNext, playerLevel,
    equippedWeapons, activeBoss, runTime, killCount,
  } = useGameState();

  return (
    <>
      <DamageFlash hp={playerHP} />

      {/* Top row */}
      <div className="flex justify-between items-start p-2">
        <div className="flex flex-col gap-1">
          <HealthBar hp={playerHP} maxHP={playerMaxHP} />
          <XPBar xp={xp} xpToNext={xpToNext} level={playerLevel} />
          <WeaponSlots weapons={equippedWeapons} />
        </div>
        <PauseButton onPause={onPause} />
      </div>

      {/* Boss bar */}
      {activeBoss && (
        <BossHealthBar
          name={activeBoss.name}
          hp={activeBoss.hp}
          maxHP={activeBoss.maxHP}
        />
      )}

      {/* Bottom row */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-3"
        style={{
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}>
        <span style={{
          fontSize: '10px',
          color: '#aaa',
          fontFamily: "'Press Start 2P', monospace",
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: 4,
        }}>
          {formatTime(runTime)}
        </span>
        <span style={{
          fontSize: '10px',
          fontFamily: "'Press Start 2P', monospace",
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: 4,
        }}>
          <KillCounter kills={killCount} />
        </span>
      </div>
    </>
  );
};
