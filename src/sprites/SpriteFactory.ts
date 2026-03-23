import { Graphics, Texture, type Renderer, RenderTexture, Container } from 'pixi.js';
import { COLORS } from '../data/balance';

export class SpriteFactory {
  private textures: Map<string, Texture> = new Map();
  private renderer!: Renderer;

  async generateAll(renderer: Renderer): Promise<void> {
    this.renderer = renderer;

    // Player sprites (3 classes x animation frames)
    this.generatePlayerSprites(0x00e5ff, 'voidwalker');
    this.generatePlayerSprites(0xbf5af2, 'sentinel');
    this.generatePlayerSprites(0x30d158, 'sharpshooter');

    // Enemy sprites
    this.generateGruntSprites();
    this.generateSwarmerSprites();
    this.generateBruteSprites();
    this.generateRangedSprites();
    this.generateBossChargerSprites();
    this.generateBossNovaSprites();

    // XP gems
    this.generateGemSprites();

    // Props
    this.generatePropSprites();

    // Effects
    this.generateEffectSprites();

    // Ground tile
    this.generateGroundTile();

    // UI elements
    this.generateUISprites();
  }

  get(name: string): Texture {
    return this.textures.get(name) || Texture.EMPTY;
  }

  private cache(name: string, g: Graphics | Container, width: number, height: number): void {
    const rt = RenderTexture.create({ width, height, resolution: 2 });
    if (g instanceof Container) {
      g.position.set(width / 2, height / 2);
    }
    this.renderer.render({ container: g, target: rt });
    this.textures.set(name, rt);
    if (g instanceof Graphics) g.destroy();
  }

  // ── PLAYER ──
  private generatePlayerSprites(accent: number, classId: string): void {
    for (let frame = 0; frame < 4; frame++) {
      const g = new Graphics();
      const s = 64; // draw size
      const bobY = frame < 2 ? (frame === 0 ? 0 : -1) : (frame === 2 ? -2 : 0);
      const legOffset = frame >= 2 ? (frame === 2 ? 3 : -3) : 0;

      // Shadow
      g.ellipse(s / 2, s - 6, 14, 5);
      g.fill({ color: 0x000000, alpha: 0.4 });

      // Cape/cloak
      g.roundRect(s / 2 - 14, s / 2 - 4 + bobY, 28, 24, 4);
      g.fill({ color: 0x0d1117 });
      g.roundRect(s / 2 - 14, s / 2 - 4 + bobY, 28, 24, 4);
      g.stroke({ color: accent, width: 1, alpha: 0.6 });

      // Legs
      g.roundRect(s / 2 - 6 + legOffset, s / 2 + 16 + bobY, 5, 10, 2);
      g.fill({ color: 0x1a1a2e });
      g.roundRect(s / 2 + 1 - legOffset, s / 2 + 16 + bobY, 5, 10, 2);
      g.fill({ color: 0x1a1a2e });

      // Body
      g.roundRect(s / 2 - 10, s / 2 - 2 + bobY, 20, 18, 4);
      g.fill({ color: 0x1a1a2e });

      // Head (hooded)
      g.circle(s / 2, s / 2 - 12 + bobY, 13);
      g.fill({ color: 0x12121e });
      // Hood outline
      g.arc(s / 2, s / 2 - 12 + bobY, 14, -Math.PI * 0.8, Math.PI * 0.8);
      g.stroke({ color: accent, width: 1.5, alpha: 0.8 });

      // Eyes (glowing)
      g.circle(s / 2 - 4, s / 2 - 12 + bobY, 2);
      g.fill({ color: accent });
      g.circle(s / 2 + 4, s / 2 - 12 + bobY, 2);
      g.fill({ color: accent });

      // Eye glow
      g.circle(s / 2 - 4, s / 2 - 12 + bobY, 4);
      g.fill({ color: accent, alpha: 0.2 });
      g.circle(s / 2 + 4, s / 2 - 12 + bobY, 4);
      g.fill({ color: accent, alpha: 0.2 });

      // Weapon glow (small arc in front)
      if (classId === 'voidwalker') {
        g.arc(s / 2 + 12, s / 2 + bobY, 6, -0.8, 0.8);
        g.stroke({ color: accent, width: 2, alpha: 0.7 });
      } else if (classId === 'sharpshooter') {
        g.circle(s / 2 + 14, s / 2 - 2 + bobY, 3);
        g.fill({ color: accent, alpha: 0.8 });
        g.circle(s / 2 + 14, s / 2 - 2 + bobY, 5);
        g.fill({ color: accent, alpha: 0.2 });
      }

      const type = frame < 2 ? 'idle' : 'walk';
      const idx = frame < 2 ? frame : frame - 2;
      this.cache(`player_${classId}_${type}_${idx}`, g, s, s);
    }

    // Hurt frame
    const gh = new Graphics();
    const s = 64;
    gh.ellipse(s / 2, s - 6, 14, 5);
    gh.fill({ color: 0x000000, alpha: 0.4 });
    gh.roundRect(s / 2 - 14, s / 2 - 4, 28, 24, 4);
    gh.fill({ color: 0xffffff, alpha: 0.8 });
    gh.roundRect(s / 2 - 10, s / 2 - 2, 20, 18, 4);
    gh.fill({ color: 0xffffff, alpha: 0.9 });
    gh.circle(s / 2, s / 2 - 12, 13);
    gh.fill({ color: 0xffffff, alpha: 0.9 });
    this.cache(`player_${classId}_hurt`, gh, s, s);
  }

