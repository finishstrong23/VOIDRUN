import React from 'react';

interface WaveBarProps {
  progress: number; // 0 to 1
}

export const WaveBar: React.FC<WaveBarProps> = ({ progress }) => {
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div
      style={{
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(28,42,58,0.6)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #ff2d55, #ff6b6b)',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 6px #ff2d5544',
        }}
      />
    </div>
  );
};
