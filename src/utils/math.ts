export class Vec2 {
  x: number;
  y: number;
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  set(x: number, y: number): this { this.x = x; this.y = y; return this; }
  copy(v: { x: number; y: number }): this { this.x = v.x; this.y = v.y; return this; }
  add(v: { x: number; y: number }): this { this.x += v.x; this.y += v.y; return this; }
  sub(v: { x: number; y: number }): this { this.x -= v.x; this.y -= v.y; return this; }
  scale(s: number): this { this.x *= s; this.y *= s; return this; }
  length(): number { return Math.sqrt(this.x * this.x + this.y * this.y); }
  lengthSq(): number { return this.x * this.x + this.y * this.y; }
  normalize(): this {
    const len = this.length();
    if (len > 0) { this.x /= len; this.y /= len; }
    return this;
  }
  clone(): Vec2 { return new Vec2(this.x, this.y); }
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function angle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
export function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }
export function randomRange(min: number, max: number): number { return min + Math.random() * (max - min); }
export function randomInt(min: number, max: number): number { return Math.floor(randomRange(min, max + 1)); }

export function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function angleDiff(a: number, b: number): number { return normalizeAngle(b - a); }

export const TWO_PI = Math.PI * 2;
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;
