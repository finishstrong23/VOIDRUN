export class InputManager {
  readonly keys = new Set<string>();
  moveX = 0;
  moveY = 0;

  private joystickX = 0;
  private joystickY = 0;
  private escapePressed = false;

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code);
    if (e.code === 'Escape') this.escapePressed = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  init(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Prevent default browser gestures on the game canvas
    document.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('dblclick', (e: Event) => {
      e.preventDefault();
    });

    document.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
    });

    // Safari gesture events
    document.addEventListener('gesturestart', (e: Event) => {
      e.preventDefault();
    });

    document.addEventListener('gesturechange', (e: Event) => {
      e.preventDefault();
    });
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  update(): void {
    // Determine keyboard input
    let kx = 0;
    let ky = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) ky -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) ky += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) kx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) kx += 1;

    const hasKeyboardInput = kx !== 0 || ky !== 0;

    if (hasKeyboardInput) {
      // Normalize diagonal movement
      if (kx !== 0 && ky !== 0) {
        const inv = 1 / Math.SQRT2;
        kx *= inv;
        ky *= inv;
      }
      this.moveX = kx;
      this.moveY = ky;
    } else {
      // Fall back to joystick input
      this.moveX = this.joystickX;
      this.moveY = this.joystickY;
    }
  }

  setJoystickInput(x: number, y: number): void {
    this.joystickX = x;
    this.joystickY = y;
  }

  isEscapePressed(): boolean {
    return this.escapePressed;
  }

  consumeEscape(): boolean {
    if (this.escapePressed) {
      this.escapePressed = false;
      return true;
    }
    return false;
  }
}
