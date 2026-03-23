import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress: number; // 0 to 1
}

const TIPS = [
  'Dash through enemies to avoid damage',
  'Collect XP gems to level up faster',
  'Each class has unique starting stats',
  'Boss waves appear every 5 waves',
  'Upgrade weapons to increase their power',
  'Stay moving to avoid getting surrounded',
  'New weapons unlock as you level up',
  'Higher waves spawn tougher enemies',
];

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, #080c12 0%, #0a1018 50%, #0d1520 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        zIndex: 1000,
      }}
    >
      {/* Atmospheric glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(200,50,80,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: 32,
          color: '#e8d0c0',
          textShadow: '0 0 20px rgba(255,100,120,0.4), 0 0 40px rgba(255,80,100,0.2), 0 2px 6px rgba(0,0,0,0.6)',
          margin: 0,
          letterSpacing: 6,
          zIndex: 1,
        }}
      >
        VOIDRUN
      </h1>

      {/* Loading bar */}
      <div
        style={{
          width: '60%',
          maxWidth: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '100%',
            height: 12,
            borderRadius: 6,
            background: 'linear-gradient(180deg, #0a1520 0%, #152535 100%)',
            border: '1.5px solid #1a3a55',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: 'linear-gradient(180deg, #e04050 0%, #c02838 50%, #901820 100%)',
              borderRadius: 5,
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(200,40,60,0.4)',
              position: 'relative',
            }}
          >
            {/* Glossy */}
            <div
              style={{
                position: 'absolute',
                top: 1,
                left: 2,
                right: 2,
                height: '40%',
                borderRadius: '4px 4px 0 0',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
              }}
            />
          </div>
        </div>
        <span
          style={{
            fontSize: 8,
            color: '#708090',
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Tip */}
      <p
        style={{
          fontSize: 7,
          color: '#607080',
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.6,
          margin: 0,
          minHeight: 32,
          zIndex: 1,
        }}
      >
        {TIPS[tipIndex]}
      </p>
    </div>
  );
};
