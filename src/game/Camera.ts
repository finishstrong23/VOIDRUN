export class Camera {
  x = 0;
  y = 0;
  viewportWidth = 0;
  viewportHeight = 0;
  shakeX = 0;
  shakeY = 0;

  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeElapsed = 0;

  private static readonly LERP_FACTOR = 0.08;

  follow(targetX: number, targetY: number): void {
    const factor = Camera.LERP_FACTOR;
    this.x += (targetX - this.x) * factor;
    this.y += (targetY - this.y) * factor;
  }

  shake(intensity: number, duration: number): void {
    // Only override if new shake is stronger
    if (intensity > this.shakeIntensity) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeElapsed = 0;
    }
  }

  update(dt: number): void {
    if (this.shakeDuration > 0) {
      this.shakeElapsed += dt;
      const progress = this.shakeElapsed / this.shakeDuration;
      if (progress >= 1) {
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeElapsed = 0;
      } else {
        // Decay intensity over duration
        const decay = 1 - progress;
        const currentIntensity = this.shakeIntensity * decay;
        this.shakeX = (Math.random() * 2 - 1) * currentIntensity;
        this.shakeY = (Math.random() * 2 - 1) * currentIntensity;
      }
    }
  }

  /** Left edge of viewport in world coordinates */
  get left(): number {
    return this.x - this.viewportWidth * 0.5 + this.shakeX;
  }

  /** Top edge of viewport in world coordinates */
  get top(): number {
    return this.y - this.viewportHeight * 0.5 + this.shakeY;
  }

  /** Right edge of viewport in world coordinates */
  get right(): number {
    return this.x + this.viewportWidth * 0.5 + this.shakeX;
  }

  /** Bottom edge of viewport in world coordinates */
  get bottom(): number {
    return this.y + this.viewportHeight * 0.5 + this.shakeY;
  }

  /** Convert world coordinates to screen coordinates */
  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: wx - this.left,
      y: wy - this.top,
    };
  }
}
