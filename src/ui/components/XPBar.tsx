import React from 'react';

interface Props {
  xp: number;
  xpToNext: number;
  level: number;
}

export const XPBar: React.FC<Props> = ({ xp, xpToNext, level }) => {
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-28 h-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div
          className="h-full rounded transition-all duration-100"
          style={{ width: `${pct}%`, backgroundColor: '#60a5fa' }}
        />
      </div>
      <span style={{ fontSize: '10px', fontFamily: "'Press Start 2P', monospace", color: '#60a5fa' }}>
        Lv.{level}
      </span>
    </div>
  );
};
