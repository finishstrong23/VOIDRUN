# VOIDRUN Sprite Generation Guide

## How It Works

Drop PNG files into the folders below. The game auto-detects them at startup — any sprites found replace the procedural versions. Missing sprites gracefully fall back to procedural generation, so you can replace them one at a time.

**Alternative**: Use a single spritesheet by placing `spritesheet.json` + `spritesheet.png` in this folder (TexturePacker / free-tex-packer format).

---

## Art Style Direction

**IMPORTANT: This is NOT pixel art. It's chibi/cartoon hand-painted 2D.**

- **Style**: Chibi / cute cartoon — big heads, small bodies, expressive faces
- **Vibe**: Professional but FRIENDLY, fun, almost family-friendly (think Archero, Survivor.io, the reference image)
- **NOT gothic or scary** — enemies are cute/menacing, not horrifying
- **View**: Top-down / 3/4 perspective
- **Rendering**: Hand-painted 2D with soft shading, clean outlines
- **Palette**: Dark backgrounds with VIBRANT character colors — rich reds, bright cyans, glowing purples
- **Characters**: Big round heads, stubby bodies, exaggerated features, glowing eyes
- **Background**: Transparent PNG with alpha channel
- **Outline**: Clean dark outlines around characters (2-3px at native res)
- **Shading**: Soft cel-shading with 2-3 tones per color + highlights

### Color Reference
- Accent Cyan: #00e5ff
- Accent Red: #e63950 (warm, not harsh)
- Accent Purple: #bf5af2
- Accent Gold: #ffd060
- Accent Green: #30d158
- Dark base: #1a1530 to #2a2040 (purples, not pure black)
- Ground: #2a3040 to #1a2030 (dark blue-gray)

---

## AI Generation Prompts

Use these with **Midjourney**, **Leonardo.ai**, **Stable Diffusion**, or **PixelLab**:

### Base Style Prompt
> chibi cartoon character, hand-painted 2D game art, top-down 3/4 view, big head small body, cute style, dark fantasy theme, clean outlines, soft cel-shading, transparent background, mobile game quality, similar to Archero or Survivor.io art style

### Player Characters (64x64px each)

