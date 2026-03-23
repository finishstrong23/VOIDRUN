import React, { useEffect, useRef, useState } from 'react';

const baseStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
};

export const FPSCounter: React.FC = () => {
  const [fps, setFps] = useState(60);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      framesRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        setFps(Math.round((framesRef.current * 1000) / elapsed));
        framesRef.current = 0;
        lastTimeRef.current = now;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const color = fps >= 50 ? '#30d158' : fps >= 30 ? '#ff9f0a' : '#ff2d55';

  return (
    <div
      style={{
        ...baseStyle,
        position: 'fixed',
        top: 4,
        right: 4,
        fontSize: 7,
        color,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '2px 4px',
        borderRadius: 2,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      {fps} FPS
    </div>
  );
};
