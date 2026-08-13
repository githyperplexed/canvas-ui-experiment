# Canvas UI Composite — Effect Timeline

A running log of the [canvas-ui](https://canvasui.dev) effects composited into the music player
scene, in the order each entered the project. Written as source material for the video script.

## Final Composition

- **Always on (6):** HexFloat, Blaze, Liquid, GlassObject, FlameWrap, GlyphRain
- **While playing (+1):** Laser
- **Per-song art, one at a time (+3):** VHS (Midnight Static), RetroDither (Sundowner), Droplets (Taillights)

Up to 8 effects running simultaneously, 10 in rotation. Supporting systems: a 3-song looping
playlist engine with working transport, a tweened accent-color system that sweeps every effect
purple → amber → blue per track, and a per-song `artEffect` field giving each track a signature
art treatment.

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

## Thumbnail Mode

Append `?thumbnail` to the URL (or `?thumbnail=form`) to swap the whole page for the thumbnail
shot: a landscape payment card ("Payment details" — card number, expiry/CVC, and a Pay $128.40
button that echoes the day-one receipt; 1200×600 base rendered at 1.5×) split across a white
center divider. A second variant, `?thumbnail=input`, strips the shot to three raw XXL inputs
(1600×220 each, 72px type — name, email, card number) stacked with no card behind them, split
the same way: plain left halves, and each right half individually flame-wrapped. A third,
`?thumbnail=full-form`, drops the split entirely: the whole burning payment card centered
alone, every input and the pay button aflame, no divider. A fourth, `?thumbnail=receipt`,
returns to the day-one receipt UI — no split, no flames, just the receipt captured onto
HexFloat's drifting hex tiles (the layer oversized past the viewport so the tilted plane never
shows its edges). A fifth, `?thumbnail=pass`, debuts a sibling UI — a Northwind Air boarding
pass (DLH → AUS, same passenger, same date, a confirmation-code input, and a CSS-gradient
barcode) — under the Magnify inspection lens at default settings: the scrapped effect's
redemption arc, viable here because the card is static so the every-frame recapture cost never
bites. (The pass briefly hung on Cloth — pulled fresh from the registry for the occasion,
arriving with the upstream inert-`$effect` bug and patched on arrival like every copy before
it — before Magnify won the slot back the same day. Cloth stays in the library, benched.) Two copies of the same form sit in identical px-sized
wrappers — one plain, one flame-wrapped — both absolutely pinned to the exact screen center
with the same position formula, each clipped to its own half of the viewport, with the divider
overlaid on the seam. The plain left half and the burning right half meet edge-on, reading as a
single form mid-transition — no glass, no playlist, no background layers. The live composition
is untouched and returns as soon as the query param is dropped. (An earlier iteration of this
mode showed the original receipt UI as two full cards; the split landscape form replaced it to
fill the 16:9 frame.)

The field grid's column gap straddles the card center so the divider lands between the
expiry/CVC pair — while the deliberately full-width rows (the card number and the pay button)
are each cut in half by the line: plain on the left, burning on the right.
Every input and the pay button on the burning side carries its own flames via a **childless
FlameWrap overlay** positioned over the control: FlameWrap's fire is generated
from rect geometry, not captured content, so an empty one still burns, and the outer FlameWrap
merely rasterizes the overlay's WebGL canvas — already proven to work (GlyphRain's canvas
captures fine inside the music card). No capture-inside-capture anywhere. The riskier
alternative — each input as a real child of its own FlameWrap, nesting a `drawElementImage`
capture inside the outer layoutsubtree — is still available via `CheckoutForm`'s
`inputFlames="nested"` prop, and would add the content-branch goodies (ember rim, melt, heat
distortion) if the browser allows it.

A note on capture sharpness: the DOM renders at native resolution in this mode (no 3D
projection), so screenshots are as crisp as the display. For extra density, zoom the browser
before capturing — every effect canvas re-renders at the higher device pixel ratio.

## Sequence Mode

