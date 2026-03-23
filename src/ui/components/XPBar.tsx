import React, { useEffect, useRef, useState } from 'react';

interface XPBarProps {
  xp: number;
  xpToNext: number;
  level: number;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const XPBar: React.FC<XPBarProps> = ({ xp, xpToNext, level }) => {
  const pct = Math.max(0, Math.min(1, xp / xpToNext)) * 100;
  const [flash, setFlash] = useState(false);
  const prevLevel = useRef(level);

  useEffect(() => {
    if (level > prevLevel.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 400);
      prevLevel.current = level;
      return () => clearTimeout(timer);
    }
    prevLevel.current = level;
  }, [level]);

  return (
    <div
      style={{
        ...baseStyle,
        width: '100%',
        height: 28,
        backgroundColor: 'rgba(28,42,58,0.85)',
        border: '1px solid rgba(45,74,94,0.4)',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: flash ? '#ffd60a' : '#00e5ff',
          transition: flash ? 'background-color 0.1s' : 'width 0.3s ease, background-color 0.3s ease',
          boxShadow: flash
            ? '0 0 12px #ffd60a88'
            : '0 0 6px #00e5ff44',
          position: 'absolute',
          left: 0,
          top: 0,
          borderRadius: 3,
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 8,
          fontSize: 9,
          color: flash ? '#ffd60a' : '#00e5ff',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          zIndex: 1,
        }}
      >
        LV. {level}
      </span>
    </div>
  );
};
