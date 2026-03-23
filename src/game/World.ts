import { Graphics, Container } from 'pixi.js';
import { WORLD } from '../data/balance';
import type { Camera } from './Camera';

export class World {
  private gridGraphics: Graphics;
  private parallaxGraphics: Graphics;

  constructor(bgLayer: Container) {
    this.gridGraphics = new Graphics();
    this.parallaxGraphics = new Graphics();
    bgLayer.addChild(this.parallaxGraphics);
    bgLayer.addChild(this.gridGraphics);
  }

  render(camera: Camera): void {
    const { GRID_SIZE, PARALLAX_GRID_SIZE, PARALLAX_FACTOR } = WORLD;
    const margin = GRID_SIZE;

    // Main grid
    this.gridGraphics.clear();
    const left = Math.floor((camera.left - margin) / GRID_SIZE) * GRID_SIZE;
    const top = Math.floor((camera.top - margin) / GRID_SIZE) * GRID_SIZE;
    const right = camera.right + margin;
    const bottom = camera.bottom + margin;

    for (let x = left; x <= right; x += GRID_SIZE) {
      this.gridGraphics.moveTo(x, top);
      this.gridGraphics.lineTo(x, bottom);
    }
    for (let y = top; y <= bottom; y += GRID_SIZE) {
      this.gridGraphics.moveTo(left, y);
      this.gridGraphics.lineTo(right, y);
    }
    this.gridGraphics.stroke({ color: 0x1a1a2e, width: 1, alpha: 0.3 });

    // Parallax grid
    this.parallaxGraphics.clear();
    const pCamX = camera.x * PARALLAX_FACTOR;
    const pCamY = camera.y * PARALLAX_FACTOR;
    const pLeft = Math.floor((pCamX - camera.viewportWidth / 2 - margin) / PARALLAX_GRID_SIZE) * PARALLAX_GRID_SIZE;
    const pTop = Math.floor((pCamY - camera.viewportHeight / 2 - margin) / PARALLAX_GRID_SIZE) * PARALLAX_GRID_SIZE;
    const pRight = pCamX + camera.viewportWidth / 2 + margin;
    const pBottom = pCamY + camera.viewportHeight / 2 + margin;

    // Offset parallax grid position relative to camera
    this.parallaxGraphics.position.set(
      -pCamX + camera.viewportWidth / 2 + camera.shakeX,
      -pCamY + camera.viewportHeight / 2 + camera.shakeY
    );

    for (let x = pLeft; x <= pRight; x += PARALLAX_GRID_SIZE) {
      this.parallaxGraphics.moveTo(x, pTop);
      this.parallaxGraphics.lineTo(x, pBottom);
    }
    for (let y = pTop; y <= pBottom; y += PARALLAX_GRID_SIZE) {
      this.parallaxGraphics.moveTo(pLeft, y);
      this.parallaxGraphics.lineTo(pRight, y);
    }
    this.parallaxGraphics.stroke({ color: 0x1a1a2e, width: 1, alpha: 0.15 });
  }
}
