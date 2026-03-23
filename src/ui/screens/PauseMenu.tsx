import React from 'react';

interface Props {
  onResume: () => void;
  onQuit: () => void;
  onSettings: () => void;
}

export const PauseMenu: React.FC<Props> = ({ onResume, onQuit, onSettings }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', fontFamily: "'Press Start 2P', monospace" }}>
      <h2 style={{ fontSize: '16px', color: '#fff', marginBottom: 32 }}>
        PAUSED
      </h2>

      <div className="flex flex-col gap-3" style={{ minWidth: 200 }}>
        <button onClick={onResume} className="rounded px-6 py-3"
          style={{ backgroundColor: '#8b5cf6', color: '#fff', fontSize: '10px', border: 'none', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", touchAction: 'manipulation' }}>
          RESUME
        </button>
        <button onClick={onSettings} className="rounded px-6 py-3"
          style={{ backgroundColor: 'transparent', color: '#aaa', fontSize: '10px', border: '1px solid #444', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", touchAction: 'manipulation' }}>
          SETTINGS
        </button>
        <button onClick={onQuit} className="rounded px-6 py-3"
          style={{ backgroundColor: 'transparent', color: '#ef4444', fontSize: '10px', border: '1px solid #ef4444', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", touchAction: 'manipulation' }}>
          QUIT RUN
        </button>
      </div>
    </div>
  );
};
