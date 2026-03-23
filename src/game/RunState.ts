export class RunState {
  classId = '';
  timeAlive = 0;
  killCount = 0;
  bossKills = 0;
  playerLevel = 1;
  xp = 0;
  xpToNext = 10;
  isActive = false;

  start(classId: string): void {
    this.classId = classId;
    this.timeAlive = 0;
    this.killCount = 0;
    this.bossKills = 0;
    this.playerLevel = 1;
    this.xp = 0;
    this.xpToNext = 10;
    this.isActive = true;
  }

  reset(): void {
    this.classId = '';
    this.timeAlive = 0;
    this.killCount = 0;
    this.bossKills = 0;
    this.playerLevel = 1;
    this.xp = 0;
    this.xpToNext = 10;
    this.isActive = false;
  }
}
