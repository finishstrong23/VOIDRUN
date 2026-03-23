import React from 'react';

interface DashButtonProps {
  cooldownRemaining: number;
  cooldownMax: number;
  onDash: () => void;
}

export const DashButton: React.FC<DashButtonProps> = ({
  cooldownRemaining,
  cooldownMax,
  onDash,
}) => {
  const isReady = cooldownRemaining <= 0;
  const cooldownPct = isReady ? 0 : cooldownRemaining / cooldownMax;

  // SVG arc for cooldown overlay
  const size = 80;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - cooldownPct);

  return (
    <button
      onClick={isReady ? onDash : undefined}
      onTouchStart={(e) => {
        e.preventDefault();
        if (isReady) onDash();
      }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: isReady
          ? 'linear-gradient(180deg, #e04050 0%, #c02838 40%, #901820 100%)'
          : 'linear-gradient(180deg, #3a3a50 0%, #2a2a40 40%, #1a1a30 100%)',
        border: isReady ? '3px solid #ff6878' : '3px solid #4a4a60',
        boxShadow: isReady
          ? '0 4px 12px rgba(200,40,60,0.5), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,150,150,0.2)'
          : '0 2px 6px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)',
        position: 'relative',
        cursor: isReady ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
        transition: 'transform 0.1s ease',
      }}
    >
      {/* Glossy highlight */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: '15%',
          right: '15%',
          height: '35%',
          borderRadius: '50% 50% 40% 40%',
          background: isReady
            ? 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Cooldown ring */}
      {!isReady && (
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={3}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#80a0c0"
            strokeWidth={3}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
            }}
          />
        </svg>
      )}

      {/* Dash icon + text */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, zIndex: 1 }}>
        {isReady && (
          <svg width={18} height={14} viewBox="0 0 18 14" style={{ marginBottom: -1 }}>
            <path
              d="M2 7h10M12 7l-3-3.5M12 7l-3 3.5M6 3l2 0M6 11l2 0"
              fill="none"
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: isReady ? 9 : 10,
            fontWeight: 'bold',
            color: isReady ? '#fff' : '#8a9ab0',
            textShadow: isReady
              ? '0 1px 3px rgba(0,0,0,0.6), 0 0 8px rgba(255,100,120,0.3)'
              : '0 1px 2px rgba(0,0,0,0.5)',
            letterSpacing: 1,
          }}
        >
          {isReady ? 'DASH' : cooldownRemaining.toFixed(1)}
        </span>
      </div>
    </button>
  );
};
