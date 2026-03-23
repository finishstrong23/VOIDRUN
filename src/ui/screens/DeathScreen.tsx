import React from 'react';
import { useGameState } from '../hooks/useGameState';

export interface DeathScreenProps {
  onPlayAgain: () => void;
  onMenu: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

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

export const DeathScreen: React.FC<DeathScreenProps> = ({
  onPlayAgain,
  onMenu,
}) => {
  const {
    score,
    runTime,
    currentWave,
    killCount,
    bossKills,
    playerLevel,
    highScore,
  } = useGameState();

  const isHighScore = score >= highScore && score > 0;

  const stats = [
    { label: 'SCORE', value: score.toLocaleString() },
    { label: 'TIME', value: formatTime(runTime) },
    { label: 'WAVE', value: String(currentWave) },
    { label: 'KILLS', value: String(killCount) },
    { label: 'BOSSES', value: String(bossKills) },
    { label: 'LEVEL', value: String(playerLevel) },
  ];

  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 400,
        padding: '20px 16px',
      }}
    >
      {/* YOU DIED */}
      <h2
        style={{
          fontSize: 24,
          color: '#ff2d55',
          margin: 0,
          textShadow: '0 0 20px #ff2d5566, 0 0 40px #ff2d5533',
          letterSpacing: 4,
        }}
      >
        YOU DIED
      </h2>

      {/* High score */}
      {isHighScore && (
        <p
          style={{
            fontSize: 10,
            color: '#ffd60a',
            margin: 0,
            textShadow: '0 0 12px #ffd60a66',
            letterSpacing: 2,
          }}
        >
          NEW HIGH SCORE!
        </p>
      )}

      {/* Stats panel */}
      <div
        style={{
          backgroundColor: 'rgba(28,42,58,0.85)',
          border: '1px solid rgba(45,74,94,0.4)',
          borderRadius: 8,
          padding: '16px 20px',
          width: '100%',
          maxWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 8, color: '#7a8fa0' }}>{stat.label}</span>
            <span style={{ fontSize: 10, color: '#e8edf2' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
          marginTop: 8,
          width: '100%',
        }}
      >
        <button
          onClick={onPlayAgain}
          style={{
            ...buttonBase,
            backgroundColor: '#00e5ff',
            color: '#0f1923',
            border: 'none',
            boxShadow: '0 0 12px #00e5ff44',
          }}
        >
          PLAY AGAIN
        </button>

        <button
          onClick={onMenu}
          style={{
            ...buttonBase,
            backgroundColor: 'transparent',
            color: '#e8edf2',
            border: '1px solid rgba(45,74,94,0.6)',
          }}
        >
          MENU
        </button>
      </div>
    </div>
  );
};
