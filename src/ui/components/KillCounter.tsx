import React from 'react';

interface KillCounterProps {
  kills: number;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const KillCounter: React.FC<KillCounterProps> = ({ kills }) => {
  return (
    <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 12 }} role="img" aria-label="skull">
        &#x1F480;
      </span>
      <span
        style={{
          fontSize: 10,
          color: '#e8edf2',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      >
        {kills}
      </span>
    </div>
  );
};
