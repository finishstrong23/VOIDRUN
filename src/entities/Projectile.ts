import { Sprite } from 'pixi.js';
import { Entity } from './Entity';
import { spriteFactory } from '../sprites/SpriteFactory';

export class Projectile extends Entity {
  damage = 0;
  speed = 0;
  piercing = 0;
  hitCount = 0;
  lifetime = 0;
  maxLifetime = 3;
  color = 0x00e5ff;
  fromPlayer = true;
  homing = false;
  isPlayerProjectile = true;
  angle = 0;

  init(x: number, y: number, angle: number, speed: number, damage: number, pierce: number, radius: number, isPlayer: boolean, color = 0xffffff, homing = false): void {
    this.x = x; this.y = y;
    this.prevX = x; this.prevY = y;
    this.angle = angle;
    this.speed = speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.piercing = pierce;
    this.hitCount = 0;
    this.lifetime = 0;
    this.maxLifetime = 3;
    this.color = color;
    this.radius = radius;
    this.fromPlayer = isPlayer;
    this.isPlayerProjectile = isPlayer;
    this.homing = homing;
    this.hp = 1;
    this.maxHP = 1;
    this.active = true;
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime || !this.active;
  }

  createSprite(): Sprite {
    const hex = this.color.toString(16).padStart(6, '0');
    const tex = spriteFactory.get(`particle_${hex}`);
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.scale.set(this.radius / 6); // scale relative to base particle size
    this.sprite = s;
    return s;
  }

  update(dt: number): void {
    super.update(dt);
    this.lifetime += dt;
    if (this.lifetime >= this.maxLifetime) {
      this.active = false;
    }
  }

  onHit(): boolean {
    this.hitCount++;
    if (this.hitCount > this.piercing) {
      this.active = false;
      return true; // destroyed
    }
    return false; // pierced through
  }
}
