import { Graphics, Container } from 'pixi.js';
import { Entity } from './Entity';
import type { EnemyDef, EnemyAI } from '../types';

export class Enemy extends Entity {
  typeName = '';
  damage = 0;
  speed = 0;
  xpValue = 0;
  armor = 0;
  color = 0xef4444;
  shape: string = 'circle';
  ai: EnemyAI = 'chase';
  knockbackResist = 0;
  isBoss = false;
  spawnWeight = 0;

  // Knockback state
  knockbackVx = 0;
  knockbackVy = 0;
  knockbackTimer = 0;

  // AI state
  aiTimer = 0;
  aiPhase = 0;
  targetX = 0;
  targetY = 0;
  isEnraged = false;
  rangedCooldown = 0;

  // Visual state
  flashTimer = 0;
  pulsePhase = 0;
  bodyGraphics: Graphics | null = null;

  init(def: EnemyDef, x: number, y: number, hpScale: number = 1, dmgScale: number = 1): void {
    this.active = true;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.typeName = def.name;
    this.hp = Math.round(def.hp * hpScale);
    this.maxHP = this.hp;
    this.damage = Math.round(def.damage * dmgScale);
    this.speed = def.speed;
    this.xpValue = def.xpValue;
    this.armor = def.armor;
    this.radius = def.radius;
    this.color = def.color;
    this.shape = def.shape;
    this.ai = def.ai;
    this.knockbackResist = def.knockbackResist;
    this.isBoss = def.isBoss || false;
    this.spawnWeight = def.spawnWeight;

    this.knockbackVx = 0;
    this.knockbackVy = 0;
    this.knockbackTimer = 0;
    this.aiTimer = 0;
    this.aiPhase = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.isEnraged = false;
    this.rangedCooldown = 0;
    this.flashTimer = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.vx = 0;
    this.vy = 0;

    this.createSprite();
  }

  createSprite(): void {
    if (this.sprite) this.sprite.removeFromParent();

    const container = new Container();
    const g = new Graphics();
    const r = this.radius;
    const scale = this.isBoss ? 2 : 1;

    switch (this.shape) {
      case 'circle':
        g.circle(0, 0, r);
        break;
      case 'triangle':
        g.poly([0, -r, r * 0.866, r * 0.5, -r * 0.866, r * 0.5]);
        break;
      case 'diamond':
        g.poly([0, -r, r, 0, 0, r, -r, 0]);
        break;
      case 'hexagon':
        g.poly(this.hexPoints(r));
        break;
      case 'star':
        g.poly(this.starPoints(r, r * 0.5, 5));
        break;
    }
    g.fill({ color: this.color });
    g.stroke({ color: this.lightenColor(this.color), width: 1 });

    container.addChild(g);
    container.scale.set(scale);
    this.bodyGraphics = g;
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

  private starPoints(outerR: number, innerR: number, points: number): number[] {
    const pts: number[] = [];
    for (let i = 0; i < points * 2; i++) {
      const a = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      pts.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    return pts;
  }

  private lightenColor(color: number): number {
    const r = Math.min(255, ((color >> 16) & 0xFF) + 40);
    const g = Math.min(255, ((color >> 8) & 0xFF) + 40);
    const b = Math.min(255, (color & 0xFF) + 40);
    return (r << 16) | (g << 8) | b;
  }

  applyKnockback(fromX: number, fromY: number, force: number, duration: number): void {
    const effectiveForce = force * (1 - this.knockbackResist);
    if (effectiveForce <= 0) return;
    const dx = this.x - fromX;
    const dy = this.y - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this.knockbackVx = (dx / dist) * effectiveForce / duration;
    this.knockbackVy = (dy / dist) * effectiveForce / duration;
    this.knockbackTimer = duration;
  }

  flash(): void {
    this.flashTimer = 0.05;
  }

  update(dt: number): void {
    // Handle knockback
    if (this.knockbackTimer > 0) {
      this.knockbackTimer -= dt;
      this.x += this.knockbackVx * dt;
      this.y += this.knockbackVy * dt;
      if (this.knockbackTimer <= 0) {
        this.knockbackVx = 0;
        this.knockbackVy = 0;
      }
    } else {
      super.update(dt);
    }

    // Flash timer
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }

    // Pulse animation
    this.pulsePhase += dt * Math.PI * 2;

    // Boss enrage check
    if (this.isBoss && !this.isEnraged && this.hp <= this.maxHP * 0.5) {
      this.isEnraged = true;
    }
  }

  updateVisuals(alpha: number): void {
    if (!this.sprite) return;

    const renderX = this.prevX + (this.x - this.prevX) * alpha;
    const renderY = this.prevY + (this.y - this.prevY) * alpha;
    this.sprite.position.set(renderX, renderY);

    // Pulse
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.05;
    const baseScale = this.isBoss ? 2 : 1;
    this.sprite.scale.set(baseScale * pulse);

    // Boss rotation
    if (this.isBoss) {
      this.sprite.rotation += 0.5 * (1 / 60);
    }

    // Flash white
    if (this.bodyGraphics) {
      if (this.flashTimer > 0) {
        this.bodyGraphics.tint = 0xffffff;
      } else {
        this.bodyGraphics.tint = 0xffffff; // reset (no tint)
      }
    }
  }

  reset(): void {
    super.reset();
    this.typeName = '';
    this.damage = 0;
    this.speed = 0;
    this.xpValue = 0;
    this.armor = 0;
    this.knockbackVx = 0;
    this.knockbackVy = 0;
    this.knockbackTimer = 0;
    this.aiTimer = 0;
    this.aiPhase = 0;
    this.isEnraged = false;
    this.rangedCooldown = 0;
    this.flashTimer = 0;
    this.bodyGraphics = null;
  }
}
