import { Sprite, TilingSprite, Container } from 'pixi.js';
import { spriteFactory } from '../sprites/SpriteFactory';
import { WORLD } from '../data/balance';
import { seededRandom, cellSeed } from '../utils/seeded-random';

interface Prop {
  sprite: Sprite;
  cellKey: number;
}

const PROP_TYPES = [
  { key: 'prop_crystal_24', weight: 3 },
  { key: 'prop_crystal_36', weight: 2 },
  { key: 'prop_crystal_48', weight: 1 },
  { key: 'prop_tree_48', weight: 3 },
  { key: 'prop_tree_64', weight: 2 },
  { key: 'prop_pillar_32', weight: 3 },
  { key: 'prop_pillar_48', weight: 2 },
  { key: 'prop_vent', weight: 2 },
  { key: 'prop_bones', weight: 4 },
];

const TOTAL_WEIGHT = PROP_TYPES.reduce((s, p) => s + p.weight, 0);

function pickPropKey(rng: () => number): string {
  let roll = rng() * TOTAL_WEIGHT;
  for (const p of PROP_TYPES) {
    roll -= p.weight;
    if (roll <= 0) return p.key;
  }
  return PROP_TYPES[0].key;
}

export class World {
  private groundTiling: TilingSprite | null = null;
  private propsContainer: Container;
  private vignetteSprite: Sprite | null = null;
  private vignetteContainer: Container;

  private activeProps = new Map<number, Prop[]>();
  private propDensity = 1.0;

  private readonly CELL_SIZE = WORLD.PROP_CELL_SIZE; // 256
  private readonly MARGIN = 512; // extra margin beyond viewport for prop generation

  constructor(groundContainer: Container, propsContainer: Container, vignetteContainer: Container) {
    this.propsContainer = propsContainer;
    this.vignetteContainer = vignetteContainer;

    // Create tiling ground
    const groundTexture = spriteFactory.get('ground_tile');
    this.groundTiling = new TilingSprite({
      texture: groundTexture,
      width: 1,
      height: 1,
    });
    groundContainer.addChild(this.groundTiling);

    // Create vignette overlay
    this.vignetteSprite = new Sprite(spriteFactory.get('vignette'));
    vignetteContainer.addChild(this.vignetteSprite);
  }

  setQuality(propDensity: number): void {
    this.propDensity = propDensity;
  }

  resize(screenWidth: number, screenHeight: number): void {
    // Stretch vignette to full screen
    if (this.vignetteSprite) {
      this.vignetteSprite.width = screenWidth;
      this.vignetteSprite.height = screenHeight;
    }
  }

  update(cameraLeft: number, cameraTop: number, cameraRight: number, cameraBottom: number): void {
    const viewW = cameraRight - cameraLeft;
    const viewH = cameraBottom - cameraTop;

    // Update tiling sprite to cover viewport
    if (this.groundTiling) {
      this.groundTiling.width = viewW + this.CELL_SIZE * 2;
      this.groundTiling.height = viewH + this.CELL_SIZE * 2;

      // Position so tiling aligns with world coords
      const snapX = Math.floor(cameraLeft / this.CELL_SIZE) * this.CELL_SIZE;
      const snapY = Math.floor(cameraTop / this.CELL_SIZE) * this.CELL_SIZE;
      this.groundTiling.position.set(snapX - this.CELL_SIZE, snapY - this.CELL_SIZE);
      this.groundTiling.tilePosition.set(-snapX + this.CELL_SIZE, -snapY + this.CELL_SIZE);
    }

    // Determine visible cells (with margin)
    const minCX = Math.floor((cameraLeft - this.MARGIN) / this.CELL_SIZE);
    const maxCX = Math.floor((cameraRight + this.MARGIN) / this.CELL_SIZE);
    const minCY = Math.floor((cameraTop - this.MARGIN) / this.CELL_SIZE);
    const maxCY = Math.floor((cameraBottom + this.MARGIN) / this.CELL_SIZE);

    const visibleKeys = new Set<number>();

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const key = cellKey(cx, cy);
        visibleKeys.add(key);

        if (!this.activeProps.has(key)) {
          this.generateCell(cx, cy, key);
        }
      }
    }

    // Remove cells that are no longer visible
    for (const [key, props] of this.activeProps) {
      if (!visibleKeys.has(key)) {
        for (const prop of props) {
          prop.sprite.removeFromParent();
          prop.sprite.destroy();
        }
        this.activeProps.delete(key);
      }
    }
  }

  private generateCell(cx: number, cy: number, key: number): void {
    const seed = cellSeed(cx, cy);
    const rng = seededRandom(seed);

    const props: Prop[] = [];

    // Density check: skip some cells based on quality
    if (rng() > WORLD.PROP_CHANCE * this.propDensity) {
      this.activeProps.set(key, props);
      return;
    }

    // 1-3 props per cell
    const count = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) {
      const propKey = pickPropKey(rng);
      const tex = spriteFactory.get(propKey);
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 1.0); // anchor bottom-center

      // Random position within cell
      const wx = cx * this.CELL_SIZE + rng() * this.CELL_SIZE;
      const wy = cy * this.CELL_SIZE + rng() * this.CELL_SIZE;
      sprite.position.set(wx, wy);

      // Slight random scale variation
      const scaleVar = 0.7 + rng() * 0.6;
      sprite.scale.set(scaleVar);

      // Random subtle alpha variation
      sprite.alpha = 0.6 + rng() * 0.4;

      this.propsContainer.addChild(sprite);
      props.push({ sprite, cellKey: key });
    }

    this.activeProps.set(key, props);
  }

  destroy(): void {
    for (const [, props] of this.activeProps) {
      for (const prop of props) {
        prop.sprite.destroy();
      }
    }
    this.activeProps.clear();

    if (this.groundTiling) {
      this.groundTiling.destroy();
      this.groundTiling = null;
    }
    if (this.vignetteSprite) {
      this.vignetteSprite.destroy();
      this.vignetteSprite = null;
    }
  }
}

function cellKey(cx: number, cy: number): number {
  return ((cx & 0xffff) << 16) | (cy & 0xffff);
}
