import React from 'react';

interface Props {
  hp: number;
  maxHP: number;
}

export const HealthBar: React.FC<Props> = ({ hp, maxHP }) => {
  const pct = Math.max(0, Math.min(100, (hp / maxHP) * 100));
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';

  return (
    <div className="flex items-center gap-1">
      <div className="relative w-32 h-4 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div
          className="h-full rounded transition-all duration-200"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-white"
          style={{ fontSize: '8px', fontFamily: "'Press Start 2P', monospace" }}>
          {Math.ceil(hp)}/{maxHP}
        </span>
      </div>
    </div>
  );
};
