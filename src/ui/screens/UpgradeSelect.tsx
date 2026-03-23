import React, { useState } from 'react';
import type { Upgrade } from '../../types';

interface Props {
  options: Upgrade[];
  onSelect: (upgrade: Upgrade) => void;
}

const ICON_MAP: Record<string, string> = {
  sword: '\u2694',
  heart: '\u2665',
  bolt: '\u26A1',
  magnet: '\u{1F9F2}',
  gem: '\u25C6',
  shield: '\u{1F6E1}',
  clock: '\u{1F552}',
  crosshair: '\u2316',
  weapon: '\u2694',
  weapon_new: '\u2605',
};

export const UpgradeSelect: React.FC<Props> = ({ options, onSelect }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      onSelect(options[idx]);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', fontFamily: "'Press Start 2P', monospace" }}>
      <h2 style={{ fontSize: '12px', color: '#eab308', marginBottom: 20 }}>
        LEVEL UP!
      </h2>

      <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 400 }}>
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isFaded = selected !== null && !isSelected;
          const isNewWeapon = opt.type === 'weapon_new';

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(i)}
              className="rounded p-4 text-left transition-all duration-200"
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: isNewWeapon ? '2px solid #eab308' : '1px solid #444',
                opacity: isFaded ? 0.3 : 1,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: "'Press Start 2P', monospace",
                minHeight: 72,
                touchAction: 'manipulation',
                animation: `slideUp 0.3s ease-out ${i * 0.08}s both`,
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '18px' }}>
                  {ICON_MAP[opt.icon] || '\u2694'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '10px', color: '#fff' }}>
                      {opt.name}
                    </span>
                    {opt.currentLevel !== undefined && (
                      <span style={{ fontSize: '7px', color: '#888' }}>
                        Lv.{opt.currentLevel} → {(opt.currentLevel || 0) + 1}
                      </span>
                    )}
                    {isNewWeapon && (
                      <span style={{ fontSize: '7px', color: '#eab308' }}>NEW</span>
                    )}
                  </div>
                  <div style={{ fontSize: '7px', color: '#aaa', marginTop: 4 }}>
                    {opt.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
