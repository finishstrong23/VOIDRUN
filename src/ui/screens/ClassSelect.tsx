import React from 'react';
import { CLASSES } from '../../data/classes';

interface ClassSelectProps {
  onSelect: (classId: string) => void;
  onBack: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const WEAPON_NAMES: Record<string, string> = {
  whipblade: 'Whipblade',
  voidOrbs: 'Void Orbs',
  plasmaLance: 'Plasma Lance',
};

export const ClassSelect: React.FC<ClassSelectProps> = ({ onSelect, onBack }) => {
  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0f1923',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px',
        gap: 20,
        zIndex: 900,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: 16,
          color: '#e8edf2',
          margin: 0,
          letterSpacing: 3,
          textShadow: '0 0 10px rgba(0,229,255,0.3)',
        }}
      >
        SELECT CLASS
      </h2>

      {/* Class cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: '100%',
          maxWidth: 340,
        }}
      >
        {CLASSES.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelect(cls.id)}
            style={{
              ...baseStyle,
              width: '100%',
              backgroundColor: 'rgba(28,42,58,0.85)',
              border: `2px solid ${cls.accent}`,
              borderRadius: 8,
              padding: '16px 14px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: `0 0 12px ${cls.accent}22, inset 0 0 20px ${cls.accent}08`,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: cls.accent,
                textShadow: `0 0 8px ${cls.accent}66`,
              }}
            >
              {cls.name}
            </span>
            <span
              style={{
                fontSize: 8,
                color: '#7a8fa0',
                lineHeight: 1.4,
              }}
            >
              {cls.tagline}
            </span>
            <span
              style={{
                fontSize: 7,
                color: '#e8edf2',
                opacity: 0.7,
              }}
            >
              Weapon: {WEAPON_NAMES[cls.startingWeapon] || cls.startingWeapon}
            </span>
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          ...baseStyle,
          backgroundColor: 'transparent',
          color: '#7a8fa0',
          border: '1px solid rgba(45,74,94,0.4)',
          borderRadius: 6,
          padding: '10px 24px',
          cursor: 'pointer',
          fontSize: 9,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          marginTop: 8,
        }}
      >
        BACK
      </button>
    </div>
  );
};
