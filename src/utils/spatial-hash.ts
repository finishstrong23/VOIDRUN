import type { Entity } from '../entities/Entity';

const CELL_SIZE = 96;

export class SpatialHash {
  private cells: Map<number, Entity[]> = new Map();

  clear(): void {
    this.cells.forEach(cell => cell.length = 0);
  }

  private key(cx: number, cy: number): number {
    // Pack two 16-bit ints into one 32-bit number for faster map lookups
    return ((cx & 0xFFFF) << 16) | (cy & 0xFFFF);
  }

  insert(entity: Entity): void {
    const minCX = Math.floor((entity.x - entity.radius) / CELL_SIZE);
    const maxCX = Math.floor((entity.x + entity.radius) / CELL_SIZE);
    const minCY = Math.floor((entity.y - entity.radius) / CELL_SIZE);
    const maxCY = Math.floor((entity.y + entity.radius) / CELL_SIZE);
    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const k = this.key(cx, cy);
        let cell = this.cells.get(k);
        if (!cell) {
          cell = [];
          this.cells.set(k, cell);
        }
        cell.push(entity);
      }
    }
  }

  query(x: number, y: number, radius: number): Entity[] {
    const results: Entity[] = [];
    const seen = new Set<number>();
    const minCX = Math.floor((x - radius) / CELL_SIZE);
    const maxCX = Math.floor((x + radius) / CELL_SIZE);
    const minCY = Math.floor((y - radius) / CELL_SIZE);
    const maxCY = Math.floor((y + radius) / CELL_SIZE);
    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const cell = this.cells.get(this.key(cx, cy));
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            const e = cell[i];
            if (!seen.has(e.id)) {
              seen.add(e.id);
              results.push(e);
            }
          }
        }
      }
    }
    return results;
  }
}