  // ── ENEMIES ──
  private generateGruntSprites(): void {
    for (let frame = 0; frame < 2; frame++) {
      const g = new Graphics();
      const s = 48;
      const wobble = frame === 0 ? 0 : 2;

      // Shadow
      g.ellipse(s / 2, s - 4, 10, 4);
      g.fill({ color: 0x000000, alpha: 0.4 });

      // Body (round blob)
      g.circle(s / 2 + wobble, s / 2 + 2, 14);
      g.fill({ color: 0x2d1f3d });
      g.circle(s / 2 + wobble, s / 2 + 2, 14);
      g.stroke({ color: 0x3d2f4d, width: 1 });

      // Inner highlight
      g.circle(s / 2 + wobble - 3, s / 2 - 2, 6);
      g.fill({ color: 0x3d2f4d, alpha: 0.5 });

      // Stubby legs
      g.roundRect(s / 2 - 8 + wobble, s / 2 + 12, 6, 6, 2);
      g.fill({ color: 0x231530 });
      g.roundRect(s / 2 + 2 + wobble, s / 2 + 12, 6, 6, 2);
      g.fill({ color: 0x231530 });

      // Eyes (red, glowing)
      g.circle(s / 2 - 5 + wobble, s / 2 - 2, 3);
      g.fill({ color: 0xff2d55 });
      g.circle(s / 2 + 5 + wobble, s / 2 - 2, 3);
      g.fill({ color: 0xff2d55 });
      // Eye glow
      g.circle(s / 2 - 5 + wobble, s / 2 - 2, 6);
      g.fill({ color: 0xff2d55, alpha: 0.15 });
      g.circle(s / 2 + 5 + wobble, s / 2 - 2, 6);
      g.fill({ color: 0xff2d55, alpha: 0.15 });
      // Pupil
      g.circle(s / 2 - 5 + wobble, s / 2 - 2, 1.5);
      g.fill({ color: 0xffffff });
      g.circle(s / 2 + 5 + wobble, s / 2 - 2, 1.5);
      g.fill({ color: 0xffffff });

      this.cache(`enemy_grunt_${frame}`, g, s, s);
    }
  }

