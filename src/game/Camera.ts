import { lerp, randomRange } from '../utils/math';

export class Camera {
  x = 0;
  y = 0;
  viewportWidth = 0;
  viewportHeight = 0;

  // Shake
  shakeX = 0;
  shakeY = 0;
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeTimer = 0;

  private lerpFactor = 0.08;

  follow(targetX: number, targetY: number): void {
    this.x = lerp(this.x, targetX, this.lerpFactor);
    this.y = lerp(this.y, targetY, this.lerpFactor);
  }

  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  update(dt: number): void {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * t;
      this.shakeX = randomRange(-currentIntensity, currentIntensity);
      this.shakeY = randomRange(-currentIntensity, currentIntensity);
      if (this.shakeTimer <= 0) {
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }
  }

  get left(): number { return this.x - this.viewportWidth / 2 + this.shakeX; }
  get top(): number { return this.y - this.viewportHeight / 2 + this.shakeY; }
  get right(): number { return this.x + this.viewportWidth / 2 + this.shakeX; }
  get bottom(): number { return this.y + this.viewportHeight / 2 + this.shakeY; }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX - this.x + this.viewportWidth / 2 + this.shakeX,
      y: worldY - this.y + this.viewportHeight / 2 + this.shakeY,
    };
  }
}
