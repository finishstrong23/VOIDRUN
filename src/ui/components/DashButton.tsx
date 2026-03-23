import React from 'react';

interface DashButtonProps {
  cooldownRemaining: number;
  cooldownMax: number;
  onDash: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const DashButton: React.FC<DashButtonProps> = ({
  cooldownRemaining,
  cooldownMax,
  onDash,
}) => {
  const isReady = cooldownRemaining <= 0;
  const cooldownPct = isReady ? 0 : cooldownRemaining / cooldownMax;

  // SVG arc for cooldown ring
  const radius = 30;
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
        ...baseStyle,
        width: 72,
        height: 72,
        borderRadius: '50%',
        backgroundColor: 'rgba(28,42,58,0.85)',
        border: 'none',
        position: 'relative',
        cursor: isReady ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
      }}
    >
      <svg
        width={72}
        height={72}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={36}
          cy={36}
          r={radius}
          fill="none"
          stroke={isReady ? '#00e5ff' : '#4a5568'}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={isReady ? 0 : dashOffset}
          strokeLinecap="round"
          style={{
            transition: isReady ? 'none' : 'stroke-dashoffset 0.1s linear',
            filter: isReady ? 'drop-shadow(0 0 4px #00e5ff88)' : 'none',
          }}
        />
      </svg>
      <span
        style={{
          fontSize: isReady ? 8 : 10,
          color: isReady ? '#00e5ff' : '#7a8fa0',
          textShadow: isReady ? '0 0 6px #00e5ff88' : 'none',
          zIndex: 1,
        }}
      >
        {isReady ? 'DASH' : cooldownRemaining.toFixed(1)}
      </span>
    </button>
  );
};
