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
      {/* YOU DIED banner */}
      <div
        style={{
          position: 'relative',
          padding: '10px 36px',
          background: 'linear-gradient(180deg, #8a1828 0%, #601018 50%, #480c10 100%)',
          borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
          border: '1.5px solid #a82838',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: 4,
            right: 4,
            height: '40%',
            borderRadius: '4px 4px 0 0',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />
        <h2
          style={{
            fontSize: 22,
            color: '#ff8090',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            letterSpacing: 4,
          }}
        >
          YOU DIED
        </h2>
      </div>

      {/* High score notification */}
      {isHighScore && (
        <div
          style={{
            padding: '5px 14px',
            borderRadius: 8,
            background: 'linear-gradient(180deg, rgba(60,45,10,0.8) 0%, rgba(40,30,5,0.8) 100%)',
            border: '1px solid rgba(200,170,40,0.4)',
            boxShadow: '0 0 12px rgba(255,200,50,0.2)',
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: '#ffd060',
              textShadow: '0 0 8px rgba(255,200,50,0.3)',
              letterSpacing: 2,
            }}
          >
            NEW HIGH SCORE!
          </span>
        </div>
      )}

      {/* Stats panel */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(25,38,55,0.9) 0%, rgba(18,28,42,0.9) 100%)',
          border: '1.5px solid rgba(50,75,100,0.4)',
          borderRadius: 12,
          padding: '18px 22px',
          width: '100%',
          maxWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.04)',
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
            <span style={{ fontSize: 7, color: '#7090a8' }}>{stat.label}</span>
            <span
              style={{
                fontSize: 10,
                color: '#e0e8f0',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {stat.value}
            </span>
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
            ...baseStyle,
            width: '100%',
            maxWidth: 240,
            padding: '14px 24px',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 10,
            letterSpacing: 2,
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
            color: '#fff',
            background: 'linear-gradient(180deg, #d83040 0%, #b82030 40%, #901828 100%)',
            border: '2px solid #e85060',
            boxShadow: '0 4px 12px rgba(200,40,60,0.4), inset 0 1px 1px rgba(255,255,255,0.15)',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
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
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
            }}
          />
          PLAY AGAIN
        </button>

        <button
          onClick={onMenu}
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
            color: '#c0d0e0',
            background: 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
            border: '1.5px solid rgba(60,85,110,0.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
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
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
            }}
          />
          MENU
        </button>
      </div>
    </div>
  );
};
