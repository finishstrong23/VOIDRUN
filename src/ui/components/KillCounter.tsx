import React from 'react';

interface KillCounterProps {
  kills: number;
}

export const KillCounter: React.FC<KillCounterProps> = ({ kills }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 12,
        background: 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
        border: '1px solid rgba(60,85,110,0.4)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      {/* Skull SVG icon */}
      <svg width={16} height={16} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
        <ellipse cx={8} cy={7} rx={5.5} ry={6} fill="#d8d0c0" />
        <ellipse cx={8} cy={7} rx={5.5} ry={6} fill="none" stroke="#8a8070" strokeWidth={0.5} />
        <circle cx={6} cy={6.5} r={1.5} fill="#2a2020" />
        <circle cx={10} cy={6.5} r={1.5} fill="#2a2020" />
        <path d="M7 10 L7.5 12 L8.5 12 L9 10" fill="#2a2020" />
        <rect x={6.5} y={12} width={3} height={1.5} rx={0.5} fill="#d8d0c0" stroke="#8a8070" strokeWidth={0.3} />
      </svg>
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          color: '#e8edf2',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      >
        {kills}
      </span>
    </div>
  );
};
