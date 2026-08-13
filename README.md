# canvas-ui-experiment — the burning music player

A single-page WebGL composition: a live, working music player riding a floating
glass slab, wrapped in flames, over drifting hex tiles, rising sparks, and
cursor-stirred fluid — built entirely from effects pulled from the
[canvasui.dev](https://canvasui.dev) shadcn registry.

Up to 8 effects run simultaneously (10 in rotation), all tinted live by a
per-song accent color that sweeps purple → amber → blue as the playlist
advances. See [EFFECTS.md](EFFECTS.md) for the full composition breakdown and
the engineering log.

**[Live demo](https://canvas-ui.hyperplexed.io)** ·
**[Video](https://youtu.be/37wy90RnATM)**

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5, runes mode)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- [Three.js](https://threejs.org) (the registry effects render through it)
- TypeScript, strict mode
- [Bun](https://bun.sh) as package manager

## Developing

```sh
bun install
bun run dev
```

The composition is fully live: transport controls work, songs loop, seeking
works, and dragging anywhere outside the buttons orbits the glass slab.

## Checks

```sh
bun run check   # svelte-check
bun run lint    # prettier
```

## Building

```sh
bun run build
bun run preview
```

The adapter is configured inline in [vite.config.ts](vite.config.ts).

## Project structure

```
src/
  routes/+page.svelte          the composition — background layers + the glass scene
  lib/player.svelte.ts         playlist engine, accent-color tween, song data
  lib/utilities/
    cn.ts                      Tailwind class composition (clsx + tailwind-merge)
    color.ts                   accent color math: rgbCss, soften, deepen, lerpRgb
  lib/components/
    MusicPlayer.svelte         the card shell: accent vars, playback clock, layout
    player/
      AlbumArt.svelte          crossfading art stack + per-song effect treatments
      SeekBar.svelte           progress bar, seeking, time readouts
      Transport.svelte         prev / play-pause / next
      AccentLine.svelte        the accent line that ignites into the laser
    canvasui/                  effects from the canvasui.dev registry
      HexFloat.svelte            background hex tiles
      Blaze.svelte               rising sparks and smoke
      Liquid.svelte              cursor-stirred fluid trails
      GlassObject.svelte         the glass slab + CSS3D projection of the card
      FlameWrap.svelte           flames off the card silhouette
      GlyphRain.svelte           matrix glyphs behind the card UI
      Laser.svelte               the accent line's beam while playing
      VHS.svelte                 Midnight Static's album-art treatment
      RetroDither.svelte         Sundowner's album-art treatment
      Droplets.svelte            Taillights' album-art treatment
static/art/                    album art photos
```
