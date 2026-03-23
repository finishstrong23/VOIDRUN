import React, { useState } from 'react';
import type { Upgrade } from '../../types';

export interface UpgradeSelectProps {
  options: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const TYPE_BORDER_COLORS: Record<string, string> = {
  weapon_level: '#ff2d55',
  weapon_new: '#ffd60a',
  stat: '#00e5ff',
};

export const UpgradeSelect: React.FC<UpgradeSelectProps> = ({ options: upgrades, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (upgrade: Upgrade) => {
    if (selectedId) return; // prevent double-tap
    setSelectedId(upgrade.id);
    setTimeout(() => onSelect(upgrade), 300);
  };

  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        zIndex: 200,
        padding: '20px 16px',
      }}
    >
      {/* Level up banner */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 20,
            color: '#ffd60a',
            margin: 0,
            textShadow: '0 0 20px #ffd60a66, 0 0 40px #ffd60a33',
            letterSpacing: 4,
          }}
        >
          LEVEL UP!
        </h2>
        <p
          style={{
            fontSize: 8,
            color: '#7a8fa0',
            margin: '10px 0 0 0',
          }}
        >
          Choose an upgrade:
        </p>
      </div>

      {/* Upgrade cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '100%',
          maxWidth: 320,
        }}
      >
        {upgrades.map((upgrade, index) => {
          const borderColor = TYPE_BORDER_COLORS[upgrade.type] || '#00e5ff';
          const isSelected = selectedId === upgrade.id;
          const isFaded = selectedId !== null && !isSelected;

          return (
            <button
              key={upgrade.id}
              onClick={() => handleSelect(upgrade)}
              style={{
                ...baseStyle,
                width: '100%',
                backgroundColor: '#1c2a3a',
                border: `2px solid ${borderColor}`,
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: isSelected
                  ? `0 0 20px ${borderColor}66, 0 0 40px ${borderColor}33`
                  : `0 0 8px ${borderColor}22`,
                opacity: isFaded ? 0.4 : 1,
                transform: isSelected ? 'scale(1.03)' : 'translateY(0)',
                transition: 'all 0.2s ease',
                animation: `slideUp 0.3s ease ${index * 80}ms both`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: upgrade.iconBg || borderColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${borderColor}44`,
                }}
              >
                <span style={{ fontSize: 14, color: '#fff' }}>
                  {upgrade.icon}
                </span>
              </div>

              {/* Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                <span
                  style={{
                    fontSize: 9,
                    color: '#e8edf2',
                    fontWeight: 'bold',
                  }}
                >
                  {upgrade.name}
                  {upgrade.currentLevel != null && upgrade.maxLevel != null && (
                    <span style={{ color: '#7a8fa0', fontWeight: 'normal' }}>
                      {' '}Lv.{upgrade.currentLevel}/{upgrade.maxLevel}
                    </span>
                  )}
                </span>
                <span
                  style={{
                    fontSize: 7,
                    color: '#7a8fa0',
                    lineHeight: 1.5,
                  }}
                >
                  {upgrade.description}
                </span>
              </div>

              {/* NEW tag for weapon_new */}
              {upgrade.type === 'weapon_new' && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    fontSize: 6,
                    color: '#0f1923',
                    backgroundColor: '#ffd60a',
                    padding: '2px 5px',
                    borderRadius: 3,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                  }}
                >
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline keyframes via style tag */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
