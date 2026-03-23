import React from 'react';
import { useGameState } from '../hooks/useGameState';

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const GlossyButton: React.FC<{
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}> = ({ onClick, primary, children }) => (
  <button
    onClick={onClick}
    style={{
      ...baseStyle,
      width: '100%',
      maxWidth: 240,
      padding: '14px 32px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 12,
      letterSpacing: 2,
      outline: 'none',
      WebkitTapHighlightColor: 'transparent',
      zIndex: 1,
      position: 'relative',
      overflow: 'hidden',
      color: primary ? '#fff' : '#c0d0e0',
      background: primary
        ? 'linear-gradient(180deg, #d83040 0%, #b82030 40%, #901828 100%)'
        : 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
      border: primary ? '2px solid #e85060' : '1.5px solid rgba(60,85,110,0.5)',
      boxShadow: primary
        ? '0 4px 16px rgba(200,40,60,0.4), inset 0 1px 1px rgba(255,255,255,0.15)'
        : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
      textShadow: primary
        ? '0 2px 4px rgba(0,0,0,0.4)'
        : '0 1px 2px rgba(0,0,0,0.3)',
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

export const TitleScreen: React.FC = () => {
  const { highScore, setScreen } = useGameState();

  const onPlay = () => setScreen('class_select');
  const onStats = () => setScreen('stats');
  const onSettings = () => setScreen('settings');

  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, #0a1018 0%, #0f1923 30%, #14202e 60%, #0d1520 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 900,
      }}
    >
      {/* Atmospheric glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 35%, rgba(200,50,80,0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 60%, rgba(0,150,200,0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: 36,
          color: '#e8d0c0',
          textShadow: '0 0 20px rgba(255,100,120,0.4), 0 0 40px rgba(255,80,100,0.2), 0 2px 6px rgba(0,0,0,0.6)',
          margin: 0,
          letterSpacing: 8,
          zIndex: 1,
        }}
      >
        VOIDRUN
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 8,
          color: '#80909f',
          margin: '0 0 24px 0',
          letterSpacing: 3,
          textTransform: 'uppercase',
          zIndex: 1,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        Survive the void
      </p>

      {/* High score */}
      {highScore > 0 && (
        <div
          style={{
            padding: '5px 14px',
            borderRadius: 8,
            background: 'linear-gradient(180deg, rgba(60,45,10,0.7) 0%, rgba(40,30,5,0.7) 100%)',
            border: '1px solid rgba(200,170,40,0.3)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            marginBottom: 8,
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 8,
              color: '#ffd060',
              textShadow: '0 0 8px rgba(255,200,50,0.3)',
            }}
          >
            HIGH SCORE: {highScore.toLocaleString()}
          </span>
        </div>
      )}

      {/* Buttons */}
      <GlossyButton onClick={onPlay} primary>PLAY</GlossyButton>
      <GlossyButton onClick={onStats}>STATS</GlossyButton>
      <GlossyButton onClick={onSettings}>SETTINGS</GlossyButton>
    </div>
  );
};
