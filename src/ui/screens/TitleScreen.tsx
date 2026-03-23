import React from 'react';
import { useGameState } from '../hooks/useGameState';

export const TitleScreen: React.FC = () => {
  const { setScreen, highScore } = useGameState();

  return (
    <div className="flex flex-col items-center justify-center h-full"
      style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <h1 style={{
        fontSize: '32px',
        color: '#8b5cf6',
        textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
        marginBottom: 8,
      }}>
        VOIDRUN
      </h1>
      <p style={{ fontSize: '8px', color: '#666', marginBottom: 48 }}>
        Survive the void
      </p>

      <button
        onClick={() => setScreen('class_select')}
        className="rounded px-6 py-3 mb-4"
        style={{
          backgroundColor: '#8b5cf6',
          color: '#fff',
          fontSize: '12px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Press Start 2P', monospace",
          touchAction: 'manipulation',
        }}
      >
        PLAY
      </button>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setScreen('stats')}
          style={{
            backgroundColor: 'transparent',
            color: '#888',
            fontSize: '8px',
            border: '1px solid #333',
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace",
            borderRadius: 4,
            touchAction: 'manipulation',
          }}
        >
          STATS
        </button>
        <button
          onClick={() => setScreen('settings')}
          style={{
            backgroundColor: 'transparent',
            color: '#888',
            fontSize: '8px',
            border: '1px solid #333',
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace",
            borderRadius: 4,
            touchAction: 'manipulation',
          }}
        >
          SETTINGS
        </button>
      </div>

      {highScore > 0 && (
        <p style={{ fontSize: '8px', color: '#eab308', marginTop: 32 }}>
          HIGH SCORE: {highScore}
        </p>
      )}
    </div>
  );
};
