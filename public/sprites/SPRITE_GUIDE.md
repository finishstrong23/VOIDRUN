# VOIDRUN Sprite Generation Guide

## How It Works

Drop PNG files into the folders below. The game auto-detects them at startup — any sprites found replace the procedural versions. Missing sprites gracefully fall back to procedural generation, so you can replace them one at a time.

**Alternative**: Use a single spritesheet by placing `spritesheet.json` + `spritesheet.png` in this folder (TexturePacker / free-tex-packer format).

---

## Art Style Direction

- **Theme**: Dark void / cosmic horror / roguelike survivor
- **Palette**: Deep purples (#1a1530, #3d2154), dark blues (#0f1923, #12121e), with neon accents
- **Accent Colors**: Cyan (#00e5ff), Red (#ff2d55), Purple (#bf5af2), Gold (#ffd60a), Green (#30d158)
- **Style**: Pixel art, 16-bit era aesthetic (matches Press Start 2P font)
- **View**: Top-down / ¾ perspective
- **Background**: Transparent (PNG with alpha channel)

---

## AI Generation Prompts

Use these with **Midjourney**, **Leonardo.ai**, **Stable Diffusion**, or **PixelLab**:

### Base Style Prompt
> pixel art, 16-bit, top-down RPG, dark void theme, transparent background, dark purple and cyan color palette, roguelike survivor game asset

### Player Characters (64×64px each)

**Voidwalker** (cyan accent #00e5ff):
> pixel art hooded mage character, top-down view, dark cloak, glowing cyan eyes, void energy weapon, 64x64 sprite, transparent background, dark fantasy

**Sentinel** (purple accent #bf5af2):
> pixel art armored knight character, top-down view, dark plate armor, glowing purple eyes, energy shield, 64x64 sprite, transparent background, dark fantasy

**Sharpshooter** (green accent #30d158):
> pixel art ranger character, top-down view, dark hood, glowing green eyes, energy bow, 64x64 sprite, transparent background, dark fantasy

*Generate 4 frames per class: idle1, idle2 (slight bob), walk1 (legs apart), walk2 (legs together), plus 1 hurt frame (white flash)*

### Enemies

| Sprite | Size | Prompt Keywords |
|--------|------|-----------------|
| Grunt | 48×48 | round blob creature, stubby legs, glowing red eyes, dark purple body |
| Swarmer | 32×32 | small flying triangular insect, orange eyes, dark wings |
| Brute | 72×72 | large blocky heavy creature, single red eye, cracked energy veins, massive fists |
| Ranged | 48×48 | floating hooded caster, purple energy orbs in hands, glowing purple eyes |
| Boss Charger | 112×112 | massive armored beast, horns, red energy seams, heavy claws, two red eyes |
| Boss Nova | 96×96 | geometric cosmic entity, rotating rings, purple and red energy orbs, single eye slit |

*Generate 2 frames per enemy (idle + slight animation variation)*

### Props

| Sprite | Size | Prompt Keywords |
|--------|------|-----------------|
| Crystal (small) | 40×40 | void crystal emerging from rock, cyan glow, triangular |
| Crystal (medium) | 52×52 | void crystal, medium, cyan glow |
| Crystal (large) | 64×64 | large void crystal, bright cyan glow |
| Dead Tree (small) | 64×64 | dead twisted tree, dark bark, purple glow at roots |
| Dead Tree (large) | 80×80 | large dead tree, gnarled branches, purple root glow |
| Ruin Pillar (small) | 48×48 | broken stone pillar, cyan rune markings |
| Ruin Pillar (large) | 64×64 | tall broken pillar, glowing cyan runes |
| Void Vent | 48×48 | dark floor vent, purple energy emanating |
| Bones Pile | 32×32 | pile of bones with skull, top-down view |

### XP Gems

| Sprite | Size | Prompt Keywords |
|--------|------|-----------------|
| Small | 24×24 | small cyan diamond gem, glowing, pickup item |
| Medium | 32×32 | medium cyan diamond gem, glowing, pickup item |
| Large | 40×40 | large cyan diamond gem, bright glow, pickup item |

### Ground Tile

| Sprite | Size | Notes |
|--------|------|-------|
| Ground | 256×256 | Must tile seamlessly! Dark void terrain, subtle grid lines, gravel texture |

> seamless tileable dark terrain texture, pixel art, void dimension floor, subtle grid, dark blue-gray (#0f1923), gravel details

### Particles (16×16 each)

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

1. **PixelLab** (pixellab.ai) — Best for game pixel art, understands sprite sheets
2. **Leonardo.ai** — Good quality, free tier available
3. **Stable Diffusion + PixelArt LoRA** — Free, local, most control
4. **Aseprite** ($20) — Industry standard pixel art editor for cleanup/animation
5. **Piskel** (free) — Browser-based pixel art editor
6. **free-tex-packer** (free) — Pack individual sprites into a spritesheet

## Tips

- Generate at 2× size (e.g., 128×128 for 64×64 sprites) then downscale for crispness
- Use transparent backgrounds (PNG alpha)
- Keep a consistent light source direction (top-left)
- Test one sprite first to nail the style before batch generating
- The ground tile MUST be seamlessly tileable
