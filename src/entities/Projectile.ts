import { Graphics, Container } from 'pixi.js';
import { Entity } from './Entity';

export class Projectile extends Entity {
  damage = 0;
  speed = 0;
  pierce = 0;
  hitCount = 0;
  lifetime = 0;
  maxLifetime = 3;
  isPlayerProjectile = true;
  homing = false;
  homingTurnRate = 3;
  angle = 0;
  color = 0xffffff;

  init(
    x: number, y: number, angle: number,
    speed: number, damage: number, pierce: number,
    radius: number, isPlayer: boolean, color: number = 0xffffff,
    homing: boolean = false
  ): void {
    this.active = true;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.pierce = pierce;
    this.hitCount = 0;
    this.radius = radius;
    this.isPlayerProjectile = isPlayer;
    this.color = color;
    this.homing = homing;
    this.lifetime = 0;
    this.maxLifetime = 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.createSprite();
  }

  createSprite(): void {
    if (this.sprite) this.sprite.removeFromParent();

    const container = new Container();
    const g = new Graphics();
    g.circle(0, 0, this.radius);
    g.fill({ color: this.color });
    // Trail glow
    const glow = new Graphics();
    glow.circle(0, 0, this.radius * 2);
    glow.fill({ color: this.color, alpha: 0.2 });
    container.addChild(glow);
    container.addChild(g);
    this.sprite = container;
  }

  update(dt: number): void {
    this.lifetime += dt;
    super.update(dt);
  }

  onHit(): boolean {
    this.hitCount++;
    return this.hitCount > this.pierce;
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }

  reset(): void {
    super.reset();
    this.damage = 0;
    this.speed = 0;
    this.pierce = 0;
    this.hitCount = 0;
    this.lifetime = 0;
    this.homing = false;
    this.color = 0xffffff;
  }
}