  private generateSwarmerSprites(): void {
    for (let frame = 0; frame < 2; frame++) {
      const g = new Graphics();
      const s = 32;
      const wingAngle = frame === 0 ? 0.3 : -0.2;

      // Wings
      g.ellipse(s / 2 - 8, s / 2 - 2 + wingAngle * 10, 6, 3);
      g.fill({ color: 0x3d2f4d, alpha: 0.4 });
      g.ellipse(s / 2 + 8, s / 2 - 2 - wingAngle * 10, 6, 3);
      g.fill({ color: 0x3d2f4d, alpha: 0.4 });

      // Body (triangular)
      g.poly([s / 2, s / 2 - 8, s / 2 + 8, s / 2 + 6, s / 2 - 8, s / 2 + 6]);
      g.fill({ color: 0x1f1a2e });
      g.poly([s / 2, s / 2 - 8, s / 2 + 8, s / 2 + 6, s / 2 - 8, s / 2 + 6]);
      g.stroke({ color: 0xff9f0a, width: 1, alpha: 0.5 });

      // Three orange eyes
      g.circle(s / 2 - 3, s / 2 - 1, 1.5);
      g.fill({ color: 0xff9f0a });
      g.circle(s / 2 + 3, s / 2 - 1, 1.5);
      g.fill({ color: 0xff9f0a });
      g.circle(s / 2, s / 2 + 2, 1.5);
      g.fill({ color: 0xff9f0a });

      this.cache(`enemy_swarmer_${frame}`, g, s, s);
    }
  }

  private generateBruteSprites(): void {
    for (let frame = 0; frame < 2; frame++) {
      const g = new Graphics();
      const s = 72;
      const pulse = frame === 0 ? 0 : 1;

      // Shadow
      g.ellipse(s / 2, s - 4, 18, 6);
      g.fill({ color: 0x000000, alpha: 0.4 });

      // Body (blocky)
      g.roundRect(s / 2 - 18, s / 2 - 14 - pulse, 36, 32 + pulse, 6);
      g.fill({ color: 0x3d2154 });
      g.roundRect(s / 2 - 18, s / 2 - 14 - pulse, 36, 32 + pulse, 6);
      g.stroke({ color: 0x4d316a, width: 1 });

      // Crack/vein lines (red energy)
      g.moveTo(s / 2 - 12, s / 2 - 8); g.lineTo(s / 2 - 5, s / 2 + 2); g.lineTo(s / 2 - 14, s / 2 + 10);
      g.stroke({ color: 0xff2d55, width: 1.5, alpha: 0.6 });
      g.moveTo(s / 2 + 8, s / 2 - 10); g.lineTo(s / 2 + 12, s / 2 + 4);
      g.stroke({ color: 0xff2d55, width: 1.5, alpha: 0.6 });

      // Heavy arms
      g.roundRect(s / 2 - 26, s / 2 - 4, 10, 20, 4);
      g.fill({ color: 0x3d2154 });
      g.roundRect(s / 2 + 16, s / 2 - 4, 10, 20, 4);
      g.fill({ color: 0x3d2154 });
      // Fists
      g.circle(s / 2 - 21, s / 2 + 16, 6);
      g.fill({ color: 0x4d316a });
      g.circle(s / 2 + 21, s / 2 + 16, 6);
      g.fill({ color: 0x4d316a });

      // Single large eye
      g.circle(s / 2, s / 2 - 6, 7);
      g.fill({ color: 0x0a0a14 });
      g.circle(s / 2, s / 2 - 6, 5);
      g.fill({ color: 0xff2d55 });
      g.circle(s / 2, s / 2 - 6, 8);
      g.fill({ color: 0xff2d55, alpha: 0.15 });
      g.circle(s / 2, s / 2 - 6, 2);
      g.fill({ color: 0xffffff });

      this.cache(`enemy_brute_${frame}`, g, s, s);
    }
  }

