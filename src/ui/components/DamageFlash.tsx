import React, { useEffect, useState } from 'react';

interface Props {
  hp: number;
}

export const DamageFlash: React.FC<Props> = ({ hp }) => {
  const [flash, setFlash] = useState(false);
  const [prevHP, setPrevHP] = useState(hp);

  useEffect(() => {
    if (hp < prevHP) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 150);
      return () => clearTimeout(t);
    }
    setPrevHP(hp);
  }, [hp, prevHP]);

  if (!flash) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        pointerEvents: 'none',
        transition: 'opacity 150ms',
      }}
    />
  );
};
