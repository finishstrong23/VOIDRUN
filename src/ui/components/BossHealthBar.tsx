import React from 'react';

interface Props {
  name: string;
  hp: number;
  maxHP: number;
}

export const BossHealthBar: React.FC<Props> = ({ name, hp, maxHP }) => {
  const pct = Math.max(0, Math.min(100, (hp / maxHP) * 100));

  return (
    <div className="flex flex-col items-center mt-1" style={{ width: '70%', margin: '0 auto' }}>
      <span style={{
        fontSize: '8px',
        color: '#ef4444',
        fontFamily: "'Press Start 2P', monospace",
        marginBottom: 2,
      }}>
        {name}
      </span>
      <div className="relative w-full h-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div
          className="h-full rounded transition-all duration-200"
          style={{ width: `${pct}%`, backgroundColor: '#ef4444' }}
        />
      </div>
    </div>
  );
};