  private generateRangedSprites(): void {
    for (let frame = 0; frame < 2; frame++) {
      const g = new Graphics();
      const s = 48;
      const orbPulse = frame === 0 ? 4 : 5;

      // Floating shadow (smaller, further down)
      g.ellipse(s / 2, s - 3, 8, 3);
      g.fill({ color: 0x000000, alpha: 0.3 });

      // Robe/body (hooded floating figure)
      g.poly([s / 2, s / 2 - 14, s / 2 + 12, s / 2 + 10, s / 2 - 12, s / 2 + 10]);
      g.fill({ color: 0x1a1530 });
      g.poly([s / 2, s / 2 - 14, s / 2 + 12, s / 2 + 10, s / 2 - 12, s / 2 + 10]);
      g.stroke({ color: 0x5e5ce6, width: 1, alpha: 0.5 });

      // Hood
      g.circle(s / 2, s / 2 - 10, 9);
      g.fill({ color: 0x12101e });

      // Glowing hands
      g.circle(s / 2 - 10, s / 2 + 4, 3);
      g.fill({ color: 0xbf5af2, alpha: 0.8 });
      g.circle(s / 2 - 10, s / 2 + 4, 5);
      g.fill({ color: 0xbf5af2, alpha: 0.2 });
      g.circle(s / 2 + 10, s / 2 + 4, 3);
      g.fill({ color: 0xbf5af2, alpha: 0.8 });
      g.circle(s / 2 + 10, s / 2 + 4, 5);
      g.fill({ color: 0xbf5af2, alpha: 0.2 });

      // Energy orb between hands
      g.circle(s / 2, s / 2 + 2, orbPulse);
      g.fill({ color: 0xbf5af2 });
      g.circle(s / 2, s / 2 + 2, orbPulse + 3);
      g.fill({ color: 0xbf5af2, alpha: 0.15 });

      // Eyes
      g.circle(s / 2 - 3, s / 2 - 12, 1.5);
      g.fill({ color: 0x5e5ce6 });
      g.circle(s / 2 + 3, s / 2 - 12, 1.5);
      g.fill({ color: 0x5e5ce6 });

      this.cache(`enemy_ranged_${frame}`, g, s, s);
    }
  }

  private generateBossChargerSprites(): void {
    for (let frame = 0; frame < 2; frame++) {
      const g = new Graphics();
      const s = 112;
      const pulse = frame === 0 ? 0 : 2;

      // Shadow
      g.ellipse(s / 2, s - 6, 28, 8);
      g.fill({ color: 0x000000, alpha: 0.5 });

      // Body (massive armored)
      g.roundRect(s / 2 - 28, s / 2 - 20 - pulse, 56, 44 + pulse, 8);
      g.fill({ color: 0x2a1020 });

      // Armor plates
      g.roundRect(s / 2 - 24, s / 2 - 16, 48, 14, 4);
      g.fill({ color: 0x3a1525 });
      g.roundRect(s / 2 - 22, s / 2 + 2, 44, 14, 4);
      g.fill({ color: 0x3a1525 });

      // Red energy seams between plates
      g.moveTo(s / 2 - 24, s / 2); g.lineTo(s / 2 + 24, s / 2);
      g.stroke({ color: 0xff2d55, width: 2, alpha: 0.8 });
      g.moveTo(s / 2, s / 2 - 16); g.lineTo(s / 2, s / 2 + 16);
      g.stroke({ color: 0xff2d55, width: 1.5, alpha: 0.5 });

      // Horns
      g.moveTo(s / 2 - 16, s / 2 - 24); g.lineTo(s / 2 - 24, s / 2 - 38);
      g.lineTo(s / 2 - 12, s / 2 - 28);
      g.fill({ color: 0x4a2535 });
      g.moveTo(s / 2 + 16, s / 2 - 24); g.lineTo(s / 2 + 24, s / 2 - 38);
      g.lineTo(s / 2 + 12, s / 2 - 28);
      g.fill({ color: 0x4a2535 });

      // Claw arms
      g.roundRect(s / 2 - 38, s / 2 - 6, 12, 28, 4);
      g.fill({ color: 0x2a1020 });
      g.roundRect(s / 2 + 26, s / 2 - 6, 12, 28, 4);
      g.fill({ color: 0x2a1020 });

      // Two large eyes
      g.circle(s / 2 - 10, s / 2 - 8, 6);
      g.fill({ color: 0x0a0008 });
      g.circle(s / 2 - 10, s / 2 - 8, 4);
      g.fill({ color: 0xff2d55 });
      g.circle(s / 2 + 10, s / 2 - 8, 6);
      g.fill({ color: 0x0a0008 });
      g.circle(s / 2 + 10, s / 2 - 8, 4);
      g.fill({ color: 0xff2d55 });

      // Eye glow
      g.circle(s / 2 - 10, s / 2 - 8, 10);
      g.fill({ color: 0xff2d55, alpha: 0.1 });
      g.circle(s / 2 + 10, s / 2 - 8, 10);
      g.fill({ color: 0xff2d55, alpha: 0.1 });

      this.cache(`enemy_boss_charger_${frame}`, g, s, s);
    }
  }

