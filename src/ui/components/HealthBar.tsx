import React from 'react';

interface HealthBarProps {
  hp: number;
  maxHP: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ hp, maxHP }) => {
  const pct = Math.max(0, Math.min(1, hp / maxHP)) * 100;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {/* Heart icon */}
      <svg width={20} height={20} viewBox="0 0 20 20" style={{ flexShrink: 0, filter: 'drop-shadow(0 1px 3px rgba(200,40,60,0.5))' }}>
        <path
          d="M10 17.5s-7-4.5-7-9.5C3 5.5 4.5 4 6.5 4c1.4 0 2.7.8 3.5 2 .8-1.2 2.1-2 3.5-2C15.5 4 17 5.5 17 8c0 5-7 9.5-7 9.5z"
          fill="#e63950"
          stroke="#8b1a2b"
          strokeWidth={0.8}
        />
        <path
          d="M7 6.5c-.8 0-1.5.5-1.8 1.2"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          strokeLinecap="round"
        />
      </svg>

      {/* Bar */}
      <div
        style={{
          width: 130,
          height: 18,
          borderRadius: 9,
          background: 'linear-gradient(180deg, #1a0a0e 0%, #2a1218 100%)',
          border: '1.5px solid #5a2030',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: pct > 60
              ? 'linear-gradient(180deg, #e63950 0%, #c42235 50%, #a81a2d 100%)'
              : pct > 30
                ? 'linear-gradient(180deg, #f0a030 0%, #d88520 50%, #c07018 100%)'
                : 'linear-gradient(180deg, #ff4060 0%, #d82040 50%, #b01830 100%)',
            borderRadius: 8,
            transition: 'width 0.2s ease',
            position: 'relative',
          }}
        >
          {/* Glossy highlight */}
          <div
            style={{
              position: 'absolute',
              top: 1,
              left: 2,
              right: 2,
              height: '40%',
              borderRadius: '8px 8px 0 0',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 100%)',
            }}
          />
        </div>

        {/* Text */}
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 7,
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
            letterSpacing: 0.5,
          }}
        >
          {hp} / {maxHP}
        </span>
      </div>
    </div>
  );
};
