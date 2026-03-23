import type { QualityTier } from '../types';
import { QUALITY_PRESETS } from '../data/quality-presets';

export class AdaptiveQuality {
  currentTier: QualityTier = 'high';
  private fpsHistory: number[] = [];
  private windowTimer = 0;
  private windowDuration = 3; // 3 second windows
  private lowCount = 0;
  private highCount = 0;
  private locked = false;
  private frameCount = 0;
  private lastTime = 0;

  constructor(startTier: QualityTier) {
    this.currentTier = startTier;
    this.lastTime = performance.now();
  }

  lock(tier: QualityTier): void {
    this.currentTier = tier;
    this.locked = true;
  }

  unlock(): void {
    this.locked = false;
  }

  recordFrame(): void {
    this.frameCount++;
  }

  update(dt: number): void {
    if (this.locked) return;

    this.windowTimer += dt;
    if (this.windowTimer >= this.windowDuration) {
      const now = performance.now();
      const elapsed = (now - this.lastTime) / 1000;
      const avgFPS = this.frameCount / elapsed;

      this.frameCount = 0;
      this.lastTime = now;
      this.windowTimer = 0;

      if (avgFPS < 45) {
        this.lowCount++;
        this.highCount = 0;
        if (this.lowCount >= 2) {
          this.dropTier();
          this.lowCount = 0;
        }
      } else if (avgFPS > 55) {
        this.highCount++;
        this.lowCount = 0;
        if (this.highCount >= 3) {
          this.raiseTier();
          this.highCount = 0;
        }
      } else {
        this.lowCount = 0;
        this.highCount = 0;
      }
    }
  }

  private dropTier(): void {
    if (this.currentTier === 'high') this.currentTier = 'medium';
    else if (this.currentTier === 'medium') this.currentTier = 'low';
  }

  private raiseTier(): void {
    if (this.currentTier === 'low') this.currentTier = 'medium';
    else if (this.currentTier === 'medium') this.currentTier = 'high';
  }

  get preset() {
    return QUALITY_PRESETS[this.currentTier];
  }
}