  private generateBossNovaSprites(): void {
    for (let frame = 0; frame < 2; frame++) {
      const g = new Graphics();
      const s = 96;
      const rot = frame * 0.3;

      // Outer ring
      g.circle(s / 2, s / 2, 36);
      g.stroke({ color: 0xbf5af2, width: 2, alpha: 0.4 });

      // Counter-rotating ring
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i + rot;
        const x = s / 2 + Math.cos(a) * 30;
        const y = s / 2 + Math.sin(a) * 30;
        g.circle(x, y, 3);
        g.fill({ color: 0xff2d55, alpha: 0.6 });
      }

      // Inner ring
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i - rot;
        const x = s / 2 + Math.cos(a) * 20;
        const y = s / 2 + Math.sin(a) * 20;
        g.circle(x, y, 2.5);
        g.fill({ color: 0xbf5af2, alpha: 0.8 });
      }

      // Core sphere
      g.circle(s / 2, s / 2, 16);
      g.fill({ color: 0x0a0014 });
      g.circle(s / 2, s / 2, 16);
      g.stroke({ color: 0xbf5af2, width: 2, alpha: 0.6 });

      // Inner core glow
      g.circle(s / 2, s / 2, 10);
      g.fill({ color: 0x1a0030 });

      // Eye slit
      g.ellipse(s / 2, s / 2, 8, 3);
      g.fill({ color: 0xff2d55 });
      g.ellipse(s / 2, s / 2, 12, 5);
      g.fill({ color: 0xff2d55, alpha: 0.2 });

