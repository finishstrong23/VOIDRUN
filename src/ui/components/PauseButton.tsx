import React from 'react';

interface PauseButtonProps {
  onPause: () => void;
}

export const PauseButton: React.FC<PauseButtonProps> = ({ onPause }) => {
  return (
    <button
      onClick={onPause}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: 'rgba(28,42,58,0.85)',
        border: '1px solid rgba(45,74,94,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width={16} height={16} viewBox="0 0 16 16">
        <rect x={3} y={2} width={4} height={12} rx={1} fill="#e8edf2" />
        <rect x={9} y={2} width={4} height={12} rx={1} fill="#e8edf2" />
      </svg>
    </button>
  );
};
