import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

export abstract class Weapon {
  id: string;
  name: string;
  level = 1;
  maxLevel = 5;
  cooldownTimer = 0;
  hitTracker: Set<number> = new Set();

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  abstract getCooldown(player: Player): number;
  abstract fire(player: Player, enemies: Enemy[], game: Game): void;

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    const cd = this.getCooldown(player);
    if (cd <= 0) return; // Passive weapons like orbs

    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = cd;
      this.hitTracker.clear();
      this.fire(player, enemies, game);
    }
  }

  getCooldownProgress(): number {
    return 0;
  }

  levelUp(): void {
    if (this.level < this.maxLevel) {
      this.level++;
    }
  }

  isMaxLevel(): boolean {
    return this.level >= this.maxLevel;
  }

  getLevelDescription(): string {
    return `Lv.${this.level}`;
  }

  reset(): void {
    this.level = 1;
    this.cooldownTimer = 0;
    this.hitTracker.clear();
  }
}
