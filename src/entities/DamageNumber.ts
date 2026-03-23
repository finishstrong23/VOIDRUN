import { Text, Container } from 'pixi.js';
import { Entity } from './Entity';

export class DamageNumber extends Entity {
  lifetime = 0;
  maxLifetime = 0.6;
  isCrit = false;
  offsetX = 0;
  text: Text | null = null;

  init(x: number, y: number, damage: number, isCrit: boolean): void {
    this.active = true;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.isCrit = isCrit;
    this.lifetime = 0;
    this.offsetX = (Math.random() - 0.5) * 16;
    this.vx = 0;
    this.vy = -67; // Float upward 40 units over 0.6s

    if (this.sprite) this.sprite.removeFromParent();

    const container = new Container();
    const t = new Text({
      text: String(damage),
      style: {
        fontFamily: 'Press Start 2P',
        fontSize: isCrit ? 16 : 12,
        fill: isCrit ? 0xeab308 : 0xffffff,
        dropShadow: {
          alpha: 0.8,
          angle: Math.PI / 4,
          blur: 2,
          color: 0x000000,
          distance: 1,
        },
      },
    });
    t.anchor.set(0.5);
    container.addChild(t);
    container.position.set(this.offsetX, 0);
    if (isCrit) container.scale.set(1.3);

    this.text = t;
    this.sprite = container;
  }

  update(dt: number): void {
    this.lifetime += dt;
    super.update(dt);

    // Fade out in last 0.2s
    if (this.sprite) {
      const fadeStart = this.maxLifetime - 0.2;
      if (this.lifetime > fadeStart) {
        this.sprite.alpha = 1 - (this.lifetime - fadeStart) / 0.2;
      }
    }
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }

  reset(): void {
    super.reset();
    this.lifetime = 0;
    this.isCrit = false;
    this.text = null;
  }
}
