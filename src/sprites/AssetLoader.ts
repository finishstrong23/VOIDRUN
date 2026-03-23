import { Assets, Texture, Spritesheet, type SpritesheetData } from 'pixi.js';

/**
 * Loads external sprite assets (PNG spritesheets or individual PNGs).
 * Falls back gracefully — if assets aren't found, SpriteFactory uses procedural generation.
 *
 * Expected directory structure:
 *   public/sprites/
 *     player/         — player_voidwalker_idle_0.png, etc.
 *     enemies/        — enemy_grunt_0.png, etc.
 *     props/          — prop_crystal_24.png, etc.
 *     gems/           — gem_small.png, etc.
 *     effects/        — particle_00e5ff.png, etc.
 *     ui/             — joystick_outer.png, etc.
 *     ground/         — ground_tile.png
 *
 * OR use a single spritesheet:
 *   public/sprites/spritesheet.json  (TexturePacker / free-tex-packer format)
 *   public/sprites/spritesheet.png
 */

export interface SpriteManifestEntry {
  key: string;
  width: number;
  height: number;
  category: string;
  description: string;
}

// Complete manifest of every sprite the game uses
export const SPRITE_MANIFEST: SpriteManifestEntry[] = [
  // Player sprites (3 classes × 5 frames each)
  ...['voidwalker', 'sentinel', 'sharpshooter'].flatMap(cls => [
    { key: `player_${cls}_idle_0`, width: 64, height: 64, category: 'player', description: `${cls} idle frame 1` },
    { key: `player_${cls}_idle_1`, width: 64, height: 64, category: 'player', description: `${cls} idle frame 2 (slight bob)` },
    { key: `player_${cls}_walk_0`, width: 64, height: 64, category: 'player', description: `${cls} walk frame 1 (legs apart)` },
    { key: `player_${cls}_walk_1`, width: 64, height: 64, category: 'player', description: `${cls} walk frame 2 (legs together)` },
    { key: `player_${cls}_hurt`, width: 64, height: 64, category: 'player', description: `${cls} hurt flash (white tint)` },
  ]),

  // Enemies
  { key: 'enemy_grunt_0', width: 48, height: 48, category: 'enemies', description: 'Grunt blob idle' },
  { key: 'enemy_grunt_1', width: 48, height: 48, category: 'enemies', description: 'Grunt blob wobble' },
  { key: 'enemy_swarmer_0', width: 32, height: 32, category: 'enemies', description: 'Swarmer wings up' },
  { key: 'enemy_swarmer_1', width: 32, height: 32, category: 'enemies', description: 'Swarmer wings down' },
  { key: 'enemy_brute_0', width: 72, height: 72, category: 'enemies', description: 'Brute idle' },
  { key: 'enemy_brute_1', width: 72, height: 72, category: 'enemies', description: 'Brute pulse' },
  { key: 'enemy_ranged_0', width: 48, height: 48, category: 'enemies', description: 'Ranged caster idle' },
  { key: 'enemy_ranged_1', width: 48, height: 48, category: 'enemies', description: 'Ranged caster casting' },
  { key: 'enemy_boss_charger_0', width: 112, height: 112, category: 'enemies', description: 'Boss charger idle' },
  { key: 'enemy_boss_charger_1', width: 112, height: 112, category: 'enemies', description: 'Boss charger pulse' },
  { key: 'enemy_boss_nova_0', width: 96, height: 96, category: 'enemies', description: 'Boss nova rotation 1' },
  { key: 'enemy_boss_nova_1', width: 96, height: 96, category: 'enemies', description: 'Boss nova rotation 2' },

  // XP Gems
  { key: 'gem_small', width: 24, height: 24, category: 'gems', description: 'Small cyan diamond gem' },
  { key: 'gem_medium', width: 32, height: 32, category: 'gems', description: 'Medium cyan diamond gem' },
  { key: 'gem_large', width: 40, height: 40, category: 'gems', description: 'Large cyan diamond gem' },

  // Props
  { key: 'prop_crystal_24', width: 40, height: 40, category: 'props', description: 'Small void crystal' },
  { key: 'prop_crystal_36', width: 52, height: 52, category: 'props', description: 'Medium void crystal' },
  { key: 'prop_crystal_48', width: 64, height: 64, category: 'props', description: 'Large void crystal' },
  { key: 'prop_tree_48', width: 64, height: 64, category: 'props', description: 'Small dead tree' },
  { key: 'prop_tree_64', width: 80, height: 80, category: 'props', description: 'Large dead tree' },
  { key: 'prop_pillar_32', width: 48, height: 48, category: 'props', description: 'Small ruin pillar' },
  { key: 'prop_pillar_48', width: 64, height: 64, category: 'props', description: 'Large ruin pillar' },
  { key: 'prop_vent', width: 48, height: 48, category: 'props', description: 'Void vent (purple glow)' },
  { key: 'prop_bones', width: 32, height: 32, category: 'props', description: 'Bones pile with skull' },

  // Effects / Particles
  { key: 'particle_00e5ff', width: 16, height: 16, category: 'effects', description: 'Cyan particle glow' },
  { key: 'particle_ff2d55', width: 16, height: 16, category: 'effects', description: 'Red particle glow' },
  { key: 'particle_bf5af2', width: 16, height: 16, category: 'effects', description: 'Purple particle glow' },
  { key: 'particle_ffd60a', width: 16, height: 16, category: 'effects', description: 'Gold particle glow' },
  { key: 'particle_30d158', width: 16, height: 16, category: 'effects', description: 'Green particle glow' },
  { key: 'particle_ffffff', width: 16, height: 16, category: 'effects', description: 'White particle glow' },
  { key: 'dash_afterimage', width: 44, height: 44, category: 'effects', description: 'Dash trail silhouette' },

  // Ground
  { key: 'ground_tile', width: 256, height: 256, category: 'ground', description: 'Seamless ground tile (dark void terrain)' },

  // UI
  { key: 'joystick_outer', width: 128, height: 128, category: 'ui', description: 'Joystick outer ring' },
  { key: 'joystick_inner', width: 56, height: 56, category: 'ui', description: 'Joystick inner thumb' },
  { key: 'vignette', width: 512, height: 512, category: 'ui', description: 'Screen edge vignette overlay' },
];

