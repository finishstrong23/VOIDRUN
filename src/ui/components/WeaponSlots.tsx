import React from 'react';

interface WeaponInfo {
  id: string;
  level: number;
  name: string;
}

interface Props {
  weapons: WeaponInfo[];
}

const WEAPON_COLORS: Record<string, string> = {
  whipblade: '#a855f7',
  voidOrbs: '#8b5cf6',
  plasmaLance: '#22d3ee',
  novaBlast: '#f97316',
  chainLightning: '#60a5fa',
  droneSwarm: '#3b82f6',
};

export const WeaponSlots: React.FC<Props> = ({ weapons }) => {
  return (
    <div className="flex gap-1">
      {weapons.map((w, i) => (
        <div
          key={i}
          className="flex items-center justify-center rounded"
          style={{
            width: 28,
            height: 28,
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: `1px solid ${WEAPON_COLORS[w.id] || '#666'}`,
            position: 'relative',
          }}
        >
          <span style={{
            fontSize: '7px',
            color: WEAPON_COLORS[w.id] || '#fff',
            fontFamily: "'Press Start 2P', monospace",
          }}>
            {w.level}
          </span>
        </div>
      ))}
    </div>
  );
};
