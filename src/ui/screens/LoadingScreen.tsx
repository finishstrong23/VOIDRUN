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
        backgroundColor: '#0a0f14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        zIndex: 1000,
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: 32,
          color: '#00e5ff',
          textShadow: '0 0 20px #00e5ff88, 0 0 40px #00e5ff44, 0 0 60px #00e5ff22',
          margin: 0,
          letterSpacing: 6,
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
        }}
      >
        <div
          style={{
            width: '100%',
            height: 8,
            backgroundColor: 'rgba(28,42,58,0.6)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: '#00e5ff',
              borderRadius: 4,
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px #00e5ff66',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 8,
            color: '#7a8fa0',
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      {/* Tip */}
      <p
        style={{
          fontSize: 8,
          color: '#7a8fa0',
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.6,
          margin: 0,
          minHeight: 32,
        }}
      >
        {TIPS[tipIndex]}
      </p>
    </div>
  );
};
