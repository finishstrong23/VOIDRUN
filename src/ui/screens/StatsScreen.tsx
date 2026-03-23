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
        backgroundColor: '#0f1923',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px',
        gap: 20,
        zIndex: 900,
        overflowY: 'auto',
      }}
    >
      <h2
        style={{
          fontSize: 16,
          color: '#e8edf2',
          margin: 0,
          letterSpacing: 3,
        }}
      >
        STATS
      </h2>

      {/* Lifetime stats panel */}
      <div
        style={{
          backgroundColor: 'rgba(28,42,58,0.85)',
          border: '1px solid rgba(45,74,94,0.4)',
          borderRadius: 8,
          padding: '16px 20px',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: '#00e5ff',
            marginBottom: 4,
            letterSpacing: 2,
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
            <span style={{ fontSize: 7, color: '#7a8fa0' }}>{stat.label}</span>
            <span style={{ fontSize: 9, color: '#e8edf2' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div
        style={{
          backgroundColor: 'rgba(28,42,58,0.85)',
          border: '1px solid rgba(45,74,94,0.4)',
          borderRadius: 8,
          padding: '16px 20px',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: '#00e5ff',
            marginBottom: 4,
            letterSpacing: 2,
          }}
        >
          RECENT RUNS
        </span>
        {runHistory.length === 0 ? (
          <span style={{ fontSize: 7, color: '#7a8fa0' }}>No runs yet</span>
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
                    ? '1px solid rgba(45,74,94,0.2)'
                    : 'none',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 7, color: '#e8edf2' }}>
                  {run.className} - W{run.wave} Lv.{run.level}
                </span>
                <span style={{ fontSize: 6, color: '#7a8fa0' }}>
                  {formatTime(run.time)} | {run.kills} kills
                </span>
              </div>
              <span style={{ fontSize: 8, color: '#ffd60a' }}>
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
          backgroundColor: 'transparent',
          color: '#7a8fa0',
          border: '1px solid rgba(45,74,94,0.4)',
          borderRadius: 6,
          padding: '10px 24px',
          cursor: 'pointer',
          fontSize: 9,
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          marginTop: 8,
        }}
      >
        BACK
      </button>
    </div>
  );
};
