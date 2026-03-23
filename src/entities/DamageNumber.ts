import { Text } from 'pixi.js';
import { Entity } from './Entity';

export class DamageNumber extends Entity {
  lifetime = 0;
  maxLifetime = 0.8;
  text: Text | null = null;
  value = 0;
  isCrit = false;

  init(x: number, y: number, amount: number, isCrit = false, color = 0xffffff): void {
    this.x = x; this.y = y;
    this.prevX = x; this.prevY = y;
    this.vx = (Math.random() - 0.5) * 40;
    this.vy = -80 - Math.random() * 40;
    this.lifetime = 0;
    this.active = true;
    this.value = amount;
    this.isCrit = isCrit;

    if (!this.text) {
      this.text = new Text({
        text: '',
        style: {
          fontFamily: 'monospace',
          fontSize: isCrit ? 18 : 14,
          fill: color,
          fontWeight: isCrit ? 'bold' : 'normal',
          stroke: { color: 0x000000, width: 3 },
        },
      });
      this.text.anchor.set(0.5);
      this.sprite = this.text;
    } else {
      this.text.style.fontSize = isCrit ? 18 : 14;
      this.text.style.fill = color;
      this.text.style.fontWeight = isCrit ? 'bold' : 'normal';
    }

    this.text.text = isCrit ? `${amount}!` : `${amount}`;
    this.text.alpha = 1;
    this.text.scale.set(isCrit ? 1.2 : 1);
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime || !this.active;
  }

  update(dt: number): void {
    super.update(dt);
    this.lifetime += dt;

    // Decelerate upward motion
    this.vy += 120 * dt;

    if (this.lifetime >= this.maxLifetime) {
      this.active = false;
    }

    // Update visual
    if (this.text) {
      this.text.position.set(this.x, this.y);

      // Fade out in second half of life
      const progress = this.lifetime / this.maxLifetime;
      if (progress > 0.5) {
        this.text.alpha = 1 - (progress - 0.5) * 2;
      }

      // Scale pop on crit
      if (this.isCrit && this.lifetime < 0.1) {
        const t = this.lifetime / 0.1;
        this.text.scale.set(1.2 + (1 - t) * 0.6);
      }
    }
  }

  reset(): void {
    super.reset();
    this.lifetime = 0;
    if (this.text) {
      this.text.removeFromParent();
    }
  }
}
