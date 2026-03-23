import React from 'react';
import { useGameState } from '../hooks/useGameState';

interface Props {
  onPlayAgain: () => void;
  onMenu: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const DeathScreen: React.FC<Props> = ({ onPlayAgain, onMenu }) => {
  const { score, runTime, killCount, bossKills, playerLevel, highScore } = useGameState();
  const isNewHigh = score >= highScore && score > 0;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        fontFamily: "'Press Start 2P', monospace",
        animation: 'fadeIn 0.5s ease-out',
      }}>
      <h2 style={{ fontSize: '16px', color: '#ef4444', marginBottom: 8 }}>
        YOU DIED
      </h2>

      {isNewHigh && (
        <p style={{ fontSize: '10px', color: '#eab308', marginBottom: 16 }}>
          NEW HIGH SCORE!
        </p>
      )}

      <div className="rounded p-4 mb-6" style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: '1px solid #333',
        minWidth: 240,
      }}>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '8px', color: '#888' }}>Score</span>
          <span style={{ fontSize: '10px', color: '#eab308' }}>{score}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '8px', color: '#888' }}>Time</span>
          <span style={{ fontSize: '10px', color: '#fff' }}>{formatTime(runTime)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '8px', color: '#888' }}>Kills</span>
          <span style={{ fontSize: '10px', color: '#ef4444' }}>{killCount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '8px', color: '#888' }}>Bosses</span>
          <span style={{ fontSize: '10px', color: '#a855f7' }}>{bossKills}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ fontSize: '8px', color: '#888' }}>Level</span>
          <span style={{ fontSize: '10px', color: '#60a5fa' }}>{playerLevel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3" style={{ minWidth: 200 }}>
        <button onClick={onPlayAgain} className="rounded px-6 py-3"
          style={{ backgroundColor: '#8b5cf6', color: '#fff', fontSize: '10px', border: 'none', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", touchAction: 'manipulation' }}>
          PLAY AGAIN
        </button>
        <button onClick={onMenu} className="rounded px-6 py-3"
          style={{ backgroundColor: 'transparent', color: '#aaa', fontSize: '10px', border: '1px solid #444', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", touchAction: 'manipulation' }}>
          MENU
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
