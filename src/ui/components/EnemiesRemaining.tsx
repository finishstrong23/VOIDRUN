import React from 'react';

interface EnemiesRemainingProps {
  count: number;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const EnemiesRemaining: React.FC<EnemiesRemainingProps> = ({ count }) => {
  return (
    <span
      style={{
        ...baseStyle,
        fontSize: 8,
        color: '#7a8fa0',
      }}
    >
      Enemies: {count}
    </span>
  );
};
