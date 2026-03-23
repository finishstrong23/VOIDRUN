import React from 'react';

interface Props {
  onPause: () => void;
}

export const PauseButton: React.FC<Props> = ({ onPause }) => (
  <button
    onClick={onPause}
    className="flex items-center justify-center rounded"
    style={{
      width: 48,
      height: 48,
      backgroundColor: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff',
      fontSize: '18px',
      cursor: 'pointer',
      touchAction: 'manipulation',
    }}
  >
    ||
  </button>
);
