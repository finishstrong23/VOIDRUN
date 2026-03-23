import React from 'react';
import { useGameState } from '../hooks/useGameState';

interface Props {
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const StatsScreen: React.FC<Props> = ({ onBack }) => {
  const { highScore, totalKills, totalRuns, bestTime, runHistory } = useGameState();

  return (
    <div className="flex flex-col items-center h-full p-4 overflow-y-auto"
      style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <h2 style={{ fontSize: '14px', color: '#fff', marginBottom: 20, marginTop: 20 }}>
        STATS
      </h2>

      <div className="rounded p-4 mb-4 w-full" style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: '1px solid #333',
        maxWidth: 360,
      }}>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '8px', color: '#888' }}>High Score</span>
          <span style={{ fontSize: '10px', color: '#eab308' }}>{highScore}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '8px', color: '#888' }}>Best Time</span>
          <span style={{ fontSize: '10px', color: '#fff' }}>{formatTime(bestTime)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: '8px', color: '#888' }}>Total Kills</span>
          <span style={{ fontSize: '10px', color: '#ef4444' }}>{totalKills}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ fontSize: '8px', color: '#888' }}>Total Runs</span>
          <span style={{ fontSize: '10px', color: '#fff' }}>{totalRuns}</span>
        </div>
      </div>

      {runHistory.length > 0 && (
        <>
          <h3 style={{ fontSize: '10px', color: '#888', marginBottom: 12 }}>
            RECENT RUNS
          </h3>
          <div className="w-full" style={{ maxWidth: 360 }}>
            {runHistory.map((run, i) => (
              <div key={i} className="rounded p-2 mb-2 flex justify-between"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid #222' }}>
                <div>
                  <span style={{ fontSize: '8px', color: '#eab308' }}>{run.score}</span>
                  <span style={{ fontSize: '7px', color: '#666', marginLeft: 8 }}>Lv.{run.level}</span>
                </div>
                <div>
                  <span style={{ fontSize: '7px', color: '#888' }}>{formatTime(run.time)}</span>
                  <span style={{ fontSize: '7px', color: '#ef4444', marginLeft: 8 }}>{run.kills}K</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={onBack} className="mt-6 mb-6"
        style={{
          backgroundColor: 'transparent',
          color: '#666',
          fontSize: '8px',
          border: '1px solid #333',
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: "'Press Start 2P', monospace",
          borderRadius: 4,
          touchAction: 'manipulation',
        }}>
        BACK
      </button>
    </div>
  );
};
