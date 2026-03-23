import { Container } from 'pixi.js';

let nextId = 0;

export class Entity {
  id: number;
  x = 0; y = 0; prevX = 0; prevY = 0;
  vx = 0; vy = 0;
  hp = 0; maxHP = 0; radius = 16;
  active = false;
  sprite: Container | null = null;

  constructor() { this.id = nextId++; }

  update(dt: number): void {
    this.prevX = this.x; this.prevY = this.y;
    this.x += this.vx * dt; this.y += this.vy * dt;
  }

  reset(): void {
    this.x = 0; this.y = 0; this.prevX = 0; this.prevY = 0;
    this.vx = 0; this.vy = 0; this.hp = 0; this.maxHP = 0;
    this.active = false;
    if (this.sprite) this.sprite.removeFromParent();
  }

  takeDamage(amount: number): boolean { this.hp -= amount; return this.hp <= 0; }
  isAlive(): boolean { return this.hp > 0 && this.active; }
}
