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
          SETTINGS
        </h2>
      </div>

      {/* Settings panel */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(25,38,55,0.9) 0%, rgba(18,28,42,0.9) 100%)',
          border: '1.5px solid rgba(50,75,100,0.4)',
          borderRadius: 12,
          padding: '20px',
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Volume slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: '#d0dce8' }}>VOLUME</span>
            <span style={{ fontSize: 8, color: '#80c0ff', textShadow: '0 0 4px rgba(0,150,255,0.2)' }}>
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
              backgroundColor: 'rgba(30,50,70,0.6)',
              borderRadius: 3,
              outline: 'none',
              cursor: 'pointer',
              accentColor: '#d83848',
            }}
          />
        </div>

        {/* SFX toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8, color: '#d0dce8' }}>SFX</span>
          <button
            onClick={() => onSfxToggle(!sfxEnabled)}
            style={{
              ...baseStyle,
              padding: '6px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 8,
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              background: sfxEnabled
                ? 'linear-gradient(180deg, #d83040 0%, #a82030 100%)'
                : 'linear-gradient(180deg, rgba(40,55,75,0.9) 0%, rgba(25,38,55,0.9) 100%)',
              color: sfxEnabled ? '#fff' : '#7090a8',
              border: sfxEnabled ? '1.5px solid #e85060' : '1.5px solid rgba(60,85,110,0.4)',
              boxShadow: sfxEnabled
                ? '0 2px 6px rgba(200,40,60,0.3)'
                : '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {sfxEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Quality buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 8, color: '#d0dce8' }}>QUALITY</span>
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
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 7,
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    background: isActive
                      ? 'linear-gradient(180deg, #d83040 0%, #a82030 100%)'
                      : 'linear-gradient(180deg, rgba(40,55,75,0.8) 0%, rgba(25,38,55,0.8) 100%)',
                    color: isActive ? '#fff' : '#7090a8',
                    border: isActive ? '1.5px solid #e85060' : '1.5px solid rgba(60,85,110,0.3)',
                    boxShadow: isActive
                      ? '0 2px 6px rgba(200,40,60,0.3)'
                      : '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'all 0.15s ease',
                    letterSpacing: 1,
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