Append `?sequence` to the URL for the recording stage used to capture the UI-build timelapse.
`BuildCard.svelte` is a static, effect-free copy of the music card (Midnight Static, paused,
purple accent) with sixteen individually revealable stages grouped into twelve scenes. The
card shell itself grows first — tiny square → full width → full height (700 ms eased
width/height transitions) — and then the contents arrive: header → chip → art → title →
progress → rule → transport → up next → shimmer. The
full layout always renders with unrevealed items `invisible`, so every position is reserved
from the first frame and nothing ever reflows — each item pops into its final resting spot
(260 ms scale/fade). The stage centers the card at half scale over a soft vignette (the card's
`#0a0a0a` face is a 4%-contrast ghost on raw black); a floating side panel offers play/pause,
a 0–3000 ms pacing slider (default 400 ms), and direct scene buttons for judging any frame.
Playback is one even rhythm — every reveal advances on the same beat, da-da-da, with no extra
pause at scene boundaries. Recording flow: pick a pace, press play, let OBS roll. (Two
earlier versions — file snapshots replayed via script for real HMR saves, then a
snapshot-per-step in-browser player — were replaced; swapping whole snapshots remounts the
DOM, which both re-triggered animations and allowed layout jumps.)

## Build Mode

Append `?build` to the URL for the walkthrough of the real composition, one major effect at a
time. It starts from the plain music player UI on flat black, then a vertical step nav on the
left adds each effect cumulatively — mostly the project-timeline order: FlameWrap → Blaze →
GlassObject → HexFloat → Rain → VHS → RetroDither → Triptych → Laser → GlyphRain → Liquid,
then two standalone capture scenes, Entrance and Counter. Several steps expand into
sub-scenes (clicking one plays it through; re-clicking replays it):

- **HexFloat**: "Wrapped" (the whole composition carried on the tiles at stock-ish settings),
  "Improved" (same wrap live-retuned to the background deployment's settings), "Tuning" (the
  tuning process animated — big sparkly tiles on a lightened backdrop, iridescence/grain
  tween away, float breathes in, then the backdrop darkens as Blaze and the player fade up),
  and "Background" (the real deployment).
- **Rain**: "Alone" (self-lit droplets over a blank backdrop), "Overlay" (the same over the
  full composition, nothing passing through it, like Blaze — a video-only detour), "Wrapped"
  (the whole scene as Droplets' captured children, genuinely refracted), "The photo" (the raw
  Taillights art in a white frame; three complete states stacked and crossfaded — raw, rained,
  then the in-player grayscale-plus-blue treatment), and "Album art" (the treatment in the
  card, absorbing what used to be a standalone Droplets step).
- **Triptych**: all three art treatments side by side via the direct-image pipeline, full
  height, white dividers — the in-card parameter sets verbatim.
- **Laser**: "Flat" (the raw 2D player on black, purple song, effects stripped) and "Zoomed"
  (a 3× glide that parks the laser line at the vertical center; hit play to ignite it). The
  zoomed card is itself a mirror copy wearing the CSS3D transforms — frozen AND flattened
  (rotation stripped from the matrices, keeping the signed diagonal + translation, so the
  parked card sits perfectly still and face-on to the screen) — while the real 3D player
  (slab + fully dressed card, which is also the transform source) travels underneath in
  framing lockstep at opacity 0. Both are the same projection under the same framing classes
  and transition string, so every hand-off is pixel-exact: after 14 s parked, both layers
  ride home to identity over 4 s on the long-tail curve while the flat pose peels back into
  the live bobbing attitude (a component-wise matrix lerp — safe, the delta is a few degrees)
  over the ride's first 1.2 s; the moment the pose is fully live the real player fades in
  beneath the opaque mirror (the slab and flames materialize around the card, finishing
  1.8 s before touchdown, no crossfade dip on its face), Blaze + Hex begin rising
  immediately after, still mid-glide, and at touchdown the mirror fades out over the
  now-identical real card. The whole zoom stage mounts on BOTH laser subs (hidden on Flat)
  so the glass scene and its transform readback are warm before Zoomed is clicked — the
  fix for a flash where the card blinked out and faded back in on entry, caused by the
  mirror waiting ~a few frames for its first readback behind a 700 ms opacity transition
  (that transition now applies only to the touchdown fade-out; the readback gate is an
  instant pop).
