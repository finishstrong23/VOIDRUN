import React from 'react';

interface BossHealthBarProps {
  name: string;
  hp: number;
  maxHP: number;
}

export const BossHealthBar: React.FC<BossHealthBarProps> = ({ name, hp, maxHP }) => {
  const pct = Math.max(0, Math.min(1, hp / maxHP)) * 100;

  return (
    <div
      style={{
        width: '70%',
        position: 'absolute',
        top: 52,
        left: '15%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        zIndex: 20,
      }}
    >
      {/* Boss name */}
      <div
        style={{
          padding: '3px 14px',
          borderRadius: 8,
          background: 'linear-gradient(180deg, #3a1520 0%, #2a0e18 100%)',
          border: '1px solid #6a2535',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            color: '#ff6878',
            textShadow: '0 0 8px rgba(255,45,85,0.4)',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {name}
        </span>
      </div>

      {/* Health bar */}
      <div
        style={{
          width: '100%',
          height: 16,
          borderRadius: 8,
          background: 'linear-gradient(180deg, #1a0a0e 0%, #2a1218 100%)',
          border: '1.5px solid #6a2535',
          boxShadow: '0 0 10px rgba(255,45,85,0.2), inset 0 2px 4px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(180deg, #ff5060 0%, #d82040 50%, #b01830 100%)',
            borderRadius: 7,
            transition: 'width 0.2s ease',
            position: 'relative',
          }}
        >
          {/* Glossy highlight */}
          <div
            style={{
              position: 'absolute',
              top: 1,
              left: 2,
              right: 2,
              height: '40%',
              borderRadius: '6px 6px 0 0',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
