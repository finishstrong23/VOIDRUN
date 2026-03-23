import { Sprite, Container } from 'pixi.js';
import { spriteFactory } from '../sprites/SpriteFactory';

const DEAD_ZONE = 12;
const MAX_RADIUS = 60;
const FADE_DURATION = 200; // ms

export class TouchJoystick {
  inputX = 0;
  inputY = 0;

  private container: Container;
  private outer: Sprite;
  private inner: Sprite;

  private originX = 0;
  private originY = 0;
  private activeId: number | null = null;
  private isActive = false;
  private fadeTimer = 0;

  private screenWidth = 0;
  private screenHeight = 0;

  constructor(parentContainer: Container) {
    this.container = new Container();
    this.container.alpha = 0;

    this.outer = new Sprite(spriteFactory.get('joystick_outer'));
    this.outer.anchor.set(0.5);
    this.container.addChild(this.outer);

    this.inner = new Sprite(spriteFactory.get('joystick_inner'));
    this.inner.anchor.set(0.5);
    this.container.addChild(this.inner);

    parentContainer.addChild(this.container);
  }

  resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  onTouchStart(e: TouchEvent): void {
    if (this.activeId !== null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Only activate in left 60% of screen
      if (touch.clientX < this.screenWidth * 0.6) {
        this.activeId = touch.identifier;
        this.originX = touch.clientX;
        this.originY = touch.clientY;
        this.isActive = true;
        this.fadeTimer = 0;

        this.container.alpha = 0.8;
        this.container.position.set(this.originX, this.originY);
        this.inner.position.set(0, 0);
        break;
      }
    }
  }

  onTouchMove(e: TouchEvent): void {
    if (this.activeId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier !== this.activeId) continue;

      const dx = touch.clientX - this.originX;
      const dy = touch.clientY - this.originY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < DEAD_ZONE) {
        this.inputX = 0;
        this.inputY = 0;
        this.inner.position.set(dx, dy);
      } else {
        // Clamp to max radius
        const clampedDist = Math.min(dist, MAX_RADIUS);
        const nx = dx / dist;
        const ny = dy / dist;

        // Analog output: ramp from 0 at dead zone to 1 at max radius
        const analog = (clampedDist - DEAD_ZONE) / (MAX_RADIUS - DEAD_ZONE);
        this.inputX = nx * analog;
        this.inputY = ny * analog;

        this.inner.position.set(nx * clampedDist, ny * clampedDist);
      }
      break;
    }
  }

  onTouchEnd(e: TouchEvent): void {
    if (this.activeId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier !== this.activeId) continue;

      this.activeId = null;
      this.isActive = false;
      this.fadeTimer = FADE_DURATION;
      this.inputX = 0;
      this.inputY = 0;
      this.inner.position.set(0, 0);
      break;
    }
  }

  update(dt: number): void {
    if (!this.isActive && this.fadeTimer > 0) {
      this.fadeTimer -= dt * 1000;
      this.container.alpha = Math.max(0, (this.fadeTimer / FADE_DURATION) * 0.8);
      if (this.fadeTimer <= 0) {
        this.container.alpha = 0;
      }
    }
  }

  destroy(): void {
    this.container.removeFromParent();
    this.container.destroy({ children: true });
  }
}
