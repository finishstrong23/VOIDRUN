import { Application, Container } from 'pixi.js';
import { getDevicePixelRatio } from '../utils/device';

export interface RenderLayers {
  background: Container;
  gems: Container;
  enemies: Container;
  player: Container;
  projectiles: Container;
  effects: Container;
  damageNumbers: Container;
  joystick: Container;
}

export class PixiRenderer {
  app!: Application;
  layers!: RenderLayers;
  private worldContainer!: Container;

  async init(container: HTMLElement): Promise<void> {
    const dpr = getDevicePixelRatio();

    this.app = new Application();
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: dpr,
      autoDensity: true,
      antialias: false,
      backgroundColor: 0x0a0a0f,
      powerPreference: 'high-performance',
    });

    container.appendChild(this.app.canvas);

    // World container (moved by camera)
    this.worldContainer = new Container();
    this.app.stage.addChild(this.worldContainer);

    // Create layers
    this.layers = {
      background: new Container(),
      gems: new Container(),
      enemies: new Container(),
      player: new Container(),
      projectiles: new Container(),
      effects: new Container(),
      damageNumbers: new Container(),
      joystick: new Container(),
    };

    // Add layers to world container (camera-affected)
    this.worldContainer.addChild(this.layers.background);
    this.worldContainer.addChild(this.layers.gems);
    this.worldContainer.addChild(this.layers.enemies);
    this.worldContainer.addChild(this.layers.player);
    this.worldContainer.addChild(this.layers.projectiles);
    this.worldContainer.addChild(this.layers.effects);
    this.worldContainer.addChild(this.layers.damageNumbers);

    // Joystick is in screen space (not affected by camera)
    this.app.stage.addChild(this.layers.joystick);
  }

  updateCamera(cameraX: number, cameraY: number, shakeX: number, shakeY: number): void {
    this.worldContainer.position.set(
      -cameraX + window.innerWidth / 2 + shakeX,
      -cameraY + window.innerHeight / 2 + shakeY
    );
  }

  resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.app.renderer.resize(width, height);
  }

  destroy(): void {
    this.app.destroy(true);
  }
}