- **Entrance**: one second of black, then the full 3D player (Blaze + glass + flames + all
  three art treatments, no hex, and no accent line/laser — the card's bottom block is dropped
  via the `accentLine` opt-out so "Up next" closes the card on its padding line) rides up from
  below the frame over 3 s on a long-tail curve while Blaze fades in over 2 s.
- **Counter**: black screen, "5/33" ticking up to 33/33 on an ease-out tween — the library
  tally as a closer.

The music player itself also gained a polish along the way: song changes now crossfade the
whole art stack (image, accent wash, and effect canvas) via a keyed 800 ms fade instead of an
instant swap, everywhere the card appears. Steps are clickable in any order; everything up to the selected step stays
on. The scene is fully live — the real player, transport, and orbit — so mid-step you can hit
play for the Laser, or skip songs to show each art treatment. The three art steps preselect
their song on click. `MusicPlayer` gained opt-out props (`glyphRain`, `laser`, `accentLine`,
`artEffects`) to make its internal effects toggleable — `accentLine` removes the small line
under "Up next" together with the laser that rides it, letting "Up next" close the card; the
live composition uses the defaults and is untouched. Pre-glass steps show the card at half scale on black; the GlassObject step is where
the card visibly mounts onto the slab — and it expands into intermediary sub-steps when
selected. "The shape" prefaces the rest: the slab's entire 3D model — one hand-written SVG
rounded rectangle — strokes itself in over three seconds, glides aside, the live bobbing slab
fades in beside it, the drawing dissolves as the slab glides to its resting spot, and
mid-flight the card UI fades onto it for a two-second tease before vanishing. Then "Glass
alone" (the effect renders its src asset, not your UI, so the player simply
vanishes) and "The math, live" (an invisible card-sized probe rides the slab so the
CSS3DRenderer emits its real per-frame output; the readout multiplies the object and view
matrices — the exact product the compositor computes from the nested CSS3D divs — and shows
it row/column-labeled beside the fov-derived CSS `perspective` focal length, churning with the
idle bob at rest and churning harder on orbit).
A third sub-step, "The sync", choreographs the punchline (middle-hill easing throughout): the
scene glides to a scaled-down spot up top, a DOM copy of the card fades in below it wearing
the live CSS3D transforms copied off the probe each frame — dancing in perfect sync with the
slab above — and after a three-second hold both layers glide back to full size and land
exactly on top of one another. Sub-steps auto-chain: selecting any one plays it through, then advances to
the next until the section's end. Clicking the parent returns to the final CSS3D-projection
lockstep — the moment the live math gets a real card to carry.

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
scrapped from the live composition. It later got a redemption arc as the thumbnail's
boarding-pass variant — where the inspected content is static and the recapture cost is moot —
losing the slot to the freshly-pulled Cloth for about an hour before winning it back.

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
- The thumbnail's 1500px landscape card was wider than its half-viewport flex pane, and flex
  items refuse to shrink below their content width by default (`min-width: auto`) — both panes
  ballooned to card width and shoved the center divider off-screen-center. Fixed with `min-w-0`.
- The split thumbnail's flamed card was sized in rem (Tailwind `w-375`) while the form inside
  was sized in px (`calc(1.25 * 1200px)`) — any rounding disagreement between the unit paths
  let the px form overflow FlameWrap's `overflow: auto` content wrapper by a pixel, spawning
  one scrollbar whose own thickness then overflowed the other axis (two phantom scrollbars),
  while the halves of the split drifted out of alignment because each side derived its position
  from a different box. Fixed by making the form fill 100% of identical px-sized wrappers and
  pinning both copies to the exact screen center with the same formula.
- WebGL context exhaustion from HMR churn: Chrome caps ~16 live contexts and silently kills the
  oldest — hard reloads clear the ghosts.
