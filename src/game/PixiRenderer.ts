import { Application, Container } from 'pixi.js';
import { COLORS } from '../data/balance';
import { getDevicePixelRatio } from '../utils/device';

export interface RenderLayers {
  ground: Container;
  props: Container;
  shadows: Container;
  gems: Container;
  enemies: Container;
  player: Container;
  projectiles: Container;
  effects: Container;
  damageNumbers: Container;
  vignette: Container;
  joystick: Container;
}

export class PixiRenderer {
  app: Application;
  worldContainer: Container;
  layers: RenderLayers;

  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.app = new Application();
    this.worldContainer = new Container();

    // Create all render layers
    this.layers = {
      ground: new Container(),
      props: new Container(),
      shadows: new Container(),
      gems: new Container(),
      enemies: new Container(),
      player: new Container(),
      projectiles: new Container(),
      effects: new Container(),
      damageNumbers: new Container(),
      vignette: new Container(),
      joystick: new Container(),
    };
  }

  async init(container: HTMLElement): Promise<void> {
    const dpr = getDevicePixelRatio();

    // Pixi v8: pass the container element, let Pixi create its own canvas
    await this.app.init({
      resizeTo: window,
      resolution: dpr,
      autoDensity: true,
      backgroundColor: COLORS.BG,
      antialias: false,
      powerPreference: 'high-performance',
    });

    // Append Pixi's canvas to the container
    container.appendChild(this.app.canvas);

    // Build layer hierarchy
    // World layers: ground through damageNumbers (move with camera)
    this.worldContainer.addChild(this.layers.ground);
    this.worldContainer.addChild(this.layers.props);
    this.worldContainer.addChild(this.layers.shadows);
    this.worldContainer.addChild(this.layers.gems);
    this.worldContainer.addChild(this.layers.enemies);
    this.worldContainer.addChild(this.layers.player);
    this.worldContainer.addChild(this.layers.projectiles);
    this.worldContainer.addChild(this.layers.effects);
    this.worldContainer.addChild(this.layers.damageNumbers);

    this.app.stage.addChild(this.worldContainer);

    // Screen-space layers: vignette and joystick (fixed on screen, not affected by camera)
    this.app.stage.addChild(this.layers.vignette);
    this.app.stage.addChild(this.layers.joystick);

    // Handle resize
    this.resizeObserver = new ResizeObserver(() => {
      this.app.resize();
    });
    this.resizeObserver.observe(container);
  }

  /**
   * Update worldContainer position to reflect camera.
   * Camera x,y is the center of the viewport, so we offset by half the screen.
   */
  updateCamera(cameraX: number, cameraY: number, shakeX: number, shakeY: number): void {
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;

    this.worldContainer.position.set(
      -cameraX + screenW * 0.5 + shakeX,
      -cameraY + screenH * 0.5 + shakeY,
    );
  }

  get screenWidth(): number {
    return this.app.screen.width;
  }

  get screenHeight(): number {
    return this.app.screen.height;
  }

  setResolution(resolution: number): void {
    this.app.renderer.resolution = resolution;
    this.app.resize();
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.app.destroy(true, { children: true, texture: false });
  }
}
