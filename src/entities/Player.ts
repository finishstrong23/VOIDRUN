import { Graphics, Container } from 'pixi.js';
import { Entity } from './Entity';
import { PLAYER_BASE } from '../data/balance';
import type { PlayerStats, ClassDef } from '../types';

export class Player extends Entity {
  facingAngle = 0;
  stats: PlayerStats;
  iFrameTimer = 0;
  isInvincible = false;
  classColor = 0x8b5cf6;
  glowSprite: Graphics | null = null;

  constructor() {
    super();
    this.stats = { ...PLAYER_BASE };
  }

  init(classDef: ClassDef): void {
    this.active = true;
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.classColor = classDef.color;

    // Apply class bonus stats
    this.stats = { ...PLAYER_BASE };
    const bonus = classDef.bonusStats;
    if (bonus.maxHP !== undefined) this.stats.maxHP = bonus.maxHP;
    if (bonus.speed !== undefined) this.stats.speed = bonus.speed;
    if (bonus.damage !== undefined) this.stats.damage = bonus.damage;
    if (bonus.armor !== undefined) this.stats.armor = bonus.armor;
    if (bonus.pickupRadius !== undefined) this.stats.pickupRadius = bonus.pickupRadius;
    if (bonus.xpMultiplier !== undefined) this.stats.xpMultiplier = bonus.xpMultiplier;
    if (bonus.cooldownReduction !== undefined) this.stats.cooldownReduction = bonus.cooldownReduction;
    if (bonus.critChance !== undefined) this.stats.critChance = bonus.critChance;
    if (bonus.critDamage !== undefined) this.stats.critDamage = bonus.critDamage;

    this.hp = this.stats.maxHP;
    this.maxHP = this.stats.maxHP;
    this.radius = this.stats.hitboxRadius;
    this.iFrameTimer = 0;
    this.isInvincible = false;

    this.createSprite();
  }

  createSprite(): void {
    if (this.sprite) this.sprite.removeFromParent();

    const container = new Container();

    // Glow
    const glow = new Graphics();
    glow.circle(0, 0, 32);
    glow.fill({ color: this.classColor, alpha: 0.15 });
    container.addChild(glow);
    this.glowSprite = glow;

    // Hexagon body
    const body = new Graphics();
    const r = 18;
    body.poly(this.hexPoints(r));
    body.fill({ color: this.classColor });
    body.stroke({ color: 0xffffff, width: 2, alpha: 0.8 });
    container.addChild(body);

    this.sprite = container;
  }

  private hexPoints(r: number): number[] {
    const pts: number[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    return pts;
  }

  update(dt: number): void {
    // Update facing
    if (this.vx !== 0 || this.vy !== 0) {
      this.facingAngle = Math.atan2(this.vy, this.vx);
    }

    super.update(dt);

    // i-frame timer
    if (this.iFrameTimer > 0) {
      this.iFrameTimer -= dt * 1000;
      this.isInvincible = true;
      if (this.iFrameTimer <= 0) {
        this.iFrameTimer = 0;
        this.isInvincible = false;
      }
    }
  }

  applyDamage(amount: number): number {
    if (this.isInvincible) return 0;
    const reduced = Math.max(1, amount - this.stats.armor);
    this.hp = Math.max(0, this.hp - reduced);
    this.iFrameTimer = this.stats.iFrameDuration;
    this.isInvincible = true;
    return reduced;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHP, this.hp + amount);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }
}
