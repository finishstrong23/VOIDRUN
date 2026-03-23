import React from 'react';

interface EnemiesRemainingProps {
  count: number;
}

export const EnemiesRemaining: React.FC<EnemiesRemainingProps> = ({ count }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Enemy icon */}
      <svg width={12} height={12} viewBox="0 0 12 12">
        <circle cx={6} cy={5} r={4} fill="#4a3060" stroke="#6a4580" strokeWidth={0.5} />
        <circle cx={4.5} cy={4.5} r={1} fill="#ff4060" />
        <circle cx={7.5} cy={4.5} r={1} fill="#ff4060" />
      </svg>
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: '#90a8c0',
        }}
      >
        {count}
      </span>
    </div>
  );
};
