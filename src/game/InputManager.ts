export class InputManager {
  keys: Set<string> = new Set();
  moveX = 0;
  moveY = 0;

  init(): void {
    // Prevent browser gestures
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('dblclick', (e) => e.preventDefault());
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());

    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  update(): void {
    // WASD / Arrow keys
    let kx = 0;
    let ky = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) ky -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) ky += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) kx -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) kx += 1;

    // Normalize diagonal
    if (kx !== 0 && ky !== 0) {
      const inv = 1 / Math.SQRT2;
      kx *= inv;
      ky *= inv;
    }

    // Keyboard overrides joystick only if keys are pressed
    if (kx !== 0 || ky !== 0) {
      this.moveX = kx;
      this.moveY = ky;
    }
  }

  setJoystickInput(x: number, y: number): void {
    // Only use joystick when no keyboard movement
    if (!this.keys.has('w') && !this.keys.has('s') && !this.keys.has('a') && !this.keys.has('d') &&
        !this.keys.has('arrowup') && !this.keys.has('arrowdown') && !this.keys.has('arrowleft') && !this.keys.has('arrowright')) {
      this.moveX = x;
      this.moveY = y;
    }
  }

  isEscapePressed(): boolean {
    return this.keys.has('escape');
  }

  consumeEscape(): void {
    this.keys.delete('escape');
  }

  destroy(): void {
    this.keys.clear();
  }
}
