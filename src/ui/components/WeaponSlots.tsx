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

const WEAPON_ICONS: Record<string, string> = {
  whipblade: '\u2694',    // swords
  voidOrbs: '\u25C9',     // circle
  plasmaLance: '\u2191',  // arrow
  novaBlast: '\u2738',    // star
  chainLightning: '\u26A1', // lightning
  droneSwarm: '\u2B22',   // hexagon
};

export const WeaponSlots: React.FC<WeaponSlotsProps> = ({ weapons }) => {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {weapons.map((w) => {
        const color = WEAPON_COLORS[w.id] || '#00e5ff';
        return (
          <div
            key={w.id}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(20,32,48,0.9) 100%)',
              border: `2px solid ${color}`,
              boxShadow: `0 0 6px ${color}33, inset 0 1px 2px rgba(0,0,0,0.3)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 12, lineHeight: 1 }}>
              {WEAPON_ICONS[w.id] || '\u2726'}
            </span>
            {/* Level badge */}
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                position: 'absolute',
                bottom: -2,
                right: -2,
                fontSize: 6,
                color: '#fff',
                backgroundColor: color,
                borderRadius: 4,
                padding: '1px 3px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                lineHeight: 1.2,
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
