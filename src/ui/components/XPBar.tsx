import React, { useEffect, useRef, useState } from 'react';

interface XPBarProps {
  xp: number;
  xpToNext: number;
  level: number;
}

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
        width: '100%',
        height: 32,
        background: 'linear-gradient(180deg, #0d1a28 0%, #162435 100%)',
        borderTop: '1.5px solid #2a4a60',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
      }}
    >
      {/* XP label */}
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: '#4a9cc8',
          textShadow: '0 0 6px rgba(0,180,255,0.3)',
          marginRight: 10,
          zIndex: 1,
          letterSpacing: 1,
        }}
      >
        XP
      </span>

      {/* Bar track */}
      <div
        style={{
          flex: 1,
          height: 14,
          borderRadius: 7,
          background: 'linear-gradient(180deg, #0a1520 0%, #152535 100%)',
          border: '1.5px solid #1a3a55',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: flash
              ? 'linear-gradient(180deg, #ffe040 0%, #ffc800 50%, #e0a800 100%)'
              : 'linear-gradient(180deg, #30c8ff 0%, #00a8e0 50%, #0080b8 100%)',
            borderRadius: 6,
            transition: flash ? 'background-color 0.1s' : 'width 0.3s ease',
            boxShadow: flash
              ? '0 0 12px rgba(255,200,0,0.5)'
              : '0 0 8px rgba(0,180,255,0.3)',
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

      {/* Level badge */}
      <div
        style={{
          marginLeft: 10,
          padding: '3px 10px',
          borderRadius: 8,
          background: flash
            ? 'linear-gradient(180deg, #ffe040 0%, #e0a800 100%)'
            : 'linear-gradient(180deg, #2a4a65 0%, #1a3550 100%)',
          border: flash ? '1px solid #ffd000' : '1px solid #3a6080',
          boxShadow: flash ? '0 0 10px rgba(255,200,0,0.4)' : '0 1px 3px rgba(0,0,0,0.3)',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            color: flash ? '#3a2000' : '#80c8ff',
            textShadow: flash ? 'none' : '0 0 6px rgba(0,180,255,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          LV. {level}
        </span>
      </div>
    </div>
  );
};
