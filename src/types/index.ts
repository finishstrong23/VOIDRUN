export interface Vec2 {
  x: number;
  y: number;
}

export type GameScreen = 'title' | 'class_select' | 'playing' | 'upgrade_select' | 'paused' | 'dead' | 'settings' | 'stats';

export type QualityTier = 'low' | 'medium' | 'high';

export type EnemyAI = 'chase' | 'swarm' | 'ranged' | 'boss_charge' | 'boss_nova';

export interface EnemyDef {
  name: string;
  hp: number;
  damage: number;
  speed: number;
  xpValue: number;
  armor: number;
  radius: number;
  color: number;
  shape: 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star';
  ai: EnemyAI;
  spawnWeight: number;
  knockbackResist: number;
  isBoss?: boolean;
}

export interface ClassDef {
  id: string;
  name: string;
  tagline: string;
  startingWeapon: string;
  bonusStats: Partial<PlayerStats>;
  color: number;
}

export interface PlayerStats {
  maxHP: number;
  speed: number;
  damage: number;
  armor: number;
  pickupRadius: number;
  xpMultiplier: number;
  cooldownReduction: number;
  critChance: number;
  critDamage: number;
  hitboxRadius: number;
  iFrameDuration: number;
}

export interface WeaponLevelData {
  damage: number;
  [key: string]: number | boolean | undefined;
}

export interface WeaponDef {
  name: string;
  description: string;
  baseDamage: number;
  cooldown: number;
  levelScaling: WeaponLevelData[];
  evolution: { name: string; description: string };
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: 'stat' | 'weapon_new' | 'weapon_level';
  icon: string;
  weaponId?: string;
  currentLevel?: number;
  maxLevel?: number;
}

export interface RunHistoryEntry {
  score: number;
  time: number;
  kills: number;
  level: number;
  date: number;
  className: string;
}

export interface QualityPreset {
  maxEnemies: number;
  particlesEnabled: boolean;
  particleDensity: number;
  damageNumbersEnabled: boolean;
  trailEffectsEnabled: boolean;
  resolution: number;
  shadowsEnabled: boolean;
}
