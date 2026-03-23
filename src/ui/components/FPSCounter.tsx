import React, { useEffect, useState } from 'react';

export const FPSCounter: React.FC = () => {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let id: number;

    const measure = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frames);
        frames = 0;
        lastTime = now;
      }
      id = requestAnimationFrame(measure);
    };
    id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span style={{
      fontSize: '8px',
      color: fps < 30 ? '#ef4444' : fps < 50 ? '#eab308' : '#22c55e',
      fontFamily: "'Press Start 2P', monospace",
      position: 'absolute',
      top: 4,
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: 0.6,
    }}>
      {fps}FPS
    </span>
  );
};
