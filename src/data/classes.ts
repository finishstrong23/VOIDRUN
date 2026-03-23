import type { ClassDef } from '../types';

export const CLASSES: ClassDef[] = [
  {
    id: 'voidwalker',
    name: 'Voidwalker',
    tagline: 'Fast and deadly up close',
    startingWeapon: 'whipblade',
    bonusStats: { speed: 220, damage: 1.10 },
    color: 0x8b5cf6,
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    tagline: 'Tough to kill, punishes proximity',
    startingWeapon: 'voidOrbs',
    bonusStats: { maxHP: 120, armor: 2 },
    color: 0x06b6d4,
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    tagline: 'Precise and fast-leveling',
    startingWeapon: 'plasmaLance',
    bonusStats: { xpMultiplier: 1.15, cooldownReduction: 0.10 },
    color: 0x22c55e,
  },
];
