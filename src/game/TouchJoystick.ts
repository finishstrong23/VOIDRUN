import { Graphics, Container } from 'pixi.js';
import { clamp } from '../utils/math';

const DEAD_ZONE = 12;
const MAX_RADIUS = 60;
const LEFT_ZONE_PERCENT = 0.6;

export class TouchJoystick {
  private container: Container;
  private outerRing: Graphics;
  private innerThumb: Graphics;
  private active = false;
  private touchId: number | null = null;
  private originX = 0;
  private originY = 0;
  private screenWidth = 0;
  private screenHeight = 0;
  private fadeTimer = 0;
  private isMobile: boolean;

  // Output
  inputX = 0;
  inputY = 0;

  constructor(layer: Container, isMobile: boolean) {
    this.isMobile = isMobile;
    this.container = new Container();
    this.container.visible = false;
    layer.addChild(this.container);

    // Outer ring
    this.outerRing = new Graphics();
    this.outerRing.circle(0, 0, MAX_RADIUS);
    this.outerRing.stroke({ color: 0xffffff, width: 2, alpha: 0.2 });
    this.container.addChild(this.outerRing);

    // Inner thumb
    this.innerThumb = new Graphics();
    this.innerThumb.circle(0, 0, 24);
    this.innerThumb.fill({ color: 0xffffff, alpha: 0.4 });
    this.container.addChild(this.innerThumb);
  }

  init(canvas: HTMLCanvasElement): void {
    if (!this.isMobile) return;

    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    if (this.touchId !== null) return; // Already tracking a touch

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Only accept touches in the left zone
      if (touch.clientX < this.screenWidth * LEFT_ZONE_PERCENT) {
        this.touchId = touch.identifier;
        this.originX = touch.clientX;
        this.originY = touch.clientY;
        this.active = true;
        this.container.visible = true;
        this.container.alpha = 1;
        this.container.position.set(this.originX, this.originY);
        this.innerThumb.position.set(0, 0);
        this.fadeTimer = 0;
        break;
      }
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (this.touchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchId) {
        const dx = touch.clientX - this.originX;
        const dy = touch.clientY - this.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < DEAD_ZONE) {
          this.inputX = 0;
          this.inputY = 0;
          this.innerThumb.position.set(dx, dy);
        } else {
          const clampedDist = Math.min(dist, MAX_RADIUS);
          const angle = Math.atan2(dy, dx);
          const magnitude = (clampedDist - DEAD_ZONE) / (MAX_RADIUS - DEAD_ZONE);

          this.inputX = Math.cos(angle) * magnitude;
          this.inputY = Math.sin(angle) * magnitude;

          this.innerThumb.position.set(
            Math.cos(angle) * clampedDist,
            Math.sin(angle) * clampedDist
          );
        }
        break;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (this.touchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this.touchId = null;
        this.active = false;
        this.inputX = 0;
        this.inputY = 0;
        this.fadeTimer = 0.2; // 200ms fade out
        break;
      }
    }
  };

  update(dt: number): void {
    if (this.fadeTimer > 0) {
      this.fadeTimer -= dt;
      this.container.alpha = Math.max(0, this.fadeTimer / 0.2);
      if (this.fadeTimer <= 0) {
        this.container.visible = false;
      }
    }
  }

  updateBounds(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  destroy(): void {
    this.container.removeFromParent();
  }
}