class AssetLoader {
  private loadedTextures: Map<string, Texture> = new Map();
  private loaded = false;

  /**
   * Attempt to load all sprite assets. Non-blocking — missing files are silently skipped.
   */
  async loadAll(): Promise<void> {
    if (this.loaded) return;

    // Strategy 1: Try loading a combined spritesheet first
    try {
      const sheetData = await Assets.load<SpritesheetData>('/sprites/spritesheet.json');
      if (sheetData && typeof sheetData === 'object' && 'textures' in sheetData) {
        const sheet = sheetData as unknown as Spritesheet;
        for (const [key, tex] of Object.entries(sheet.textures)) {
          this.loadedTextures.set(key, tex as Texture);
        }
        console.log(`[AssetLoader] Loaded spritesheet with ${this.loadedTextures.size} textures`);
        this.loaded = true;
        return;
      }
    } catch {
      // No spritesheet — try individual files
    }

    // Strategy 2: Load individual PNGs from category folders
    const results = await Promise.allSettled(
      SPRITE_MANIFEST.map(async (entry) => {
        const path = `/sprites/${entry.category}/${entry.key}.png`;
        try {
          const tex = await Assets.load<Texture>(path);
          if (tex && tex !== Texture.EMPTY) {
            this.loadedTextures.set(entry.key, tex);
          }
        } catch {
          // Missing file — will use procedural fallback
        }
      })
    );

    const count = this.loadedTextures.size;
    if (count > 0) {
      console.log(`[AssetLoader] Loaded ${count}/${SPRITE_MANIFEST.length} sprite assets`);
    } else {
      console.log('[AssetLoader] No sprite assets found — using procedural generation');
    }

    this.loaded = true;
  }

  /**
   * Get a loaded texture by key, or null if not loaded (use procedural fallback).
   */
  get(key: string): Texture | null {
    return this.loadedTextures.get(key) ?? null;
  }

  /**
   * Check if any external assets were loaded.
   */
  get hasAssets(): boolean {
    return this.loadedTextures.size > 0;
  }

  /**
   * Number of loaded textures.
   */
  get count(): number {
    return this.loadedTextures.size;
  }
}

export const assetLoader = new AssetLoader();
