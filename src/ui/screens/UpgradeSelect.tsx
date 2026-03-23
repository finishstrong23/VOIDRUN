import React, { useState } from 'react';
import type { Upgrade } from '../../types';

export interface UpgradeSelectProps {
  options: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const TYPE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  weapon_level: { bg: '#4a1525', border: '#8a3545', glow: 'rgba(200,50,70,0.3)' },
  weapon_new: { bg: '#4a3a10', border: '#8a7030', glow: 'rgba(200,170,30,0.3)' },
  stat: { bg: '#0a2a3a', border: '#2a5a7a', glow: 'rgba(0,180,255,0.3)' },
};

const TYPE_ICON_BG: Record<string, string> = {
  weapon_level: 'linear-gradient(180deg, #c83848 0%, #8a1828 100%)',
  weapon_new: 'linear-gradient(180deg, #c8a020 0%, #8a6810 100%)',
  stat: 'linear-gradient(180deg, #30a0d0 0%, #1a6090 100%)',
};

export const UpgradeSelect: React.FC<UpgradeSelectProps> = ({ options: upgrades, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (upgrade: Upgrade) => {
    if (selectedId) return;
    setSelectedId(upgrade.id);
    setTimeout(() => onSelect(upgrade), 300);
  };

  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        zIndex: 200,
        padding: '20px 16px',
      }}
    >
      {/* ═══ LEVEL UP RIBBON BANNER ═══ */}
      <div
        style={{
          position: 'relative',
          padding: '10px 40px',
          background: 'linear-gradient(180deg, #d83040 0%, #a81828 50%, #881020 100%)',
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)',
          border: '1.5px solid #e84858',
        }}
      >
        {/* Glossy highlight */}
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: 4,
            right: 4,
            height: '40%',
            borderRadius: '4px 4px 0 0',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />
        <h2
          style={{
            fontSize: 18,
            color: '#fff',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,200,100,0.3)',
            letterSpacing: 3,
          }}
        >
          LEVEL UP!
        </h2>
      </div>

      <p
        style={{
          fontSize: 8,
          color: '#c0c8d0',
          margin: 0,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        Choose an upgrade:
      </p>

      {/* ═══ UPGRADE CARDS ═══ */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          width: '100%',
          maxWidth: 400,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {upgrades.map((upgrade, index) => {
          const colors = TYPE_COLORS[upgrade.type] || TYPE_COLORS.stat;
          const iconBg = TYPE_ICON_BG[upgrade.type] || TYPE_ICON_BG.stat;
          const isSelected = selectedId === upgrade.id;
          const isFaded = selectedId !== null && !isSelected;

          return (
            <button
              key={upgrade.id}
              onClick={() => handleSelect(upgrade)}
              style={{
                ...baseStyle,
                width: 115,
                background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bg}dd 100%)`,
                border: `2px solid ${colors.border}`,
                borderRadius: 10,
                padding: '14px 8px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: isSelected
                  ? `0 0 20px ${colors.glow}, 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)`
                  : `0 4px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)`,
                opacity: isFaded ? 0.35 : 1,
                transform: isSelected ? 'scale(1.05)' : 'translateY(0)',
                transition: 'all 0.2s ease',
                animation: `slideUp 0.3s ease ${index * 80}ms both`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Card glossy top */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '35%',
                  borderRadius: '8px 8px 0 0',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Icon square */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: iconBg,
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Icon glossy */}
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 3,
                    right: 3,
                    height: '40%',
                    borderRadius: '6px 6px 0 0',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none',
                  }}
                />
                <span style={{ fontSize: 20, zIndex: 1, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
                  {upgrade.icon}
                </span>
              </div>

              {/* Name */}
              <span
                style={{
                  fontSize: 7,
                  color: '#e8edf2',
                  fontWeight: 'bold',
                  lineHeight: 1.4,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {upgrade.name}
              </span>

              {/* Description */}
              <span
                style={{
                  fontSize: 6,
                  color: '#a0b0c0',
                  lineHeight: 1.5,
                  textShadow: '0 1px 1px rgba(0,0,0,0.4)',
                }}
              >
                {upgrade.description}
              </span>

              {/* Level indicator */}
              {upgrade.currentLevel != null && upgrade.maxLevel != null && (
                <span style={{ fontSize: 6, color: '#80909f' }}>
                  Lv.{upgrade.currentLevel}/{upgrade.maxLevel}
                </span>
              )}

              {/* NEW tag */}
              {upgrade.type === 'weapon_new' && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    fontSize: 5,
                    color: '#2a1800',
                    background: 'linear-gradient(180deg, #ffe040 0%, #e0a800 100%)',
                    padding: '2px 5px',
                    borderRadius: 4,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </div>

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
