export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private resetFn: (obj: T) => void;
  activeCount = 0;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number) {
    this.factory = factory;
    this.resetFn = reset;
    for (let i = 0; i < initialSize; i++) this.pool.push(factory());
  }

  acquire(): T {
    this.activeCount++;
    return this.pool.length > 0 ? this.pool.pop()! : this.factory();
  }

  release(obj: T): void {
    this.activeCount--;
    this.resetFn(obj);
    this.pool.push(obj);
  }
}
