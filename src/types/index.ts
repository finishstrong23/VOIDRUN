export interface Vec2 {
  x: number;
  y: number;
}

export type GameScreen = 'loading' | 'title' | 'class_select' | 'playing' | 'upgrade_select' | 'paused' | 'dead' | 'settings' | 'stats';
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
  ai: EnemyAI;
  spawnWeight: number;
  knockbackResist: number;
  isBoss?: boolean;
  spriteKey: string;
  displaySize: number;
}

export interface ClassDef {
  id: string;
  name: string;
  tagline: string;
  startingWeapon: string;
  bonusStats: Partial<PlayerStats>;
  color: number;
  accent: string;
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

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: 'stat' | 'weapon_new' | 'weapon_level';
  icon: string;
  iconBg: string;
  weaponId?: string;
  currentLevel?: number;
  maxLevel?: number;
}

export interface WaveDef {
  wave: number;
  enemies: Record<string, number>;
  spawnDuration: number;
  bossWave?: boolean;
  bossType?: string;
}

export interface RunHistoryEntry {
  score: number;
  time: number;
  kills: number;
  wave: number;
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
  propDensity: number;
}
