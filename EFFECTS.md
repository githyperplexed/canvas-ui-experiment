# Canvas UI Composite — Effect Timeline

A running log of the [canvas-ui](https://canvasui.dev) effects composited into the music player
scene, in the order each entered the project.

## Final Composition

- **Always on (6):** HexFloat, Blaze, Liquid, GlassObject, FlameWrap, GlyphRain
- **While playing (+1):** Laser
- **Per-song art, one at a time (+3):** VHS (Midnight Static), RetroDither (Sundowner), Droplets (Taillights)

Up to 8 effects running simultaneously, 10 in rotation. Supporting systems: a 3-song looping
playlist engine with working transport, a tweened accent-color system that sweeps every effect
purple → amber → blue per track, and a per-song `artEffect` field giving each track a signature
art treatment. Song changes crossfade the whole art stack (image, accent wash, and effect
canvas) via a keyed 800 ms fade instead of an instant swap — the outgoing block freezes
reactively, so the old song's art holds during its fade.

## Timeline

### 1. Liquid

The first component ever pulled — it validated the whole shadcn-registry workflow on day one.
Demo'd briefly, then benched, and its real story is that it failed invisibly three times
mid-project before becoming the final triumph: the last effect fixed, now swirling
accent-colored fluid trails behind the glass card, stirred by the cursor from anywhere on the
page. Trail cores saturate to white and decay back through the accent, matching the demo look.

### 2. FlameWrap

The first real composite piece: flames licking off the music card's silhouette in the live
accent color. Also produced the first "effects inside 3D transforms" fix — measuring in layout
space (`offset*`) instead of screen space (`getBoundingClientRect`) — a pattern later applied
across half the library.

### 3. Blaze

"Blaze the page": full-viewport sparks and smoke. Later demoted-but-improved during the
performance crisis into an isolated childless background plane with zero content-capture cost —
sparks rising behind the glass scene instead of wrapping it.

### 4. GlassObject

The engineering centerpiece. The component was extended with a CSS3D projection layer so the
live DOM card rides the floating glass slab — bobbing, rocking, drag-to-orbit — in perfect
lockstep, sharing one float group and one camera with the WebGL mesh. Includes pixel-exact
shape matching (compensating for bevel geometry growing the fitted bounds) and custom pointer
routing: events that don't touch a `pointer-events-auto` element are re-dispatched to the orbit
canvas, so buttons work while everything else drags.

### 5. HexFloat

The background: giant matte-black hex tiles on a tilted plane, drifting lazily, with soft rim
shine. The layer is oversized past the viewport so the tilt never reveals the plane's edges.

### 6. Laser

The wanderer. Tried as a laser progress bar (gaining custom `anchor`, `envelope`, and `cutoff`
options along the way), tried pinned to the bottom of the screen, and finally found its home as
the small accent line under "Up next" — a tapered gray shard while paused that ignites into a
full beam with rising smoke when playback starts.

### 7. VHS

Applied to the album art, initially underwhelming, benched during the image wars — then revived
with a direct-image pipeline plus accent colorize as Midnight Static's signature: purple duotone
tape with wave, jitter, crease band, head-switching noise, chromatic bleed, scanlines, and CRT
barrel curvature.

### 8. GlyphRain

The one that just worked, first try: oversized matrix glyphs (56px cells) raining behind the
card's UI content on a negative-z layer, dimmed to an ambient texture, re-coloring per song. Its
architecture — self-generated visuals, single-pass, dark-friendly, input-optional — became the
profile for predicting which catalog effects would work.

### 9. RetroDither

First effect to receive the direct-image-texture pattern — the fix that beat the capture bug.
Benched for a pure-CSS colorize for a while, then returned as Sundowner's treatment: amber
retro-dithered palm trees, 3px Bayer pixels, light scanlines.

### 10. Droplets

Invisible on arrival, and the effect that cracked the case: debugging it produced the
`standalone` discovery. Ended with the best glow-up of the project — genuine refraction, with
rain drops bending and magnifying Taillights' already-rain-blurred traffic photo. The effect and
the image tell the same story.

## Dead Ends & Major Issues

### The Great Capture Mystery (the season-long villain)

Effects kept silently showing nothing: Liquid three separate times, Droplets, and images
vanishing inside VHS. Root cause, found via one console one-liner: the browser **has** the
experimental HTML-in-canvas capture API (`drawElementImage`) — but (a) it cannot rasterize
raster images, and (b) effects used as empty overlays were dutifully rendering the
refraction/blend of a captured empty div. Two fixes became standard kit:

- **Direct-image texture pattern** — photos are decoded, optionally colorized, cover-fit onto an
  offscreen canvas, and uploaded straight as the content texture, bypassing capture entirely.
- **`standalone` option** — overlay mode forces the shader's self-lit branch instead of the
  content branch.

These unlocked VHS, RetroDither, Droplets, and finally Liquid.

### The inert-`$effect` library bug

Every component updated its renderer with `instance?.setOptions({ ...options })` — but
`instance` is assigned asynchronously, and optional chaining short-circuits before evaluating
arguments, so the effect's first run tracked no dependencies and went permanently inert. No
component ever accepted live prop updates until the patch (read props into a variable before the
optional call) was applied across every copy. A legitimate upstream find.

### Magnify

Worked, but re-captured the entire animated page into a texture and regenerated mipmaps every
frame — tanked the GPU. Scoping it to the card didn't fit the desired interaction, so it was
scrapped from the live composition. (The lesson generalizes: the lens is fine over static
content, where the recapture cost is a one-time price — just not over a page that animates
every frame.)

### Peel

The real effect can only sheet captured content, which can't represent the live interactive
card. A native CSS peel-up reveal was built instead — and died to the house rule: **only genuine
registry effects count**. The same rule removed the custom DecryptText scramble transitions.

### Honorable-mention gremlins

- `CSS3DObject` force-sets `pointer-events: auto` on its element, silently breaking drag-through.
- A component's inline `position: relative` overrode an `absolute` utility class, collapsing a
  laser overlay to zero height.
- Effect canvases overflowing scroll containers produced phantom scrollbars (fixed with
  page-level `overflow-hidden` and careful overlay sizing).
- WebGL context exhaustion from HMR churn: Chrome caps ~16 live contexts and silently kills the
  oldest — hard reloads clear the ghosts.
