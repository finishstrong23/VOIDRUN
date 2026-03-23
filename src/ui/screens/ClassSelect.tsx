import React from 'react';
import { CLASSES } from '../../data/classes';
import { WEAPON_DEFS } from '../../weapons/WeaponRegistry';

interface Props {
  onSelect: (classId: string) => void;
  onBack: () => void;
}

export const ClassSelect: React.FC<Props> = ({ onSelect, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4"
      style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <h2 style={{ fontSize: '14px', color: '#fff', marginBottom: 24 }}>
        SELECT CLASS
      </h2>

      <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 360 }}>
        {CLASSES.map(cls => {
          const hex = '#' + cls.color.toString(16).padStart(6, '0');
          const weaponName = WEAPON_DEFS[cls.startingWeapon]?.name || cls.startingWeapon;
          return (
            <button
              key={cls.id}
              onClick={() => onSelect(cls.id)}
              className="rounded p-4 text-left"
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: `2px solid ${hex}`,
                cursor: 'pointer',
                fontFamily: "'Press Start 2P', monospace",
                touchAction: 'manipulation',
              }}
            >
              <div style={{ fontSize: '12px', color: hex, marginBottom: 4 }}>
                {cls.name}
              </div>
              <div style={{ fontSize: '7px', color: '#aaa', marginBottom: 6 }}>
                {cls.tagline}
              </div>
              <div style={{ fontSize: '7px', color: '#666' }}>
                Weapon: {weaponName}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="mt-6"
        style={{
          backgroundColor: 'transparent',
          color: '#666',
          fontSize: '8px',
          border: '1px solid #333',
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: "'Press Start 2P', monospace",
          borderRadius: 4,
          touchAction: 'manipulation',
        }}
      >
        BACK
      </button>
    </div>
  );
};
