import React from 'react';
import type { EquippedWeapon } from '../hooks/useGameState';

interface WeaponSlotsProps {
  weapons: EquippedWeapon[];
}

const WEAPON_COLORS: Record<string, string> = {
  whipblade: '#00e5ff',
  voidOrbs: '#bf5af2',
  plasmaLance: '#00e5ff',
  novaBlast: '#ff9f0a',
  chainLightning: '#5e5ce6',
  droneSwarm: '#00e5ff',
};

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const WeaponSlots: React.FC<WeaponSlotsProps> = ({ weapons }) => {
  return (
    <div style={{ ...baseStyle, display: 'flex', gap: 4 }}>
      {weapons.map((w) => {
        const color = WEAPON_COLORS[w.id] || '#00e5ff';
        return (
          <div
            key={w.id}
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              backgroundColor: 'rgba(28,42,58,0.85)',
              border: `2px solid ${color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 6px ${color}44`,
            }}
          >
            <span
              style={{
                fontSize: 8,
                color,
                textShadow: `0 0 4px ${color}88`,
              }}
            >
              {w.level}
            </span>
          </div>
        );
      })}
    </div>
  );
};
