import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const GlossyButton: React.FC<{
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ onClick, primary, danger, children }) => (
  <button
    onClick={onClick}
    style={{
      ...baseStyle,
      width: '100%',
      maxWidth: 240,
      padding: '12px 24px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 10,
      letterSpacing: 2,
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative',
      overflow: 'hidden',
      color: primary ? '#fff' : danger ? '#ff8090' : '#c0d0e0',
      background: primary
        ? 'linear-gradient(180deg, #d83040 0%, #b82030 40%, #901828 100%)'
        : danger
          ? 'linear-gradient(180deg, rgba(60,25,30,0.9) 0%, rgba(40,15,20,0.9) 100%)'
          : 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
      border: primary
        ? '2px solid #e85060'
        : danger
          ? '1.5px solid rgba(200,60,80,0.4)'
          : '1.5px solid rgba(60,85,110,0.5)',
      boxShadow: primary
        ? '0 4px 12px rgba(200,40,60,0.4), inset 0 1px 1px rgba(255,255,255,0.15)'
        : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '45%',
        borderRadius: '8px 8px 0 0',
        background: primary
          ? 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none',
      }}
    />
    {children}
  </button>
);

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
        gap: 14,
        zIndex: 300,
      }}
    >
      {/* PAUSED banner */}
      <div
        style={{
          padding: '8px 30px',
          background: 'linear-gradient(180deg, rgba(30,45,65,0.9) 0%, rgba(20,32,48,0.9) 100%)',
          borderRadius: 8,
          border: '1.5px solid rgba(60,90,120,0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          marginBottom: 10,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            color: '#d0dce8',
            margin: 0,
            letterSpacing: 4,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          PAUSED
        </h2>
      </div>

      <GlossyButton onClick={onResume} primary>RESUME</GlossyButton>
      <GlossyButton onClick={onSettings}>SETTINGS</GlossyButton>
      <GlossyButton onClick={onQuit} danger>QUIT RUN</GlossyButton>
    </div>
  );
};
