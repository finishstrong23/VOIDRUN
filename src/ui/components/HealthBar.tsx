import React from 'react';

interface HealthBarProps {
  hp: number;
  maxHP: number;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const HealthBar: React.FC<HealthBarProps> = ({ hp, maxHP }) => {
  const pct = Math.max(0, Math.min(1, hp / maxHP)) * 100;
  const fillColor = pct > 60 ? '#30d158' : pct > 30 ? '#ff9f0a' : '#ff2d55';

  return (
    <div
      style={{
        ...baseStyle,
        width: 140,
        height: 16,
        backgroundColor: 'rgba(28,42,58,0.85)',
        borderRadius: 4,
        border: '1px solid rgba(45,74,94,0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: 3,
          transition: 'width 0.2s ease, background-color 0.3s ease',
          boxShadow: `0 0 6px ${fillColor}44`,
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 8,
          color: '#e8edf2',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
        }}
      >
        {hp}/{maxHP}
      </span>
    </div>
  );
};