**Voidwalker** (cyan accent #00e5ff):
> chibi hooded mage character, top-down 3/4 view, dark cloak with cyan energy trim, big round head, glowing cyan eyes, cute proportions, holding void energy blade, dark fantasy cute style, clean outlines, transparent background

**Sentinel** (purple accent #bf5af2):
> chibi armored knight character, top-down 3/4 view, dark plate armor with purple energy glow, big round head, glowing purple eyes, cute proportions, energy shield, dark fantasy cute style, clean outlines, transparent background

**Sharpshooter** (green accent #30d158):
> chibi ranger character, top-down 3/4 view, dark hood and cape, big round head, glowing green eyes, cute proportions, holding energy bow, dark fantasy cute style, clean outlines, transparent background

*Generate 4 frames per class: idle1, idle2 (slight bob), walk1 (legs apart), walk2 (legs together), plus 1 hurt frame (white flash)*

### Enemies

| Sprite | Size | Prompt Keywords |
|--------|------|-----------------|
| Grunt | 48x48 | cute round blob creature, stubby legs, big red glowing eyes, dark purple body, menacing but adorable |
| Swarmer | 32x32 | small cute flying bat-insect, orange eyes, dark wings, chibi proportions |
| Brute | 72x72 | large chunky creature, single big red eye, cracked energy veins, oversized fists, cute but tough |
| Ranged | 48x48 | small floating hooded caster, purple energy orbs in tiny hands, cute face barely visible in hood |
| Boss Charger | 112x112 | big armored beast, cute stubby horns, red energy seams, heavy claws, two angry red eyes, intimidating but cartoony |
| Boss Nova | 96x96 | geometric cosmic entity, rotating rings of energy, purple and red orbs, single glowing eye slit, mystical |

*Generate 2 frames per enemy (idle + slight animation variation)*

### Props

| Sprite | Size | Prompt Keywords |
|--------|------|-----------------|
| Crystal (small) | 40x40 | glowing cyan crystal emerging from rock, cartoon style, simple |
| Crystal (medium) | 52x52 | medium glowing cyan crystal, cartoon style |
| Crystal (large) | 64x64 | large bright cyan crystal, cartoon style, dramatic glow |
| Dead Tree (small) | 64x64 | cute dead twisted tree, dark bark, purple glow at roots, cartoony |
| Dead Tree (large) | 80x80 | large cute dead tree, gnarled branches, purple root glow |
| Ruin Pillar (small) | 48x48 | broken stone pillar, cyan rune markings, cartoon style |
| Ruin Pillar (large) | 64x64 | tall broken pillar, glowing cyan runes, cartoon style |
| Void Vent | 48x48 | dark floor vent, purple energy smoke, cartoon style |
| Bones Pile | 32x32 | cute pile of cartoon bones with round skull, not scary |

### XP Gems

| Sprite | Size | Prompt Keywords |
|--------|------|-----------------|
| Small | 24x24 | small glowing cyan diamond gem, cartoon, shiny highlight |
| Medium | 32x32 | medium glowing cyan diamond gem, cartoon, bright |
| Large | 40x40 | large bright cyan diamond gem, cartoon, dramatic sparkle |

### Ground Tile

| Sprite | Size | Notes |
|--------|------|-------|
| Ground | 256x256 | Must tile seamlessly! Dark terrain with subtle texture |

> seamless tileable dark terrain texture, painted style, void dimension floor, subtle stones and cracks, dark blue-gray (#1a2530), slightly worn path feeling, not too detailed

### Particles (16x16 each)

Simple glowing dots — probably best kept procedural unless you want custom shapes:
- `particle_00e5ff.png` — Cyan
- `particle_ff2d55.png` — Red
- `particle_bf5af2.png` — Purple
- `particle_ffd60a.png` — Gold
- `particle_30d158.png` — Green
- `particle_ffffff.png` — White

---

## File Naming (Must Match Exactly)

```
sprites/
├── player/
│   ├── player_voidwalker_idle_0.png
│   ├── player_voidwalker_idle_1.png
│   ├── player_voidwalker_walk_0.png
│   ├── player_voidwalker_walk_1.png
│   ├── player_voidwalker_hurt.png
│   ├── player_sentinel_idle_0.png
│   ├── player_sentinel_idle_1.png
│   ├── player_sentinel_walk_0.png
│   ├── player_sentinel_walk_1.png
│   ├── player_sentinel_hurt.png
│   ├── player_sharpshooter_idle_0.png
│   ├── player_sharpshooter_idle_1.png
│   ├── player_sharpshooter_walk_0.png
│   ├── player_sharpshooter_walk_1.png
│   └── player_sharpshooter_hurt.png
├── enemies/
│   ├── enemy_grunt_0.png
│   ├── enemy_grunt_1.png
│   ├── enemy_swarmer_0.png
│   ├── enemy_swarmer_1.png
│   ├── enemy_brute_0.png
│   ├── enemy_brute_1.png
│   ├── enemy_ranged_0.png
│   ├── enemy_ranged_1.png
│   ├── enemy_boss_charger_0.png
│   ├── enemy_boss_charger_1.png
│   ├── enemy_boss_nova_0.png
│   └── enemy_boss_nova_1.png
├── gems/
│   ├── gem_small.png
│   ├── gem_medium.png
│   └── gem_large.png
├── props/
│   ├── prop_crystal_24.png
│   ├── prop_crystal_36.png
│   ├── prop_crystal_48.png
│   ├── prop_tree_48.png
│   ├── prop_tree_64.png
│   ├── prop_pillar_32.png
│   ├── prop_pillar_48.png
│   ├── prop_vent.png
│   └── prop_bones.png
├── effects/
│   ├── particle_00e5ff.png
│   ├── particle_ff2d55.png
│   ├── particle_bf5af2.png
│   ├── particle_ffd60a.png
│   ├── particle_30d158.png
│   ├── particle_ffffff.png
│   └── dash_afterimage.png
├── ground/
│   └── ground_tile.png
└── ui/
    ├── joystick_outer.png
    ├── joystick_inner.png
    └── vignette.png
```

## Recommended Tools

1. **Leonardo.ai** — Best for this style, great chibi/cartoon results, free tier
2. **Midjourney** — Excellent quality, great at chibi game art
3. **Stable Diffusion + Cartoon/Anime LoRA** — Free, local, most control
4. **Aseprite** ($20) — Great for cleanup and animation frames
5. **Photopea** (free) — Browser-based Photoshop alternative for cleanup
6. **free-tex-packer** (free) — Pack individual sprites into a spritesheet

## Tips

- Generate at 2x-4x size (e.g., 256x256 for 64px sprites) then downscale for crispness
- Use transparent backgrounds (PNG alpha)
- Keep a consistent light source direction (top-left)
- Test one character first to nail the style before batch generating
- The ground tile MUST be seamlessly tileable
- Keep enemy designs cute but menacing — big eyes, round shapes
- Use the same base prompt for all characters to maintain style consistency
- Add "game asset, sprite sheet" to prompts for better isolation
