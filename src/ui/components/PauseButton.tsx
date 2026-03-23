import React from 'react';

interface PauseButtonProps {
  onPause: () => void;
}

export const PauseButton: React.FC<PauseButtonProps> = ({ onPause }) => {
  return (
    <button
      onClick={onPause}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
        border: '1.5px solid rgba(60,85,110,0.5)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg width={14} height={14} viewBox="0 0 14 14">
        <rect x={2.5} y={1.5} width={3} height={11} rx={1} fill="#c0d0e0" />
        <rect x={8.5} y={1.5} width={3} height={11} rx={1} fill="#c0d0e0" />
      </svg>
    </button>
  );
};
