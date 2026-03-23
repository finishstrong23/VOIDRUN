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
        height: 8,
        background: 'linear-gradient(180deg, #1a0a0e 0%, #0d0508 100%)',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(180deg, #ff5060 0%, #d82040 50%, #b01830 100%)',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 8px rgba(255,45,85,0.4)',
          position: 'relative',
        }}
      >
        {/* Glossy top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
      </div>
    </div>
  );
};
