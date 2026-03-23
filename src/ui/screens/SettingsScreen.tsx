import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { setMasterVolume, setSfxEnabled } from '../../utils/sound';

interface Props {
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const {
    masterVolume, sfxEnabled, qualityOverride,
    setVolume, setSfxEnabled: setSfx, setQualityOverride,
  } = useGameState();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setMasterVolume(vol);
  };

  const handleSfxToggle = () => {
    setSfx(!sfxEnabled);
    setSfxEnabled(!sfxEnabled);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4"
      style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <h2 style={{ fontSize: '14px', color: '#fff', marginBottom: 32 }}>
        SETTINGS
      </h2>

      <div className="flex flex-col gap-6 w-full" style={{ maxWidth: 300 }}>
        {/* Volume */}
        <div>
          <label style={{ fontSize: '8px', color: '#888', display: 'block', marginBottom: 8 }}>
            VOLUME: {Math.round(masterVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={handleVolumeChange}
            className="w-full"
            style={{ accentColor: '#8b5cf6' }}
          />
        </div>

        {/* SFX Toggle */}
        <div className="flex justify-between items-center">
          <span style={{ fontSize: '8px', color: '#888' }}>SFX</span>
          <button
            onClick={handleSfxToggle}
            className="rounded px-4 py-2"
            style={{
              backgroundColor: sfxEnabled ? '#8b5cf6' : '#333',
              color: '#fff',
              fontSize: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
              touchAction: 'manipulation',
            }}
          >
            {sfxEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Quality */}
        <div>
          <span style={{ fontSize: '8px', color: '#888', display: 'block', marginBottom: 8 }}>
            QUALITY
          </span>
          <div className="flex gap-2">
            {(['auto', 'low', 'medium', 'high'] as const).map(q => (
              <button
                key={q}
                onClick={() => setQualityOverride(q)}
                className="rounded px-3 py-2"
                style={{
                  backgroundColor: qualityOverride === q ? '#8b5cf6' : '#222',
                  color: qualityOverride === q ? '#fff' : '#666',
                  fontSize: '7px',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  fontFamily: "'Press Start 2P', monospace",
                  touchAction: 'manipulation',
                }}
              >
                {q.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={onBack} className="mt-8"
        style={{
          backgroundColor: 'transparent',
          color: '#666',
          fontSize: '8px',
          border: '1px solid #333',
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: "'Press Start 2P', monospace",
          borderRadius: 4,
          touchAction: 'manipulation',
        }}>
        BACK
      </button>
    </div>
  );
};
