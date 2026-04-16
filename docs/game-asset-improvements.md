# Incredible Basketball Game Asset Upgrade Plan

This plan is focused on making the game feel premium, competitive, and culturally respectful.

## 1) Visual Identity: Bold + Authentic

- Build 2–3 art directions before production:
  - **Broadcast Realism** (TV-grade overlays, arena lights, player cards).
  - **Street Energy** (high contrast, mural textures, dynamic typography).
  - **Heritage Futurism** (modern UI with subtle Indigenous-inspired geometric motifs).
- If using Native-inspired references, avoid generic stereotypes and collaborate with specific tribal artists for approved patterns, symbols, and color stories.

## 2) Core Asset Quality Standards

- Define a strict asset bible:
  - Texture sizes (UI: 2x/3x export rules).
  - Color pipeline (sRGB, contrast checks).
  - Typography scale (H1–caption with line-height and spacing).
  - Icon style consistency (stroke width, corner radius, grid).
- Replace mixed-quality images with one visual style per screen category.

## 3) Basketball-First Experience

- Upgrade key basketball assets:
  - Team logos with clean SVG masters.
  - Jersey sets (home/away/alternate) with readable numbers.
  - Arena backgrounds by league tier (small gym → major arena).
  - Match moments pack (dunks, blocks, clutch 3PT, timeout, buzzer beater).
- Add stat-driven VFX cues:
  - “Hot streak” flame/glow treatment.
  - “Defensive lockdown” shield/ice treatment.

## 4) UI Polish That Feels AAA

- Build a complete HUD kit:
  - Score bug, shot clock, possession arrow, quarter transitions.
  - Momentum bar + crowd intensity meter.
  - End-of-quarter recap cards with animated stat deltas.
- Use motion hierarchy:
  - 120–180ms for micro interactions.
  - 250–350ms for panel transitions.
  - Easing presets shared across app.

## 5) Audio-Visual Cohesion

- Pair visuals with layered audio events:
  - Net swish, rim hit variants, sneaker squeaks, crowd ramps.
  - Arena music stingers by context (timeout, run, final minute).
- Sync VFX to SFX timing so every big play lands with impact.

## 6) Cultural Respect + Regional Flavor

- For Native-themed or region-inspired content:
  - Use specific nation/tribe consultation (not pan-Indigenous mashups).
  - Include artist credit and licensing metadata per asset.
  - Add optional codex/lore cards that explain origins respectfully.
- Keep player customization broad and inclusive (skin tones, hairstyles, face structures).

## 7) Production Workflow (Fast + Safe)

- Create an `assets-manifest.json` with:
  - ID, type, source, license, owner, revision, export targets.
- Add CI checks for:
  - Missing files, oversized images, and non-optimized PNGs.
- Use naming convention:
  - `ui_`, `arena_`, `team_`, `fx_`, `audio_` prefixes.

## 8) Priority Roadmap (What to Do First)

### Sprint 1 (High Impact)
- Replace home/select-team backgrounds with unified art direction.
- Ship upgraded scoreboard HUD.
- Standardize logo and jersey packs for all teams.

### Sprint 2 (Perceived Quality)
- Add match event VFX/SFX package.
- Add quarter recap animations and momentum meter.
- Improve player card art and roster portraits.

### Sprint 3 (Differentiation)
- Launch culturally curated arena themes (with approvals).
- Add collectible cosmetic packs (court skins, ball skins, banners).
- Introduce seasonal visual updates.

## 9) Success Metrics

- +15% session length in match-board flows.
- +20% retention on users who complete first full game.
- Higher NPS feedback on “visual quality” and “game feel.”

---

If you want, this can be converted into a concrete implementation backlog mapped to this repository structure (`public/`, `app/`, `components/`, and `styles/`) with asset-by-asset priorities.
