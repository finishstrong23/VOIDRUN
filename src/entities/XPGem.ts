import { Graphics, Container } from 'pixi.js';
import { Entity } from './Entity';

export class XPGem extends Entity {
  xpValue = 1;
  lifetime = 0;
  maxLifetime = 30;
  isMagnetized = false;
  magnetSpeed = 50;
  sparklePhase = 0;

  init(x: number, y: number, xpValue: number): void {
    this.active = true;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.xpValue = xpValue;
    this.lifetime = 0;
    this.isMagnetized = false;
    this.magnetSpeed = 50;
    this.sparklePhase = Math.random() * Math.PI * 2;
    this.vx = 0;
    this.vy = 0;

    // Size based on XP value
    if (xpValue <= 3) this.radius = 4;
    else if (xpValue <= 10) this.radius = 6;
    else this.radius = 9;

    this.createSprite();
  }

  createSprite(): void {
    if (this.sprite) this.sprite.removeFromParent();

    const container = new Container();
    const g = new Graphics();
    const r = this.radius;
    // Diamond shape
    g.poly([0, -r, r * 0.7, 0, 0, r, -r * 0.7, 0]);
    g.fill({ color: 0xeab308 });

    container.addChild(g);
    this.sprite = container;
  }

  update(dt: number): void {
    this.lifetime += dt;
    this.sparklePhase += dt * 4;

    if (this.isMagnetized) {
      // Accelerate toward player
      this.magnetSpeed = Math.min(800, this.magnetSpeed + dt * 2500);
    }

    super.update(dt);
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }

  reset(): void {
    super.reset();
    this.xpValue = 1;
    this.lifetime = 0;
    this.isMagnetized = false;
    this.magnetSpeed = 50;
    this.sparklePhase = 0;
  }
}
