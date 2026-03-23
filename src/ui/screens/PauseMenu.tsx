import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const buttonBase: React.CSSProperties = {
  ...baseStyle,
  width: '100%',
  maxWidth: 240,
  padding: '12px 24px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 10,
  letterSpacing: 1,
  outline: 'none',
  WebkitTapHighlightColor: 'transparent',
};

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onSettings, onQuit }) => {
  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 300,
      }}
    >
      <h2
        style={{
          fontSize: 20,
          color: '#e8edf2',
          margin: '0 0 20px 0',
          letterSpacing: 4,
          textShadow: '0 0 10px rgba(0,229,255,0.3)',
        }}
      >
        PAUSED
      </h2>

      <button
        onClick={onResume}
        style={{
          ...buttonBase,
          backgroundColor: '#00e5ff',
          color: '#0f1923',
          border: 'none',
          boxShadow: '0 0 12px #00e5ff44',
        }}
      >
        RESUME
      </button>

      <button
        onClick={onSettings}
        style={{
          ...buttonBase,
          backgroundColor: 'transparent',
          color: '#e8edf2',
          border: '1px solid rgba(45,74,94,0.6)',
        }}
      >
        SETTINGS
      </button>

      <button
        onClick={onQuit}
        style={{
          ...buttonBase,
          backgroundColor: 'transparent',
          color: '#ff2d55',
          border: '1px solid rgba(255,45,85,0.4)',
        }}
      >
        QUIT RUN
      </button>
    </div>
  );
};
