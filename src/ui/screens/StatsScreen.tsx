import React from 'react';
import { useGameState } from '../hooks/useGameState';

export interface StatsScreenProps {
  onBack: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  onBack,
}) => {
  const {
    highScore,
    bestTime,
    bestWave,
    totalKills,
    totalRuns,
    runHistory,
  } = useGameState();

  const lifetimeStats = [
    { label: 'HIGH SCORE', value: highScore.toLocaleString() },
    { label: 'BEST TIME', value: formatTime(bestTime) },
    { label: 'BEST WAVE', value: String(bestWave) },
    { label: 'TOTAL KILLS', value: totalKills.toLocaleString() },
    { label: 'TOTAL RUNS', value: String(totalRuns) },
  ];

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
        padding: '40px 16px',
        gap: 20,
        zIndex: 900,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 24px',
          background: 'linear-gradient(180deg, rgba(30,45,65,0.9) 0%, rgba(20,32,48,0.9) 100%)',
          borderRadius: 8,
          border: '1.5px solid rgba(60,90,120,0.4)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <h2
          style={{
            fontSize: 14,
            color: '#d0dce8',
            margin: 0,
            letterSpacing: 3,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          STATS
        </h2>
      </div>

      {/* Lifetime stats panel */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(25,38,55,0.9) 0%, rgba(18,28,42,0.9) 100%)',
          border: '1.5px solid rgba(50,75,100,0.4)',
          borderRadius: 12,
          padding: '16px 20px',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.04)',
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: '#ffd060',
            marginBottom: 4,
            letterSpacing: 2,
            textShadow: '0 0 6px rgba(255,200,50,0.2)',
          }}
        >
          LIFETIME
        </span>
        {lifetimeStats.map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 7, color: '#7090a8' }}>{stat.label}</span>
            <span style={{ fontSize: 9, color: '#e0e8f0', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(25,38,55,0.9) 0%, rgba(18,28,42,0.9) 100%)',
          border: '1.5px solid rgba(50,75,100,0.4)',
          borderRadius: 12,
          padding: '16px 20px',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.04)',
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: '#80c0ff',
            marginBottom: 4,
            letterSpacing: 2,
            textShadow: '0 0 6px rgba(0,150,255,0.2)',
          }}
        >
          RECENT RUNS
        </span>
        {runHistory.length === 0 ? (
          <span style={{ fontSize: 7, color: '#607080' }}>No runs yet</span>
        ) : (
          runHistory.map((run, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom:
                  index < runHistory.length - 1
                    ? '1px solid rgba(40,60,80,0.3)'
                    : 'none',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 7, color: '#d0dce8' }}>
                  {run.className} - W{run.wave} Lv.{run.level}
                </span>
                <span style={{ fontSize: 6, color: '#607890' }}>
                  {formatTime(run.time)} | {run.kills} kills
                </span>
              </div>
              <span style={{ fontSize: 8, color: '#ffd060', textShadow: '0 0 4px rgba(255,200,50,0.2)' }}>
                {run.score.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
          color: '#90a0b8',
          border: '1.5px solid rgba(60,85,110,0.4)',
          borderRadius: 10,
          padding: '10px 24px',
          cursor: 'pointer',
          fontSize: 9,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          marginTop: 8,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          letterSpacing: 1,
        }}
      >
        BACK
      </button>
    </div>
  );
};
