import React from 'react';

interface Props {
  kills: number;
}

export const KillCounter: React.FC<Props> = ({ kills }) => (
  <span style={{
    fontSize: '10px',
    color: '#ef4444',
    fontFamily: "'Press Start 2P', monospace",
  }}>
    {kills}
  </span>
);
