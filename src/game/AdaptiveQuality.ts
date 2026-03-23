import type { QualityPreset, QualityTier } from '../types';
import { QUALITY_PRESETS } from '../data/quality-presets';

const SAMPLE_WINDOW = 60; // frames to average
const TARGET_FPS = 55;
const DOWNGRADE_FPS = 40;
const UPGRADE_FPS = 58;
const STABILITY_FRAMES = 120; // frames to wait before upgrading

export class AdaptiveQuality {
  currentTier: QualityTier = 'high';
  currentPreset: QualityPreset;

  private frameTimes: number[] = [];
  private sampleIndex = 0;
  private stabilityCounter = 0;
  private locked = false;

  private readonly tiers: QualityTier[] = ['low', 'medium', 'high'];

  constructor(initialTier: QualityTier = 'high') {
    this.currentTier = initialTier;
    this.currentPreset = { ...QUALITY_PRESETS[initialTier] };
    this.frameTimes = new Array(SAMPLE_WINDOW).fill(16.67);
  }

  /** Lock quality to prevent auto-adjustment (e.g., user manually set it) */
  lock(tier: QualityTier): void {
    this.currentTier = tier;
    this.currentPreset = { ...QUALITY_PRESETS[tier] };
    this.locked = true;
  }

  unlock(): void {
    this.locked = false;
  }

  /**
   * Call each frame with the frame duration in milliseconds.
   * Returns true if the quality tier changed.
   */
  update(frameDeltaMs: number): boolean {
    if (this.locked) return false;

    // Record frame time
    this.frameTimes[this.sampleIndex] = frameDeltaMs;
    this.sampleIndex = (this.sampleIndex + 1) % SAMPLE_WINDOW;

    // Calculate average FPS
    let totalMs = 0;
    for (let i = 0; i < SAMPLE_WINDOW; i++) {
      totalMs += this.frameTimes[i];
    }
    const avgMs = totalMs / SAMPLE_WINDOW;
    const avgFPS = 1000 / avgMs;

    // Downgrade: react quickly
    if (avgFPS < DOWNGRADE_FPS) {
      return this.downgrade();
    }

    // Upgrade: require stability
    if (avgFPS > UPGRADE_FPS) {
      this.stabilityCounter++;
      if (this.stabilityCounter >= STABILITY_FRAMES) {
        this.stabilityCounter = 0;
        return this.upgrade();
      }
    } else {
      this.stabilityCounter = 0;
    }

    return false;
  }

  private downgrade(): boolean {
    const idx = this.tiers.indexOf(this.currentTier);
    if (idx <= 0) return false;

    this.currentTier = this.tiers[idx - 1];
    this.currentPreset = { ...QUALITY_PRESETS[this.currentTier] };
    this.stabilityCounter = 0;
    return true;
  }

  private upgrade(): boolean {
    const idx = this.tiers.indexOf(this.currentTier);
    if (idx >= this.tiers.length - 1) return false;

    this.currentTier = this.tiers[idx + 1];
    this.currentPreset = { ...QUALITY_PRESETS[this.currentTier] };
    this.stabilityCounter = 0;
    return true;
  }

  getPreset(): QualityPreset {
    return this.currentPreset;
  }

  getMaxEnemies(): number {
    return this.currentPreset.maxEnemies;
  }
}
