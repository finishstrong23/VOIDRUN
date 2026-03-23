import { xpForLevel } from '../data/balance';

export class RunState {
  classId = 'voidwalker';
  timeAlive = 0;
  killCount = 0;
  bossKills = 0;
  wavesCompleted = 0;
  currentWave = 0;
  playerLevel = 1;
  xp = 0;
  xpToNext = 10;
  isActive = false;

  start(classId: string): void {
    this.classId = classId;
    this.timeAlive = 0;
    this.killCount = 0;
    this.bossKills = 0;
    this.wavesCompleted = 0;
    this.currentWave = 0;
    this.playerLevel = 1;
    this.xp = 0;
    this.xpToNext = xpForLevel(1);
    this.isActive = true;
  }

  stop(): void {
    this.isActive = false;
  }

  update(dt: number): void {
    if (this.isActive) {
      this.timeAlive += dt;
    }
  }

  addKill(isBoss: boolean): void {
    this.killCount++;
    if (isBoss) this.bossKills++;
  }

  completeWave(waveNumber: number): void {
    this.wavesCompleted++;
    this.currentWave = waveNumber;
  }

  /**
   * Add XP and check for level-ups.
   * Returns the number of level-ups that occurred.
   */
  addXP(amount: number, xpMultiplier: number): number {
    this.xp += Math.round(amount * xpMultiplier);
    let levelUps = 0;

    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.playerLevel++;
      this.xpToNext = xpForLevel(this.playerLevel);
      levelUps++;
    }

    return levelUps;
  }
}
