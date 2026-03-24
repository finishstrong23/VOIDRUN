import { Sprite } from 'pixi.js';
import { Entity } from './Entity';
import { spriteFactory } from '../sprites/SpriteFactory';

export type GemSize = 'small' | 'medium' | 'large';

const GEM_XP: Record<GemSize, number> = { small: 1, medium: 3, large: 10 };

export class XPGem extends Entity {
  xpValue = 1;
  gemSize: GemSize = 'small';
  lifetime = 0;
  maxLifetime = 30;
  isMagnetic = false;
  isMagnetized = false;
  magnetSpeed = 600;
  sparkleTimer = 0;
  sparklePhase = 0;

  init(x: number, y: number, xp: number): void {
    this.x = x; this.y = y;
    this.prevX = x; this.prevY = y;
    this.vx = 0; this.vy = 0;
    this.active = true;
    this.lifetime = 0;
    this.isMagnetic = false;
    this.sparkleTimer = 0;
    this.sparklePhase = Math.random() * Math.PI * 2;

    // Determine gem size from xp value
    if (xp >= 10) {
      this.gemSize = 'large';
      this.xpValue = xp;
    } else if (xp >= 3) {
      this.gemSize = 'medium';
      this.xpValue = xp;
    } else {
      this.gemSize = 'small';
      this.xpValue = xp;
    }

    this.radius = this.gemSize === 'large' ? 12 : this.gemSize === 'medium' ? 8 : 6;
    this.hp = 1; this.maxHP = 1;

    if (this.sprite) this.sprite.removeFromParent();
    this.createSprite();
  }

  createSprite(): Sprite {
    const tex = spriteFactory.get(`gem_${this.gemSize}`);
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.scale.set(0.5);
    this.sprite = s;
    return s;
  }

  update(dt: number): void {
    this.lifetime += dt;
    if (this.lifetime >= this.maxLifetime) {
      this.active = false;
      return;
    }

    // Magnetic pickup: move toward player
    if (this.isMagnetic) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const magnetSpeed = 600;
        this.vx = (dx / dist) * magnetSpeed;
        this.vy = (dy / dist) * magnetSpeed;
      }
    }

    super.update(dt);

    // Sparkle animation
    this.sparkleTimer += dt * 1000;
    this.sparklePhase += dt * 4;
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime || !this.active;
  }

  // Target position for magnetic pickup
  private targetX = 0;
  private targetY = 0;

  setMagneticTarget(px: number, py: number): void {
    this.isMagnetic = true;
    this.targetX = px;
    this.targetY = py;
  }

  updateVisuals(alpha: number): void {
    if (!this.sprite || !(this.sprite instanceof Sprite)) return;
    const s = this.sprite as Sprite;

    // Interpolated position
    const ix = this.prevX + (this.x - this.prevX) * alpha;
    const iy = this.prevY + (this.y - this.prevY) * alpha;
    s.position.set(ix, iy);

    // Sparkle: subtle bob and scale pulse
    const bob = Math.sin(this.sparklePhase) * 2;
    s.position.y = iy + bob;

    const pulse = 0.5 + Math.sin(this.sparklePhase * 1.5) * 0.05;
    s.scale.set(pulse);

    // Fade out near end of lifetime
    if (this.lifetime > this.maxLifetime - 3) {
      s.alpha = (this.maxLifetime - this.lifetime) / 3;
    } else {
      s.alpha = 1;
    }
  }
}
