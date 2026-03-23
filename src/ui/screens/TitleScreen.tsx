import React from 'react';
import { useGameState } from '../hooks/useGameState';

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const buttonBase: React.CSSProperties = {
  ...baseStyle,
  padding: '14px 32px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  letterSpacing: 1,
  outline: 'none',
  WebkitTapHighlightColor: 'transparent',
  width: '100%',
  maxWidth: 240,
};

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
        backgroundColor: '#0f1923',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 900,
      }}
    >
      {/* Atmospheric gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, rgba(0,229,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: 36,
          color: '#00e5ff',
          textShadow: '0 0 20px #00e5ff88, 0 0 40px #00e5ff44, 0 0 80px #00e5ff22',
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
          color: '#7a8fa0',
          margin: '0 0 24px 0',
          letterSpacing: 3,
          textTransform: 'uppercase',
          zIndex: 1,
        }}
      >
        Survive the void
      </p>

      {/* High score */}
      {highScore > 0 && (
        <p
          style={{
            fontSize: 8,
            color: '#ffd60a',
            margin: '0 0 8px 0',
            textShadow: '0 0 8px #ffd60a44',
            zIndex: 1,
          }}
        >
          HIGH SCORE: {highScore.toLocaleString()}
        </p>
      )}

      {/* Buttons */}
      <button
        onClick={onPlay}
        style={{
          ...buttonBase,
          backgroundColor: '#00e5ff',
          color: '#0f1923',
          border: 'none',
          boxShadow: '0 0 16px #00e5ff44, 0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1,
        }}
      >
        PLAY
      </button>

      <button
        onClick={onStats}
        style={{
          ...buttonBase,
          backgroundColor: 'transparent',
          color: '#e8edf2',
          border: '1px solid rgba(45,74,94,0.6)',
          zIndex: 1,
        }}
      >
        STATS
      </button>

      <button
        onClick={onSettings}
        style={{
          ...buttonBase,
          backgroundColor: 'transparent',
          color: '#e8edf2',
          border: '1px solid rgba(45,74,94,0.6)',
          zIndex: 1,
        }}
      >
        SETTINGS
      </button>
    </div>
  );
};
