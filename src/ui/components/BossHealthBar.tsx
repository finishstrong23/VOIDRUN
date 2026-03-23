import React from 'react';

interface BossHealthBarProps {
  name: string;
  hp: number;
  maxHP: number;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const BossHealthBar: React.FC<BossHealthBarProps> = ({ name, hp, maxHP }) => {
  const pct = Math.max(0, Math.min(1, hp / maxHP)) * 100;

  return (
    <div
      style={{
        ...baseStyle,
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
      <span
        style={{
          fontSize: 9,
          color: '#ff2d55',
          textShadow: '0 0 8px #ff2d5588, 0 0 16px #ff2d5544',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        {name}
      </span>
      <div
        style={{
          width: '100%',
          height: 14,
          backgroundColor: 'rgba(28,42,58,0.85)',
          borderRadius: 4,
          border: '1px solid #ff2d55',
          boxShadow: '0 0 10px #ff2d5533, inset 0 0 6px #ff2d5522',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ff2d55, #ff6b6b)',
            borderRadius: 3,
            transition: 'width 0.2s ease',
            boxShadow: '0 0 8px #ff2d5566',
          }}
        />
      </div>
    </div>
  );
};
