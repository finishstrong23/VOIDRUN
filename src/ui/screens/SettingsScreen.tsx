import React from 'react';
import type { QualityTier } from '../../types';
import { useGameState } from '../hooks/useGameState';
import { setMasterVolume, setSfxEnabled } from '../../utils/sound';

interface SettingsScreenProps {
  onBack: () => void;
}

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

const QUALITY_OPTIONS: Array<{ value: QualityTier | 'auto'; label: string }> = [
  { value: 'auto', label: 'AUTO' },
  { value: 'low', label: 'LOW' },
  { value: 'medium', label: 'MED' },
  { value: 'high', label: 'HIGH' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { masterVolume, sfxEnabled, qualityOverride, setVolume, setSfxEnabled: setSfx, setQualityOverride } = useGameState();
  const onVolumeChange = (v: number) => { setVolume(v); setMasterVolume(v); };
  const onSfxToggle = (e: boolean) => { setSfx(e); setSfxEnabled(e); };
  const onQualityChange = (q: QualityTier | 'auto') => setQualityOverride(q);
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
        SETTINGS
      </h2>

      {/* Settings panel */}
      <div
        style={{
          backgroundColor: 'rgba(28,42,58,0.85)',
          border: '1px solid rgba(45,74,94,0.4)',
          borderRadius: 8,
          padding: '20px',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Volume slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: '#e8edf2' }}>VOLUME</span>
            <span style={{ fontSize: 8, color: '#00e5ff' }}>
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={masterVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: 6,
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundColor: 'rgba(45,74,94,0.4)',
              borderRadius: 3,
              outline: 'none',
              cursor: 'pointer',
              accentColor: '#00e5ff',
            }}
          />
        </div>

        {/* SFX toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8, color: '#e8edf2' }}>SFX</span>
          <button
            onClick={() => onSfxToggle(!sfxEnabled)}
            style={{
              ...baseStyle,
              padding: '6px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 8,
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              backgroundColor: sfxEnabled ? '#00e5ff' : 'transparent',
              color: sfxEnabled ? '#0f1923' : '#7a8fa0',
              border: sfxEnabled ? 'none' : '1px solid rgba(45,74,94,0.6)',
            }}
          >
            {sfxEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Quality buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 8, color: '#e8edf2' }}>QUALITY</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {QUALITY_OPTIONS.map((opt) => {
              const isActive = qualityOverride === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onQualityChange(opt.value)}
                  style={{
                    ...baseStyle,
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 7,
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    backgroundColor: isActive ? '#00e5ff' : 'transparent',
                    color: isActive ? '#0f1923' : '#7a8fa0',
                    border: isActive ? 'none' : '1px solid rgba(45,74,94,0.4)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
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
