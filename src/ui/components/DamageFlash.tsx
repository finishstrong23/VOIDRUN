import React, { useEffect, useState } from 'react';

interface DamageFlashProps {
  trigger: number; // increment to trigger flash
}

export const DamageFlash: React.FC<DamageFlashProps> = ({ trigger }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger <= 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 150);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,45,85,0.3) 100%)',
        animation: 'damageFlashFade 150ms ease-out forwards',
      }}
    />
  );
};