      this.cache(`enemy_boss_nova_${frame}`, g, s, s);
    }
  }

  // ── XP GEMS ──
  private generateGemSprites(): void {
    const sizes = [
      { name: 'gem_small', r: 6, glow: 10 },
      { name: 'gem_medium', r: 8, glow: 14 },
      { name: 'gem_large', r: 12, glow: 18 },
    ];
    for (const { name, r, glow } of sizes) {
      const s = glow * 2 + 4;
      const g = new Graphics();
      // Outer glow
      g.circle(s / 2, s / 2, glow);
      g.fill({ color: 0x00e5ff, alpha: 0.15 });
      // Diamond shape
      g.poly([s / 2, s / 2 - r, s / 2 + r * 0.6, s / 2, s / 2, s / 2 + r, s / 2 - r * 0.6, s / 2]);
      g.fill({ color: 0x00e5ff });
      // Inner highlight
      g.poly([s / 2, s / 2 - r * 0.5, s / 2 + r * 0.2, s / 2, s / 2, s / 2 + r * 0.3]);
      g.fill({ color: 0xffffff, alpha: 0.5 });
      this.cache(name, g, s, s);
    }
  }

  // ── PROPS ──
  private generatePropSprites(): void {
    // Void Crystal (3 sizes)
    for (const size of [24, 36, 48]) {
      const g = new Graphics();
      const s = size + 16;
      // Base rock
      g.ellipse(s / 2, s - 4, size / 3, 4);
      g.fill({ color: 0x1a1525 });
      // Crystal body
      g.poly([s / 2, 4, s / 2 + size / 4, s - 8, s / 2 - size / 4, s - 8]);
      g.fill({ color: 0x004858 });
      g.poly([s / 2, 4, s / 2 + size / 4, s - 8, s / 2 - size / 4, s - 8]);
      g.stroke({ color: 0x00e5ff, width: 1, alpha: 0.6 });
      // Inner light
      g.poly([s / 2, 8, s / 2 + size / 8, s - 12, s / 2 - size / 8, s - 12]);
      g.fill({ color: 0x00e5ff, alpha: 0.15 });
      // Top glow
      g.circle(s / 2, 6, 4);
      g.fill({ color: 0x00e5ff, alpha: 0.3 });
      this.cache(`prop_crystal_${size}`, g, s, s);
    }

    // Dead Tree
    for (const size of [48, 64]) {
      const g = new Graphics();
      const s = size + 16;
      // Trunk
      g.roundRect(s / 2 - 4, s / 2 - 10, 8, size / 2, 2);
      g.fill({ color: 0x2a2030 });
      // Branches
      g.moveTo(s / 2, s / 2 - 6); g.lineTo(s / 2 - 14, s / 2 - 20); g.lineTo(s / 2 - 10, s / 2 - 26);
      g.stroke({ color: 0x2a2030, width: 3 });
      g.moveTo(s / 2, s / 2 - 12); g.lineTo(s / 2 + 12, s / 2 - 24); g.lineTo(s / 2 + 16, s / 2 - 30);
      g.stroke({ color: 0x2a2030, width: 2.5 });
      g.moveTo(s / 2 + 2, s / 2 - 8); g.lineTo(s / 2 + 8, s / 2 - 14);
      g.stroke({ color: 0x2a2030, width: 2 });
      // Root glow
      g.ellipse(s / 2, s / 2 + size / 4 - 6, 10, 4);
      g.fill({ color: 0xbf5af2, alpha: 0.15 });
      this.cache(`prop_tree_${size}`, g, s, s);
    }

    // Ruin Pillar
    for (const size of [32, 48]) {
      const g = new Graphics();
      const s = size + 16;
      // Pillar body
      g.roundRect(s / 2 - 6, s / 2 - size / 3, 12, size / 1.5, 2);
      g.fill({ color: 0x2a2a3a });
      // Broken top
      g.poly([s / 2 - 6, s / 2 - size / 3, s / 2 - 2, s / 2 - size / 3 - 6, s / 2 + 4, s / 2 - size / 3 - 2, s / 2 + 6, s / 2 - size / 3]);
      g.fill({ color: 0x2a2a3a });
      // Rune lines
      g.moveTo(s / 2 - 3, s / 2 - 4); g.lineTo(s / 2 + 3, s / 2 + 4);
      g.stroke({ color: 0x00e5ff, width: 1, alpha: 0.3 });
      g.moveTo(s / 2 - 2, s / 2 + 6); g.lineTo(s / 2 + 2, s / 2 + 10);
      g.stroke({ color: 0x00e5ff, width: 1, alpha: 0.25 });
      this.cache(`prop_pillar_${size}`, g, s, s);
    }

    // Void Vent
    const gv = new Graphics();
    gv.ellipse(24, 24, 12, 6);
    gv.fill({ color: 0x0a0014 });
    gv.ellipse(24, 24, 10, 4);
    gv.fill({ color: 0xbf5af2, alpha: 0.2 });
    gv.ellipse(24, 24, 6, 2);
    gv.fill({ color: 0xbf5af2, alpha: 0.4 });
    this.cache('prop_vent', gv, 48, 48);

    // Bones pile
    const gb = new Graphics();
    gb.roundRect(8, 16, 14, 3, 1); gb.fill({ color: 0x8a8a7a });
    gb.roundRect(12, 12, 10, 3, 1); gb.fill({ color: 0x7a7a6a });
    gb.roundRect(10, 20, 8, 2, 1); gb.fill({ color: 0x6a6a5a });
    gb.circle(18, 10, 3); gb.fill({ color: 0x8a8a7a }); // skull
    gb.circle(17, 9, 0.8); gb.fill({ color: 0x2a2a2a }); // eye
    gb.circle(19, 9, 0.8); gb.fill({ color: 0x2a2a2a }); // eye
    this.cache('prop_bones', gb, 32, 32);
  }

  // ── EFFECTS ──
  private generateEffectSprites(): void {
    // Particle (small glowing dot)
    for (const color of [0x00e5ff, 0xff2d55, 0xbf5af2, 0xffd60a, 0x30d158, 0xffffff]) {
      const g = new Graphics();
      g.circle(8, 8, 6);
      g.fill({ color, alpha: 0.15 });
      g.circle(8, 8, 3);
      g.fill({ color, alpha: 0.6 });
      g.circle(8, 8, 1.5);
      g.fill({ color: 0xffffff, alpha: 0.8 });
      const hex = color.toString(16).padStart(6, '0');
      this.cache(`particle_${hex}`, g, 16, 16);
    }

    // Dash afterimage (just a faded player-like silhouette)
    const gd = new Graphics();
    gd.roundRect(12, 18, 20, 18, 4);
    gd.fill({ color: 0x00e5ff, alpha: 0.3 });
    gd.circle(22, 12, 10);
    gd.fill({ color: 0x00e5ff, alpha: 0.25 });
    this.cache('dash_afterimage', gd, 44, 44);
  }

  // ── GROUND TILE ──
  private generateGroundTile(): void {
    const g = new Graphics();
    const s = 256;

    // Base fill
    g.rect(0, 0, s, s);
    g.fill({ color: 0x0f1923 });

    // Random darker blobs for depth
    const rng = () => Math.random();
    for (let i = 0; i < 20; i++) {
      const x = rng() * s, y = rng() * s;
      const r = 10 + rng() * 20;
      g.circle(x, y, r);
      g.fill({ color: 0x0a1018, alpha: 0.4 + rng() * 0.3 });
    }

    // Lighter patches
    for (let i = 0; i < 8; i++) {
      const x = rng() * s, y = rng() * s;
      g.circle(x, y, 15 + rng() * 25);
      g.fill({ color: 0x162130, alpha: 0.3 });
    }

    // Gravel dots
    for (let i = 0; i < 80; i++) {
      const x = rng() * s, y = rng() * s;
      g.circle(x, y, 1 + rng() * 1.5);
      g.fill({ color: 0x2d3a4a, alpha: 0.3 + rng() * 0.3 });
    }

    // Subtle grid lines
    for (let x = 0; x <= s; x += 64) {
      g.moveTo(x, 0); g.lineTo(x, s);
      g.stroke({ color: 0x1a2535, width: 1, alpha: 0.1 });
    }
    for (let y = 0; y <= s; y += 64) {
      g.moveTo(0, y); g.lineTo(s, y);
      g.stroke({ color: 0x1a2535, width: 1, alpha: 0.1 });
    }

    this.cache('ground_tile', g, s, s);
  }

  // ── UI SPRITES ──
  private generateUISprites(): void {
    // Joystick outer ring
    const jo = new Graphics();
    jo.circle(64, 64, 60);
    jo.stroke({ color: 0xffffff, width: 2, alpha: 0.15 });
    jo.circle(64, 64, 60);
    jo.fill({ color: 0x1c2a3a, alpha: 0.1 });
    this.cache('joystick_outer', jo, 128, 128);

    // Joystick inner thumb
    const ji = new Graphics();
    ji.circle(28, 28, 24);
    ji.fill({ color: 0xffffff, alpha: 0.25 });
    ji.circle(28, 28, 20);
    ji.fill({ color: 0xffffff, alpha: 0.1 });
    this.cache('joystick_inner', ji, 56, 56);

    // Vignette (dark edges for atmosphere)
    const vg = new Graphics();
    const vs = 512;
    // Top edge
    vg.rect(0, 0, vs, 80);
    vg.fill({ color: 0x000000, alpha: 0.25 });
    // Bottom edge
    vg.rect(0, vs - 80, vs, 80);
    vg.fill({ color: 0x000000, alpha: 0.25 });
    // Left edge
    vg.rect(0, 0, 60, vs);
    vg.fill({ color: 0x000000, alpha: 0.15 });
    // Right edge
    vg.rect(vs - 60, 0, 60, vs);
    vg.fill({ color: 0x000000, alpha: 0.15 });
    this.cache('vignette', vg, vs, vs);
  }
}

export const spriteFactory = new SpriteFactory();
