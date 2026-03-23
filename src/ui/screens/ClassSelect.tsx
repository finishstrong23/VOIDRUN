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
        background: 'linear-gradient(180deg, #0a1018 0%, #0f1923 30%, #14202e 60%, #0d1520 100%)',
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
      <div
        style={{
          padding: '8px 24px',
          background: 'linear-gradient(180deg, rgba(30,45,65,0.9) 0%, rgba(20,32,48,0.9) 100%)',
          borderRadius: 8,
          border: '1.5px solid rgba(60,90,120,0.4)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <h2
          style={{
            fontSize: 14,
            color: '#d0dce8',
            margin: 0,
            letterSpacing: 3,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          SELECT CLASS
        </h2>
      </div>

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
        {CLASSES.map((cls) => {
          // Parse accent color for gradient
          const accentHex = cls.accent;
          return (
            <button
              key={cls.id}
              onClick={() => onSelect(cls.id)}
              style={{
                ...baseStyle,
                width: '100%',
                background: 'linear-gradient(180deg, rgba(30,42,58,0.9) 0%, rgba(20,30,45,0.9) 100%)',
                border: `2px solid ${accentHex}`,
                borderRadius: 12,
                padding: '16px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: `0 4px 12px rgba(0,0,0,0.4), 0 0 12px ${accentHex}15, inset 0 1px 1px rgba(255,255,255,0.05)`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glossy top */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '35%',
                  borderRadius: '10px 10px 0 0',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: accentHex,
                  textShadow: `0 0 8px ${accentHex}44, 0 1px 3px rgba(0,0,0,0.4)`,
                }}
              >
                {cls.name}
              </span>
              <span
                style={{
                  fontSize: 8,
                  color: '#90a0b8',
                  lineHeight: 1.4,
                }}
              >
                {cls.tagline}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width={10} height={10} viewBox="0 0 10 10">
                  <path d="M5 1 L9 5 L5 9 L1 5 Z" fill={accentHex} opacity={0.6} />
                </svg>
                <span
                  style={{
                    fontSize: 7,
                    color: '#b0c0d0',
                  }}
                >
                  {WEAPON_NAMES[cls.startingWeapon] || cls.startingWeapon}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
          color: '#90a0b8',
          border: '1.5px solid rgba(60,85,110,0.4)',
          borderRadius: 10,
          padding: '10px 24px',
          cursor: 'pointer',
          fontSize: 9,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          marginTop: 8,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          letterSpacing: 1,
        }}
      >
        BACK
      </button>
    </div>
  );
};
