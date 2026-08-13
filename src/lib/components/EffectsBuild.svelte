<script lang="ts">
	import { cubicInOut, cubicOut } from "svelte/easing";
	import { Tween } from "svelte/motion";
	import { fade } from "svelte/transition";
	import Blaze from "$lib/components/canvasui/Blaze.svelte";
	import Droplets from "$lib/components/canvasui/Droplets.svelte";
	import FlameWrap from "$lib/components/canvasui/FlameWrap.svelte";
	import GlassObject from "$lib/components/canvasui/GlassObject.svelte";
	import GlyphRain from "$lib/components/canvasui/GlyphRain.svelte";
	import HexFloat from "$lib/components/canvasui/HexFloat.svelte";
	import Liquid from "$lib/components/canvasui/Liquid.svelte";
	import Magnify from "$lib/components/canvasui/Magnify.svelte";
	import RetroDither from "$lib/components/canvasui/RetroDither.svelte";
	import VHS from "$lib/components/canvasui/VHS.svelte";
	import MusicPlayer from "$lib/components/MusicPlayer.svelte";
	import { deepen, player, rgbCss, soften, SONGS } from "$lib/player.svelte";
	import { cn } from "$lib/utils";

	// The walkthrough of the real composition, one major effect at a time.
	// Mostly the order each effect entered the project; Droplets' album-art
	// treatment lives as the Rain step's last sub rather than its own step,
	// GlyphRain and Laser follow, and Liquid lands last as the final triumph.
	// Steps are cumulative: selecting a step shows everything up to and
	// including it. A step with `subs` expands when selected: its sub-steps
	// show intermediary or alternate deployments, while the parent itself
	// shows the final result.
	interface Step {
		label: string;
		subs?: { key: string; label: string }[];
	}

	const STEPS: Step[] = [
		{ label: "Player UI" },
		{ label: "FlameWrap" },
		{ label: "Blaze" },
		{
			label: "GlassObject",
			subs: [
				{ key: "glass-shape", label: "The shape" },
				{ key: "glass-alone", label: "Glass alone" },
				{ key: "glass-math", label: "The math, live" },
				{ key: "glass-sync", label: "The sync" }
			]
		},
		{
			label: "HexFloat",
			subs: [
				{ key: "hex-wrapped", label: "Wrapped" },
				{ key: "hex-tuned", label: "Improved" },
				{ key: "hex-tune", label: "Tuning" },
				{ key: "hex-background", label: "Background" }
			]
		},
		{
			label: "Rain",
			subs: [
				{ key: "rain-alone", label: "Alone" },
				{ key: "rain-overlay", label: "Overlay" },
				{ key: "rain-zoom", label: "Close up" },
				{ key: "rain-glyph", label: "Glyphs" },
				{ key: "rain-wrapped", label: "Wrapped" },
				{ key: "rain-photo", label: "The photo" },
				{ key: "rain-art", label: "Album art" }
			]
		},
		{ label: "VHS" },
		{ label: "RetroDither" },
		{ label: "Triptych" },
		{
			label: "Laser",
			subs: [
				{ key: "laser-flat", label: "Flat" },
				{ key: "laser-zoom", label: "Zoomed" }
			]
		},
		{ label: "GlyphRain" },
		{ label: "Liquid" },
		{ label: "Entrance" },
		{ label: "Counter" },
		{ label: "No." },
		{ label: "Thumbnail" }
	];

	let step = $state(0);
	let sub = $state<string | null>(null);
	// Bumped on every sub-step click — the scene $effects read it so that
	// re-clicking the CURRENT sub-step replays its choreography from the
	// start (state alone wouldn't change, so nothing would re-run).
	let run = $state(0);
	const on = (i: number) => step >= i;

	// The art-treatment steps jump the player to their song so the effect is
	// immediately visible: VHS → Midnight Static, RetroDither → Sundowner
	// (Droplets → Taillights happens via the rain-art sub-step).
	const SONG_FOR_STEP: Record<number, number> = { 6: 0, 7: 1 };

	function select(i: number) {
		if (i === 12) entranceIn = false;
		step = i;
		sub = null;
		run += 1;
		const song = SONG_FOR_STEP[i];
		if (song !== undefined) player.goTo(song);
	}

	// Phases reset BEFORE the sub renders — the scene $effects also reset
	// them, but effects run after render, so without this a re-entered scene
	// mounts one frame in its previous run's final phase and visibly animates
	// back to the start (e.g. the shape drawing while sliding in from the
	// left).
	function selectSub(key: string) {
		if (key === "glass-shape") shapePhase = "draw";
		if (key === "glass-sync") syncPhase = "split";
		if (key === "hex-tune") resetHexTune();
		if (key === "rain-photo") photoPhase = "photo";
		if (key === "rain-zoom") rainZoomPhase = "live";
		if (key === "rain-glyph") rainGlyphPhase = "start";
		if (key === "rain-art") player.goTo(2);
		if (key === "laser-flat" || key === "laser-zoom") {
			player.goTo(0);
			// Flat resets the phase too: its scene mounts the (hidden) zoom
			// stage to keep every canvas warm, and a stale "landed"/"glow"
			// phase would leave hex + Blaze visible over the flat card.
			zoomPhase = "enter";
		}
		run += 1;
		sub = key;
	}

	// "Counter" closer: black screen, "N/33" ticking from 5 up to 33 —
	// quick out of the gate, easing to a stop (cubicOut on a tween, so the
	// per-tick interval stretches as it approaches 33).
	const countTween = new Tween(5, { duration: 3000, easing: cubicOut });

	$effect(() => {
		void run;
		if (step !== 13) return;
		void countTween.set(5, { duration: 0 });
		const id = setTimeout(() => void countTween.set(33, { duration: 3000, easing: cubicOut }), 600);
		return () => clearTimeout(id);
	});

	// "Entrance" scene: 1 s of black, then the 3D player (Blaze + glass +
	// flames + all three art treatments, no hex, no accent line/laser — "Up
	// next" closes the card) slides up from below the screen over 3 s on the
	// long-tail curve while Blaze fades in over 2 s.
	let entranceIn = $state(false);

	$effect(() => {
		void run;
		if (step !== 12) return;
		entranceIn = false;
		const id = setTimeout(() => (entranceIn = true), 1000);
		return () => clearTimeout(id);
	});

	// "The photo" sub-step: the raw Taillights art alone in a white-bordered
	// frame; after 3 s the droplets fade onto it in direct-image mode,
	// refracting the photo; after another 3 s the image fades to the final
	// grayscale-plus-blue treatment it wears in the player — the art
	// treatment shown being born.
	let photoPhase = $state<"photo" | "rain" | "tint">("photo");

	$effect(() => {
		void run;
		if (sub !== "rain-photo") return;
		photoPhase = "photo";
		const timers = [
			setTimeout(() => (photoPhase = "rain"), 3000),
			setTimeout(() => (photoPhase = "tint"), 7500)
		];
		return () => timers.forEach((timer) => clearTimeout(timer));
	});

	// Sub-steps chain: selecting one plays it through, then auto-advances.
	// The shape scene ends framed exactly like "The math, live", so it skips
	// "Glass alone" and hands off there directly; the last entry has no
	// chain and the sequence rests on it.
	const SUB_CHAIN: Record<string, { next: string; delay: number }> = {
		"glass-shape": { next: "glass-math", delay: 14300 },
		"glass-alone": { next: "glass-math", delay: 1500 },
		"glass-math": { next: "glass-sync", delay: 2000 }
	};

	$effect(() => {
		void run;
		if (sub === null) return;
		const chain = SUB_CHAIN[sub];
		if (!chain) return;
		const id = setTimeout(() => selectSub(chain.next), chain.delay);
		return () => clearTimeout(id);
	});

	// Nav visibility: pinned = always shown. Unpinned, the nav fades out
	// whenever the mouse leaves it — but the (invisible) panel stays
	// hoverable in place, so mousing back over it brings it back.
	let pinned = $state(true);

	const artEffects = $derived([
		...(on(6) ? (["vhs"] as const) : []),
		...(on(7) ? (["retro-dither"] as const) : []),
		...(on(6) || (step === 5 && sub === "rain-art") ? (["droplets"] as const) : [])
	]);

	// HexFloat's first two subs carry the whole composition on the tiles
	// (with the background hex layer removed so hex exists only as the
	// wrapper): "Wrapped" at stock settings, "Improved" with the tuned
	// background-deployment settings — one live instance, so switching
	// between them just retunes the options. The parent and "Background"
	// sub show the real deployment.
	const hexWrapped = $derived(step === 4 && (sub === "hex-wrapped" || sub === "hex-tuned"));

	// Both variants pin every value explicitly — setOptions merges rather
	// than resets, so 5.1 must state its values to undo 5.2's tuning when
	// switching back. 5.1 is stock-ish with bigger tiles, extra iridescence,
	// and a medium float.
	const hexWrapProps = $derived(
		sub === "hex-tuned"
			? { size: 320, float: 0.25, speed: 0.4, shine: 0.25, bloom: 0.1, iridescence: 0, grain: 0 }
			: { size: 240, float: 0.5, speed: 1, shine: 0.5, bloom: 0, iridescence: 1.5, grain: 0.8 }
	);

	// "Tuning" (hex-tune) choreography: the big tiles start with stock
	// iridescence/grain and no float; the sparkle drains away, then the
	// float breathes in, then the rest of the composition fades up over it,
	// all on live-tweened options — the tuning process itself, animated.
	//   raw:    full-screen hex, size 320, iridescence 1, grain 0.8, float 0,
	//           on a lightened backdrop for visibility.
	//   clean:  at 3 s, iridescence and grain tween to 0 (2 s).
	//   float:  at 8.5 s, float tweens 0 → 0.25 (2 s).
	//   reveal: at 13.5 s, Blaze and the floating player scene (mounted at 0
	//           opacity the whole time) fade in together (2 s) while the
	//           backdrop fades down to the composition black.
	let hexTunePhase = $state<"raw" | "clean" | "float" | "reveal">("raw");
	const iriTween = new Tween(1, { duration: 700, easing: cubicInOut });
	const grainTween = new Tween(0.8, { duration: 700, easing: cubicInOut });
	const floatTween = new Tween(0, { duration: 700, easing: cubicInOut });

	function resetHexTune() {
		hexTunePhase = "raw";
		void iriTween.set(1, { duration: 0 });
		void grainTween.set(0.8, { duration: 0 });
		void floatTween.set(0, { duration: 0 });
	}

	$effect(() => {
		void run;
		if (sub !== "hex-tune") return;
		resetHexTune();
		const timers = [
			setTimeout(() => {
				hexTunePhase = "clean";
				void iriTween.set(0, { duration: 2000 });
				void grainTween.set(0, { duration: 2000 });
			}, 3000),
			setTimeout(() => {
				hexTunePhase = "float";
				void floatTween.set(0.25, { duration: 2000 });
			}, 8500),
			setTimeout(() => (hexTunePhase = "reveal"), 13500)
		];
		return () => timers.forEach((timer) => clearTimeout(timer));
	});

	// The background hex layer's live options: tween-driven during the
	// tuning scene, the fixed tuned deployment everywhere else.
	const bgHexProps = $derived(
		step === 4 && sub === "hex-tune"
			? {
					size: 320,
					float: floatTween.current,
					speed: 0.4,
					shine: 0.25,
					bloom: 0.1,
					iridescence: iriTween.current,
					grain: grainTween.current
				}
			: { size: 320, float: 0.25, speed: 0.4, shine: 0.25, bloom: 0.1, iridescence: 0, grain: 0 }
	);

	// Wrapped modes put the scene inside an effect's capture, where fixed
	// elements resolve against the capture's overflow-auto content box
	// instead of the viewport — the hex layer's overscan (there to hide the
	// tilted plane's edges) would spill past it and cascade into both page
	// scrollbars, so it renders exact-fit whenever the scene is wrapped.
	const sceneWrapped = $derived(hexWrapped || (step === 5 && sub === "rain-wrapped"));

	// Fades Blaze + the player scene during the tuning scene's veil.
	const tuneFadeClass = $derived(
		cn(
			step === 4 && sub === "hex-tune" && "transition-opacity duration-[2000ms]",
			step === 4 && sub === "hex-tune" && hexTunePhase !== "reveal" && "opacity-0"
		)
	);

	const cardShape = `data:image/svg+xml;utf8,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960"><rect width="720" height="960" rx="32" fill="black"/></svg>'
	)}`;

	const glassProps = $derived({
		src: cardShape,
		ior: 1,
		roughness: 0,
		dispersion: 0,
		clearcoat: 0,
		tint: "#0a0a0a",
		tintDensity: 4,
		environmentIntensity: 0.35,
		yOffset: -0.35,
		depth: 0.04,
		bevel: 0.25,
		highlight: rgbCss(player.song.color)
	});

	// "The math, live" sub-step: an invisible card-sized probe rides the slab
	// as the projected content, so CSS3DRenderer writes its real output into
	// the DOM every frame — the object's matrix3d on the probe's wrapper, the
	// view matrix on the camera element above it, and the fov-derived
	// perspective on the renderer root. A rAF loop reads both matrices back
	// and multiplies them (exactly what the compositor does with the nested
	// divs), so the readout churns with the idle bob AND with orbiting.
	let probeEl = $state<HTMLDivElement>();
	let composite = $state<number[] | null>(null);
	let perspectivePx = $state<number | null>(null);
	let camTransform = $state("");
	let objTransform = $state("");

	function parseMatrix(transform: string): number[] | null {
		const match = /matrix3d\(([^)]+)\)/.exec(transform);
		return match ? match[1].split(",").map((v) => parseFloat(v)) : null;
	}

	$effect(() => {
		if (
			sub !== "glass-math" &&
			sub !== "glass-sync" &&
			sub !== "glass-shape" &&
			sub !== "laser-flat" &&
			sub !== "laser-zoom" &&
			sub !== "rain-zoom" &&
			sub !== "rain-glyph"
		) {
			composite = null;
			perspectivePx = null;
			return;
		}
		let raf = 0;
		const read = () => {
			const contentEl = probeEl?.parentElement;
			const cameraEl = contentEl?.parentElement;
			objTransform = contentEl?.style.transform ?? "";
			camTransform = cameraEl?.style.transform ?? "";
			{
				const objectValues = parseMatrix(objTransform);
				const viewValues = parseMatrix(camTransform);
				if (objectValues && viewValues) {
					// The flat sub keeps a rolling flattened pose so the zoomed
					// sub can freeze with zero delay on entry; the zoomed sub
					// locks it on arrival. The rain close-up rolls during its
					// live phase and locks when its zoom starts (see the
					// halted-bob block below).
					if (
						sub === "laser-flat" ||
						(sub === "rain-zoom" && rainZoomPhase === "live") ||
						((sub === "laser-zoom" || sub === "rain-zoom" || sub === "rain-glyph") &&
							frozen === null)
					) {
						frozen = { cam: flatten(viewValues), obj: flatten(objectValues) };
					}
					const product = new DOMMatrix(viewValues).multiply(new DOMMatrix(objectValues));
					composite = [
						product.m11,
						product.m12,
						product.m13,
						product.m14,
						product.m21,
						product.m22,
						product.m23,
						product.m24,
						product.m31,
						product.m32,
						product.m33,
						product.m34,
						product.m41,
						product.m42,
						product.m43,
						product.m44
					];
				}
			}
			const perspective = parseFloat(cameraEl?.parentElement?.style.perspective ?? "");
			if (!Number.isNaN(perspective)) perspectivePx = perspective;
			raf = requestAnimationFrame(read);
		};
		raf = requestAnimationFrame(read);
		return () => cancelAnimationFrame(raf);
	});

	// "The sync" sub-step choreography, with the double-helix repo's middle
	// hill — cubic-bezier(0.6, 0, 0.4, 1) — on every move:
	//   split:  from 4.2's framing, the scene glides up and scales down
	//           (3.4 s).
	//   reveal: immediately after, a DOM copy of the card fades in below
	//           (0.7 s), wearing the live CSS3D transforms copied off the
	//           probe each frame, so it dances in perfect sync with the slab.
	//   merge:  after a 6 s hold (the 3 s trimmed from the math scene's dwell
	//           moved here, keeping the total wait equivalent), both layers
	//           glide back to full size in unison (3.4 s) and land exactly
	//           on top of one another.
	let syncPhase = $state<"split" | "reveal" | "merge">("split");

	$effect(() => {
		void run;
		if (sub !== "glass-sync") return;
		syncPhase = "split";
		const reveal = setTimeout(() => (syncPhase = "reveal"), 3400);
		const merge = setTimeout(() => (syncPhase = "merge"), 3400 + 700 + 6000);
		return () => {
			clearTimeout(reveal);
			clearTimeout(merge);
		};
	});

	// "The shape" sub-step choreography — the preface: the slab's entire 3D
	// model is one hand-written SVG rounded rectangle. Timeline:
	//   draw:    the rect strokes itself in, centered (3 s), then holds
	//            0.75 s.
	//   shift:   it glides left (2.4 s).
	//   slab:    just before the glide lands, the live bobbing slab fades in
	//            on the right (0.7 s), scaled down slightly to match the
	//            drawing.
	//   card:    shortly after, the card UI fades onto the slab (0.7 s),
	//            riding the bob via the live copied transforms — drawing
	//            still on the left, slab still on the right.
	//   cardout: after 2 s the card fades back out (0.7 s).
	//   cross:   only then does the slab glide to its resting spot, easing
	//            back to full scene scale (3.4 s), while the drawing fades
	//            out.
	//   math:    1.5 s into the glide, the matrix readout fades in — landing
	//            on exactly "The math, live", which the chain skips straight
	//            to.
	const SHAPE_ORDER = ["draw", "shift", "slab", "card", "cardout", "cross", "math"] as const;
	type ShapePhase = (typeof SHAPE_ORDER)[number];
	let shapePhase = $state<ShapePhase>("draw");
	const shapeAt = (phase: ShapePhase) =>
		SHAPE_ORDER.indexOf(shapePhase) >= SHAPE_ORDER.indexOf(phase);

	$effect(() => {
		void run;
		if (sub !== "glass-shape") return;
		shapePhase = "draw";
		const timers = [
			setTimeout(() => (shapePhase = "shift"), 3750),
			setTimeout(() => (shapePhase = "slab"), 5900),
			setTimeout(() => (shapePhase = "card"), 7400),
			setTimeout(() => (shapePhase = "cardout"), 10100),
			setTimeout(() => (shapePhase = "cross"), 10800),
			setTimeout(() => (shapePhase = "math"), 12300)
		];
		return () => timers.forEach((timer) => clearTimeout(timer));
	});

	// One transition string shared verbatim by the slab wrapper and the card
	// mirror, applied inline so both are guaranteed the exact same curves.
	// Tailwind v4's translate-*/scale-* utilities set the native CSS
	// `translate`/`scale` properties, so those are what it targets —
	// transitioning `transform` would animate nothing.
	const MOVE_TRANSITION =
		"transition: translate 3400ms cubic-bezier(0.6, 0, 0.4, 1), scale 3400ms cubic-bezier(0.6, 0, 0.4, 1), opacity 700ms cubic-bezier(0.6, 0, 0.4, 1)";

	// The zoomed sub's ride home: translate/scale over 4 s on the middle
	// hill (opacity keeps the standard 700 ms crossfade).
	const RETURN_TRANSITION =
		"transition: translate 4000ms cubic-bezier(0.6, 0, 0.4, 1), scale 4000ms cubic-bezier(0.6, 0, 0.4, 1), opacity 700ms cubic-bezier(0.6, 0, 0.4, 1)";

	// "Zoomed" (10.2) choreography. The visible zoomed card IS a mirror copy
	// wearing the CSS3D transforms — held on a FLATTENED pose (rotation
	// stripped, so it sits perfectly still and face-on to the screen) —
	// while the real 3D player (slab + fully dressed card, which is also
	// the transform source) waits underneath in framing lockstep at
	// opacity 0. Both layers are the same projection under the same framing
	// classes and the same transition string, so every hand-off is
	// pixel-exact — no positional crossfade anywhere.
	//   enter:  one paint at identity framing (≈ the flat card's spot).
	//   hold:   the framing glides to zoomed (3.4 s, middle hill) — the
	//           mirror layer's scale 3 ≈ the old plain card's 1.5×, since
	//           the projected card sits at ~0.5× native — and parks for
	//           14 s (hit play to ignite the laser), the card held flat and
	//           still on the frozen pose.
	//   return: both layers ride home to identity over 4 s on the middle
	//           hill, while the flat pose tweens into the live bobbing
	//           attitude over the ride's first 1.2 s — the card peels off
	//           the screen into 3D as it departs.
	//   reveal: 1.2 s in — the pose is fully live, and the real 3D player
	//           fades in (1 s) beneath the opaque mirror card: the slab and
	//           flames materialize around it, done 1.8 s before touchdown,
	//           with no crossfade dip on the card face itself.
	//   glow:   immediately after the reveal completes, Blaze + Hex begin
	//           their 2 s fade up — still mid-glide.
	//   landed: touchdown — the mirror fades out over the now-identical
	//           real card.
	let zoomPhase = $state<"enter" | "hold" | "return" | "reveal" | "glow" | "landed">("enter");

	$effect(() => {
		void run;
		if (sub !== "laser-zoom") return;
		zoomPhase = "enter";
		frozen = null;
		void bobBlend.set(0, { duration: 0 });
		const timers = [
			// 50 ms: one painted frame at identity so the glide up animates.
			setTimeout(() => (zoomPhase = "hold"), 50),
			// 3.4 s glide + 14 s parked; the bob resumes over the ride's
			// first 1.2 s.
			setTimeout(() => {
				zoomPhase = "return";
				void bobBlend.set(1, { duration: 1200, easing: cubicInOut });
			}, 17450),
			// 1.2 s into the 4 s ride — flames and slab fade in over 1 s.
			setTimeout(() => (zoomPhase = "reveal"), 18650),
			// The reveal is done (1.8 s before touchdown): Blaze + Hex rise.
			setTimeout(() => (zoomPhase = "glow"), 19650),
			// Touchdown.
			setTimeout(() => (zoomPhase = "landed"), 21450)
		];
		return () => timers.forEach((timer) => clearTimeout(timer));
	});

	// The zoomed framing and its transition, shared verbatim by the mirror
	// and the real 3D player so the two travel as one (the sync-scene rule).
	const zoomFraming = $derived(zoomPhase === "hold" ? "translate-y-[-1270px] scale-[3]" : "");
	const zoomMove = $derived(
		zoomPhase === "enter" || zoomPhase === "hold" ? MOVE_TRANSITION : RETURN_TRANSITION
	);

	// The halted bob. `flatten` strips a matrix3d to its signed diagonal +
	// translation (the off-diagonal terms carry the rotation; the diagonal
	// signs carry the CSS3D y-flip convention, so they must survive), which
	// squares the card to the screen while keeping its projected position
	// and scale. The flat sub keeps `frozen` rolling every frame; the
	// zoomed sub locks it, so its card holds one flat pose — and the ride
	// home lerps it component-wise back to the live matrices (safe: the
	// delta is a few degrees of bob), completing exactly when the real
	// player starts fading in, so from the reveal onward everything is the
	// one live projection. When `frozen` hasn't landed yet, the deriveds
	// flatten the live values on the fly — same pose modulo a frame of bob
	// drift — so there is never a flash of the unfrozen card.
	let frozen = $state<{ cam: number[]; obj: number[] } | null>(null);
	const bobBlend = new Tween(0, { duration: 0 });

	function flatten(values: number[]): number[] {
		return values.map((v, i) => (i === 0 || i === 5 || i === 10 || i >= 12 ? v : 0));
	}

	function splitTransform(transform: string) {
		const match = /^(.*?)matrix3d\(([^)]+)\)(.*)$/.exec(transform);
		if (!match) return null;
		return {
			prefix: match[1],
			values: match[2].split(",").map((v) => parseFloat(v)),
			suffix: match[3]
		};
	}

	function blendTransform(transform: string, from: number[] | null, t: number) {
		const live = splitTransform(transform);
		if (!live) return transform;
		const start = from ?? flatten(live.values);
		const values = live.values.map((v, i) => start[i] + (v - start[i]) * t);
		return `${live.prefix}matrix3d(${values.join(",")})${live.suffix}`;
	}

	const zoomCam = $derived(blendTransform(camTransform, frozen?.cam ?? null, bobBlend.current));
	const zoomObj = $derived(blendTransform(objTransform, frozen?.obj ?? null, bobBlend.current));

	// "Close up" (6.3) choreography — the laser-zoom trick pointed the other
	// way. Starts EXACTLY as 6.2 (it renders through the default scene
	// branch, so nothing remounts on the click — the rain, tiles, and Blaze
	// just keep running) while the probe's readback rolls a flattened pose.
	//   live: 0 – 3 s — pure 6.2, mirror hidden, real card riding the slab.
	//   zoom: at 3 s the mirror pops in at the live pose (pixel-identical;
	//         the real card goes invisible in the same frame) and flies over
	//         3 s on the middle hill to dead center at 95% of screen height —
	//         the target is computed from the card's measured screen rect,
	//         so it lands exactly centered on any viewport — while the pose
	//         blends live → flat (the card stills and squares to the screen)
	//         and the rain overlay, hex, Blaze, and slab all fade out over
	//         the same 3 s.
	//   bare: at 6 s the card-colored cover fades in (1 s) over the content,
	//         leaving only the rounded rectangle and its flames.
	let rainZoomPhase = $state<"live" | "zoom" | "bare">("live");
	let rainZoomTo = $state<{ x: number; y: number; k: number } | null>(null);

	const RAIN_ZOOM_TRANSITION =
		"transition: translate 3000ms cubic-bezier(0.6, 0, 0.4, 1), scale 3000ms cubic-bezier(0.6, 0, 0.4, 1)";

	// The hidden mirror card's element — during the live phase the mirror
	// wears the FLAT pose (it's invisible, so nothing shows), purely so this
	// element's real rendered rect can be measured at the zoom mark. No
	// transform-chain math, no model of the CSS3D anatomy: the browser
	// reports exactly where the flat card sits at layer identity, and the
	// zoom aims from that.
	let rainZoomCardEl = $state<HTMLDivElement>();

	$effect(() => {
		void run;
		if (sub !== "rain-zoom") return;
		rainZoomPhase = "live";
		rainZoomTo = null;
		frozen = null;
		// Flat during the live phase — see rainZoomCardEl.
		void bobBlend.set(0, { duration: 0 });
		const timers = [
			setTimeout(() => {
				// Aim the layer so the flat card's center lands on the
				// viewport center at 95% of screen height (translate applies
				// before scale-about-center, hence the -center × k).
				const rect = rainZoomCardEl?.getBoundingClientRect();
				if (rect && rect.height > 0) {
					const k = (window.innerHeight * 0.95) / rect.height;
					const cx = rect.left + rect.width / 2 - window.innerWidth / 2;
					const cy = rect.top + rect.height / 2 - window.innerHeight / 2;
					rainZoomTo = { x: -cx * k, y: -cy * k, k };
				} else {
					rainZoomTo = { x: 0, y: 0, k: 1.05 };
				}
				// Snap to the live pose for the pop-in (matching the real
				// card exactly), then blend to flat over the flight.
				void bobBlend.set(1, { duration: 0 });
				void bobBlend.set(0, { duration: 3000, easing: cubicInOut });
				rainZoomPhase = "zoom";
			}, 3000),
			setTimeout(() => (rainZoomPhase = "bare"), 6000)
		];
		return () => timers.forEach((timer) => clearTimeout(timer));
	});

	// "Glyphs" (6.4) choreography — picks up EXACTLY where the close-up
	// rests (same mirror DOM, so nothing remounts on the click: flames and
	// cover carry straight over). The card eases back to 80% of the
	// close-up framing, GlyphRain fades onto the bare face (a glyph layer
	// living INSIDE the cover), holds 3 s, then everything reverses: the
	// layer flies back to identity while the pose blends flat → live, the
	// cover fades off (the card content returns over the in-player glyph
	// layer), and hex, Blaze, and the slab fade back in — landing on the
	// default composition with GlyphRain integrated.
	//   start:  ≤150 ms — one painted frame at the close-up framing (and,
	//           on direct entry without 6.3, the framing is measured here).
	//   out:    ease to 80% framing (2 s, middle hill).
	//   glyph:  at 2.15 s — GlyphRain fades in over 2 s on the bare face.
	//   return: at 7.15 s (3 s after the fade completes) — 3 s flight home,
	//           blend flat → live, cover off, hex + Blaze fade in. The slab
	//           does NOT fade here: mid-blend the card isn't riding the
	//           projection yet, so a slab fading in under it would sit
	//           visibly out of sync.
	//   glass:  at 10.25 s — 100 ms AFTER nominal touchdown, so the layer's
	//           CSS transition (which starts a paint later than the JS
	//           blend tween) has definitely finished — the slab fades in
	//           (1 s) beneath the opaque, now live-synced mirror card. The
	//           same slack also cures a flash where the real card popped
	//           visible while the mirror was still a frame or two from
	//           identity, double-imaging the UI.
	//   landed: at 11.35 s — the mirror fades out over the real card (which
	//           now runs glyphRain via the card snippet's sub override).
	let rainGlyphPhase = $state<"start" | "out" | "glyph" | "return" | "glass" | "landed">("start");

	const RAIN_GLYPH_OUT_TRANSITION =
		"transition: translate 2000ms cubic-bezier(0.6, 0, 0.4, 1), scale 2000ms cubic-bezier(0.6, 0, 0.4, 1)";

	$effect(() => {
		void run;
		if (sub !== "rain-glyph") return;
		rainGlyphPhase = "start";
		// Continuity from the close-up: `frozen` and the flat blend carry
		// over untouched; this reset only matters on replay or direct entry.
		void bobBlend.set(0, { duration: 0 });
		const timers = [
			setTimeout(() => {
				if (!rainZoomTo) {
					const rect = rainZoomCardEl?.getBoundingClientRect();
					if (rect && rect.height > 0) {
						const k = (window.innerHeight * 0.95) / rect.height;
						const cx = rect.left + rect.width / 2 - window.innerWidth / 2;
						const cy = rect.top + rect.height / 2 - window.innerHeight / 2;
						rainZoomTo = { x: -cx * k, y: -cy * k, k };
					}
				}
				rainGlyphPhase = "out";
			}, 150),
			setTimeout(() => (rainGlyphPhase = "glyph"), 2150),
			setTimeout(() => {
				rainGlyphPhase = "return";
				void bobBlend.set(1, { duration: 3000, easing: cubicInOut });
			}, 7150),
			setTimeout(() => (rainGlyphPhase = "glass"), 10250),
			setTimeout(() => (rainGlyphPhase = "landed"), 11350)
		];
		return () => timers.forEach((timer) => clearTimeout(timer));
	});

	// The rain stage's layer framing + transition, covering both subs. The
	// 80% framing scales the translate too, which keeps the card centered
	// (T = -k·(center offset) is linear in k).
	const rainStageFraming = $derived.by(() => {
		const f = rainZoomTo ?? { x: 0, y: 0, k: 1.05 };
		if (sub === "rain-glyph") {
			if (rainGlyphPhase === "start") return f;
			if (rainGlyphPhase === "out" || rainGlyphPhase === "glyph") {
				return { x: f.x * 0.8, y: f.y * 0.8, k: f.k * 0.8 };
			}
			return { x: 0, y: 0, k: 1 };
		}
		return rainZoomPhase !== "live" && rainZoomTo ? rainZoomTo : { x: 0, y: 0, k: 1 };
	});
	const rainStageMove = $derived.by(() => {
		if (sub === "rain-glyph") {
			if (rainGlyphPhase === "start") return "";
			if (rainGlyphPhase === "out" || rainGlyphPhase === "glyph") return RAIN_GLYPH_OUT_TRANSITION;
			return RAIN_ZOOM_TRANSITION;
		}
		return rainZoomPhase === "live" ? "" : RAIN_ZOOM_TRANSITION;
	});

	// Fades the composition out from under the close-up (and back in during
	// the glyph sub's return): applied to the hex and Blaze wrappers inside
	// scene() plus the rain overlay.
	const rainZoomFadeClass = $derived(
		cn(
			(sub === "rain-zoom" || sub === "rain-glyph") && "transition-opacity duration-[3000ms]",
			((sub === "rain-zoom" && rainZoomPhase !== "live") ||
				(sub === "rain-glyph" &&
					rainGlyphPhase !== "return" &&
					rainGlyphPhase !== "glass" &&
					rainGlyphPhase !== "landed")) &&
				"opacity-0"
		)
	);

	// The glass wrapper's own fade: out with everything else during the
	// close-up's zoom, but on the glyph sub's way home it waits for the
	// card to fully land and go live-synced, then fades in fast beneath it.
	const rainGlassFadeClass = $derived(
		cn(
			sub === "rain-zoom" && "transition-opacity duration-[3000ms]",
			sub === "rain-zoom" && rainZoomPhase !== "live" && "opacity-0",
			sub === "rain-glyph" && "transition-opacity duration-1000",
			sub === "rain-glyph" &&
				rainGlyphPhase !== "glass" &&
				rainGlyphPhase !== "landed" &&
				"opacity-0"
		)
	);

	// "Thumbnail" scene: the base image is drawn cover-fit onto a canvas
	// because HexFloat captures children via drawElementImage, which cannot
	// rasterize <img> elements (the capture villain) — canvases capture
	// fine (the direct-image pattern, done in-scene). The hex plane is
	// flat (tilt 0) and the layer exact-fit, so canvas cover = viewport
	// cover.
	let thumbCanvasEl = $state<HTMLCanvasElement>();

	$effect(() => {
		if (step !== 15 || !thumbCanvasEl) return;
		const canvas = thumbCanvasEl;
		const img = new Image();
		img.src = "/thm-no-overlay.png";
		let cancelled = false;
		void img.decode().then(() => {
			if (cancelled) return;
			const dpr = window.devicePixelRatio || 1;
			const w = canvas.offsetWidth;
			const h = canvas.offsetHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.scale(dpr, dpr);
			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, w, h);
			// Flat plane (tilt 0), exact-fit layer: a straight cover-fit of
			// the canvas is a cover-fit of the viewport.
			const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
			const dw = img.naturalWidth * s;
			const dh = img.naturalHeight * s;
			ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
		});
		return () => {
			cancelled = true;
		};
	});

	const glassWrapClass = $derived(
		cn(
			"h-screen w-full",
			(sub === "glass-alone" || sub === "glass-math") && "-translate-x-[13vw]",
			sub === "glass-sync" && syncPhase !== "merge" && "-translate-y-[22vh] scale-[0.55]",
			sub === "glass-shape" && [
				shapeAt("cross") ? "-translate-x-[13vw]" : "translate-x-[20vw] scale-[0.9]",
				shapeAt("slab") ? "opacity-100" : "opacity-0"
			]
		)
	);

	const mirrorClass = $derived(
		cn(
			"pointer-events-none fixed inset-0 z-30",
			sub === "glass-sync" && [
				syncPhase !== "merge" && "translate-y-[22vh] scale-[0.55]",
				syncPhase === "split" ? "opacity-0" : "opacity-100"
			],
			sub === "glass-shape" && [
				shapeAt("cross") ? "-translate-x-[13vw]" : "translate-x-[20vw] scale-[0.9]",
				shapeAt("card") && !shapeAt("cardout") ? "opacity-100" : "opacity-0"
			]
		)
	);

	const accent = $derived(player.accent.current);
	const smoke = $derived(accent.map((v) => v * 0.6) as [number, number, number]);

	let liquidLayer: HTMLDivElement | undefined = $state();

	// Same pointer mirroring as the live composition — see +page.svelte.
	function forwardToLiquid(event: PointerEvent) {
		const root = liquidLayer?.firstElementChild;
		if (!root) return;
		if (event.buttons !== 0) {
			root.dispatchEvent(new PointerEvent("pointercancel", { pointerId: event.pointerId }));
			return;
		}
		root.dispatchEvent(
			new PointerEvent("pointermove", {
				pointerId: event.pointerId,
				clientX: event.clientX,
				clientY: event.clientY
			})
		);
	}
</script>

<svelte:window onpointermove={forwardToLiquid} />

{#snippet card()}
	<!-- The glyph sub integrates GlyphRain ahead of its official step so
	     its landing hands off to a real card that already runs it. -->
	{#if on(1)}
		<FlameWrap class="h-480 w-360" color={accent} radius={64} height={340} spread={16}>
			<MusicPlayer glyphRain={on(10) || sub === "rain-glyph"} laser={on(9)} {artEffects} />
		</FlameWrap>
	{:else}
		<MusicPlayer glyphRain={on(10) || sub === "rain-glyph"} laser={on(9)} {artEffects} />
	{/if}
{/snippet}

{#snippet scene()}
	{#if on(4) && !hexWrapped}
		<div
			class={cn(
				"fixed -z-10",
				sceneWrapped ? "inset-0" : "-inset-x-1/4 -top-1/4 bottom-0",
				rainZoomFadeClass
			)}
		>
			<HexFloat class="h-full w-full" {...bgHexProps}>
				<!-- The captured backdrop IS the tile-face color. During the
				     tuning scene it lightens for visibility, then fades to the
				     composition black in step with the player's reveal. -->
				<div
					class={cn(
						"h-full w-full transition-colors duration-[2000ms]",
						step === 4 && sub === "hex-tune" && hexTunePhase !== "reveal"
							? "bg-neutral-800"
							: "bg-neutral-950"
					)}
				></div>
			</HexFloat>
		</div>
	{/if}

	{#if on(2)}
		<div class={cn("fixed inset-0 -z-10", tuneFadeClass, rainZoomFadeClass)}>
			<Blaze
				class="h-full w-full"
				layers={3}
				distortion={0}
				sparkColor={accent}
				smokeColor={smoke}
			/>
		</div>
	{/if}

	{#if on(11)}
		<div bind:this={liquidLayer} class="pointer-events-none fixed inset-0 -z-10">
			<Liquid class="h-full w-full" standalone color={accent} />
		</div>
	{/if}

	{#if on(3)}
		{#if step === 3 && sub !== null}
			<!-- Both sub-steps share this one live instance so 4.1 → 4.2 is
		     seamless (no remount, no slab reset — only the readout fades).
		     "Glass alone": the effect renders its src asset, not your UI —
		     the player simply vanishes, leaving the bare slab (the probe is
		     invisible, so the visuals are identical). "The math, live": the
		     probe lets CSS3DRenderer emit its real per-frame output, and the
		     readout shows the live composite transform the card would get. -->
			<!-- The whole scene (canvas and all) is repositioned via CSS on this
		     wrapper — moving the slab inside the scene (xOffset) would take
		     it off the orbit axis and skew the perspective. -->
			<div class={glassWrapClass} style={MOVE_TRANSITION}>
				<GlassObject class="h-full w-full" {...glassProps}>
					<div bind:this={probeEl} class="invisible h-480 w-360"></div>
				</GlassObject>
			</div>
			{#if sub === "glass-shape"}
				<!-- The hand-written SVG rounded rectangle — the slab's entire 3D
			     model — stroking itself in, then gliding aside for the slab. -->
				<div
					class={cn(
						"pointer-events-none fixed inset-0 z-20 flex items-center justify-center",
						shapeAt("shift") && "-translate-x-[20vw]",
						shapeAt("cross") ? "opacity-0" : "opacity-100"
					)}
					style="transition:
					translate 2400ms cubic-bezier(0.6, 0, 0.4, 1),
					opacity 700ms cubic-bezier(0.6, 0, 0.4, 1)"
				>
					<svg class="h-[60vh]" viewBox="0 0 720 960" fill="none" aria-hidden="true">
						<rect
							class="shape-draw"
							x="2"
							y="2"
							width="716"
							height="956"
							rx="32"
							pathLength="1"
							stroke="rgba(255, 255, 255, 0.6)"
							stroke-width="4"
						/>
					</svg>
				</div>
			{/if}
			{#if sub === "glass-sync" || sub === "glass-shape"}
				<!-- The DOM card wearing the scene's live math: the copied CSS3D
			     camera + object transforms replay inside a same-sized fixed
			     layer, so wherever this layer goes, the card keeps dancing
			     with the slab. Its container mirrors the slab container's
			     translate classes and transition exactly, so the two travel
			     as one. Tailwind v4's translate-*/scale-* utilities set the
			     native CSS `translate`/`scale` properties (not `transform`),
			     so those are what the transitions target — transitioning
			     `transform` animates nothing and the layer snaps. -->
				<div class={mirrorClass} style="perspective: {perspectivePx}px; {MOVE_TRANSITION}">
					<div
						class="absolute inset-0"
						style="transform-style: preserve-3d; transform: {camTransform}"
					>
						<div class="absolute" style="transform: {objTransform}">
							{@render card()}
						</div>
					</div>
				</div>
			{/if}
		{:else}
			<!-- The probe wrapper doubles as the close-up's transform source;
			     during that sub's zoom the real card goes invisible (the
			     mirror takes over in the same frame) while CSS3D keeps
			     emitting transforms for it. -->
			<div class={cn(tuneFadeClass, rainGlassFadeClass)}>
				<GlassObject class="h-screen w-full" {...glassProps}>
					<div
						bind:this={probeEl}
						class={cn(
							"h-480 w-360",
							((sub === "rain-zoom" && rainZoomPhase !== "live") ||
								(sub === "rain-glyph" && rainGlyphPhase !== "landed")) &&
								"invisible"
						)}
					>
						{@render card()}
					</div>
				</GlassObject>
			</div>
		{/if}
	{:else}
		<!-- Pre-glass steps: the card at its native giant size, scaled to fit. -->
		<div class="flex h-screen items-center justify-center">
			<div class="scale-[0.5]">
				{@render card()}
			</div>
		</div>
	{/if}
{/snippet}

{#if step === 8}
	<!-- 9: the triptych — all three art treatments side by side via the
	     direct-image pipeline, each panel a third of the screen, white
	     dividers between. Same parameters as the in-card treatments. -->
	<div class="fixed inset-0 flex bg-black">
		<div class="relative h-full flex-1 overflow-clip">
			<VHS
				class="h-full w-full"
				image="/art/midnight-static.jpg"
				imageTint={rgbCss(SONGS[0].color)}
				speed={0.7}
				wave={1.5}
				jitter={0.8}
				crease={0.6}
				switching={0.4}
				switchingHeight={0.05}
				aberration={8}
				grain={0.2}
				scanlines={0.35}
				vignette={0.3}
				barrel={0.25}
			/>
		</div>
		<div class="w-4 shrink-0 bg-white"></div>
		<div class="relative h-full flex-1 overflow-clip">
			<RetroDither
				class="h-full w-full"
				image="/art/sundowner.jpg"
				pixelSize={6}
				levels={4}
				darkColor={deepen(SONGS[1].color)}
				lightColor={soften(SONGS[1].color)}
				colorize={0.85}
				baseStrength={1}
				strength={1}
				scanlines={0.15}
			/>
		</div>
		<div class="w-4 shrink-0 bg-white"></div>
		<div class="relative h-full flex-1 overflow-clip">
			<Droplets
				class="h-full w-full"
				interactive={false}
				image="/art/taillights.jpg"
				imageTint={rgbCss(SONGS[2].color)}
				intensity={0.55}
				scale={0.42}
				speed={0.6}
				fallSpeed={0.7}
				refraction={0.5}
			/>
		</div>
	</div>
{:else if step === 12}
	<!-- Entrance: black, then the 3D player rides up from off-bottom (3 s,
	     long-tail glide) while Blaze fades in beneath it (2 s). -->
	<div class="fixed inset-0 bg-black"></div>
	<div
		class={cn(
			"fixed inset-0 transition-opacity duration-[2000ms]",
			entranceIn ? "opacity-100" : "opacity-0"
		)}
	>
		<Blaze class="h-full w-full" layers={3} distortion={0} sparkColor={accent} smokeColor={smoke} />
	</div>
	<div
		class={entranceIn ? "translate-y-0" : "translate-y-[110vh]"}
		style="transition: translate 3000ms cubic-bezier(0.23, 1, 0.32, 1)"
	>
		<GlassObject class="h-screen w-full" {...glassProps}>
			<FlameWrap class="h-480 w-360" color={accent} radius={64} height={340} spread={16}>
				<MusicPlayer
					glyphRain={false}
					laser={false}
					accentLine={false}
					artEffects={["vhs", "retro-dither", "droplets"]}
				/>
			</FlameWrap>
		</GlassObject>
	</div>
{:else if step === 13}
	<!-- The closer: black screen, the library tally ticking up. -->
	<div class="fixed inset-0 flex items-center justify-center bg-black">
		<p
			class="text-8xl font-semibold text-white tabular-nums"
			style="font-family: 'Roboto Mono', monospace"
		>
			{Math.round(countTween.current)}/33
		</p>
	</div>
{:else if step === 14}
	<!-- Standalone: a giant "No." under the Magnify inspection lens at
	     default settings — the content is static, so the every-frame
	     recapture cost never bites (the boarding-pass rule). -->
	<div class="fixed inset-0">
		<Magnify class="h-full w-full">
			<div class="flex h-full w-full items-center justify-center bg-black">
				<p
					class="text-9xl text-white"
					style="font-family: 'Montserrat', sans-serif; font-weight: 600"
				>
					No.
				</p>
			</div>
		</Magnify>
	</div>
{:else if step === 15}
	<!-- Standalone: the thumbnail base image carried on the background hex
	     grid — FLAT (tilt pinned to 0, so no perspective magnification and
	     no need for edge overscan; the layer is exact-fit) — with the
	     card's glyph-rain deployment over the top. The image rides in as a
	     canvas child (see thumbCanvasEl). -->
	<div class="fixed inset-0 overflow-clip bg-black">
		<div class="absolute inset-0">
			<HexFloat class="h-full w-full" {...bgHexProps} tilt={0}>
				<canvas bind:this={thumbCanvasEl} class="h-full w-full"></canvas>
			</HexFloat>
		</div>
		<div class="pointer-events-none absolute inset-0 opacity-60">
			<GlyphRain
				class="h-full w-full"
				cell={64}
				color={SONGS[2].color}
				headColor={SONGS[2].color}
				glow={0.8}
				dim={0}
				light={0}
				relief={0}
				stir={0}
			/>
		</div>
	</div>
{:else if step === 9 && sub !== null}
	<!-- Laser subs. "Flat": the player flat and 2D on plain black (purple
	     song), no hex, no blaze, no glass, no flames. "Zoomed": the visible
	     card is a bare-MusicPlayer mirror wearing a frozen, FLATTENED CSS3D
	     pose (face-on and still while parked), while the real 3D player —
	     the transform source — travels underneath in framing lockstep at
	     opacity 0; after the 14 s hold both ride home over 4 s while the
	     flat pose peels back into the live bob, the real player fades in
	     beneath the opaque mirror early in the glide, Blaze + Hex rise
	     immediately after, and at touchdown the mirror fades out over the
	     now-identical card (see the zoomPhase choreography). Layers stack
	     by DOM order (no negative z — the black floor would cover it):
	     floor, hex, Blaze, 3D player, mirror. -->
	<div class="fixed inset-0 bg-black"></div>
	<!-- The zoom stage mounts for BOTH subs (hidden on Flat) so the glass
	     scene, its transform readback, and every canvas are already warm and
	     flowing when Zoomed is clicked — otherwise the mirror has no
	     transforms for its first frames and the card blinks. -->
	<div
		class={cn(
			"fixed -inset-x-1/4 -top-1/4 bottom-0 transition-opacity duration-[2000ms]",
			zoomPhase === "glow" || zoomPhase === "landed" ? "opacity-100" : "opacity-0"
		)}
	>
		<HexFloat class="h-full w-full" {...bgHexProps}>
			<div class="h-full w-full bg-neutral-950"></div>
		</HexFloat>
	</div>
	<div
		class={cn(
			"fixed inset-0 transition-opacity duration-[2000ms]",
			zoomPhase === "glow" || zoomPhase === "landed" ? "opacity-100" : "opacity-0"
		)}
	>
		<Blaze class="h-full w-full" layers={3} distortion={0} sparkColor={accent} smokeColor={smoke} />
	</div>
	<!-- The real 3D player: the fully dressed card (flames included)
		     riding the slab, and the source the mirror copies its transforms
		     from. Framing + transition shared verbatim with the mirror so
		     the two travel as one; the inner div carries the reveal fade so
		     opacity never fights the framing transition. -->
	<div class={cn("fixed inset-0", zoomFraming)} style={zoomMove}>
		<div
			class={cn(
				"h-full w-full transition-opacity duration-1000",
				zoomPhase === "reveal" || zoomPhase === "glow" || zoomPhase === "landed"
					? "opacity-100"
					: "opacity-0"
			)}
		>
			<GlassObject class="h-screen w-full" {...glassProps}>
				<div bind:this={probeEl} class="h-480 w-360">
					{@render card()}
				</div>
			</GlassObject>
		</div>
	</div>
	{#if sub !== "laser-zoom"}
		<div class="pointer-events-none fixed inset-0 flex items-center justify-center">
			<div class="scale-[0.5]" style={MOVE_TRANSITION}>
				<MusicPlayer glyphRain={false} {artEffects} />
			</div>
		</div>
	{:else}
		<!-- The mirror: the visible zoomed card, bare (no flames — those
		     arrive with the 3D player at the reveal), wearing the
		     frozen-then-blended camera + object transforms, which replay
		     inside this layer. It stays hidden until the first transform
		     readback lands so the card never paints untransformed — an
		     instant pop, NOT a fade: the opacity transition applies only to
		     the touchdown fade-out, or the readback gate re-triggers it as a
		     visible fade-in whenever the pipeline starts cold. At touchdown
		     it fades out over the pixel-identical real card (the laser/art
		     canvases differ between instances, but a 700 ms dissolve between
		     two runs of the same noisy shader just reads as the effect
		     animating). -->
		<div
			class={cn("pointer-events-none fixed inset-0 z-30", zoomFraming)}
			style="perspective: {perspectivePx}px; {zoomMove}"
		>
			<div
				class={cn(
					"absolute inset-0",
					zoomPhase === "landed"
						? "opacity-0 transition-opacity duration-700"
						: composite
							? "opacity-100"
							: "opacity-0"
				)}
				style="transform-style: preserve-3d; transform: {zoomCam}"
			>
				<div class="absolute" style="transform: {zoomObj}">
					<MusicPlayer glyphRain={false} {artEffects} />
				</div>
			</div>
		</div>
	{/if}
{:else if hexWrapped}
	<!-- 5.1/5.2: the ENTIRE page content rendered as HexFloat's captured
	     children — the whole composition carried on the tiles, background
	     hex layer removed. 5.1 runs stock settings; 5.2 the tuned ones. -->
	<div class="fixed inset-0 overflow-clip">
		<HexFloat class="h-full w-full" {...hexWrapProps}>
			{@render scene()}
		</HexFloat>
	</div>
{:else if step === 5 && sub === "rain-alone"}
	<!-- 6.1: the rain in isolation — its own plane over nothing but a blank
	     backdrop, lifted slightly off black so the self-lit drops read. -->
	<div class="fixed inset-0 bg-neutral-900"></div>
{:else if step === 5 && sub === "rain-photo"}
	<!-- 6.4: three complete states stacked and crossfaded (1.5 s each) so
	     every transition is a pure opacity change — no live option snaps.
	     Bottom: the raw photo. Middle: untinted droplets over it. Top: the
	     full in-player treatment (grayscale img + blue mix-blend wash +
	     tinted droplets) as one isolated unit, mounted at 0 opacity from
	     the start so its canvas is warm before it fades in. -->
	<div class="fixed inset-0 flex items-center justify-center">
		<div class="relative aspect-square h-[70vh] overflow-clip border-8 border-white">
			<img
				src="/art/taillights.jpg"
				alt="Taillights album art"
				draggable="false"
				class="absolute inset-0 h-full w-full object-cover"
			/>
			<div
				class={cn(
					"absolute inset-0 transition-opacity duration-[1500ms]",
					photoPhase === "photo" ? "opacity-0" : "opacity-100"
				)}
			>
				<Droplets
					class="h-full w-full"
					interactive={false}
					image="/art/taillights.jpg"
					intensity={0.55}
					scale={0.42}
					speed={0.6}
					fallSpeed={0.7}
					refraction={0.5}
				/>
			</div>
			<div
				class={cn(
					"absolute inset-0 isolate transition-opacity duration-[1500ms]",
					photoPhase === "tint" ? "opacity-100" : "opacity-0"
				)}
			>
				<img
					src="/art/taillights.jpg"
					alt=""
					draggable="false"
					class="absolute inset-0 h-full w-full object-cover contrast-110 grayscale"
				/>
				<div
					class="pointer-events-none absolute inset-0 mix-blend-color"
					style="background: {rgbCss(SONGS[2].color)}"
				></div>
				<Droplets
					class="h-full w-full"
					interactive={false}
					image="/art/taillights.jpg"
					imageTint={rgbCss(SONGS[2].color)}
					intensity={0.55}
					scale={0.42}
					speed={0.6}
					fallSpeed={0.7}
					refraction={0.5}
				/>
			</div>
		</div>
	</div>
{:else if step === 5 && sub === "rain-wrapped"}
	<!-- 6.2: the ENTIRE page content rendered as Droplets' captured
	     children, so the rain genuinely refracts and blurs the scene behind
	     it — the page passes through the effect instead of under it. -->
	<div class="fixed inset-0 overflow-clip">
		<Droplets class="h-full w-full" interactive={false}>
			{@render scene()}
		</Droplets>
	</div>
{:else}
	{@render scene()}
{/if}

{#if step === 5 && (sub === null || sub === "rain-overlay" || sub === "rain-alone" || sub === "rain-zoom")}
	<!-- The rain detour (default state): full-page Droplets as a pure
	     self-lit overlay — standalone forces the shader's self-lit branch,
	     so like Blaze, nothing passes through it. Not part of the final
	     composition (the real Droplets lives on Taillights' album art), so
	     it shows only on its own step rather than cumulatively. The
	     overflow-clip keeps the effect's oversized canvas from spawning
	     page scrollbars. The close-up sub keeps it mounted (its opening IS
	     6.2) and fades it out when its zoom starts. -->
	<div class={cn("pointer-events-none fixed inset-0 z-40 overflow-clip", rainZoomFadeClass)}>
		<Droplets class="h-full w-full" standalone interactive={false} />
	</div>
{/if}

{#if step === 5 && (sub === "rain-zoom" || sub === "rain-glyph")}
	<!-- The rain stage mirror, shared by the close-up and glyph subs so the
	     click between them remounts nothing — flames and cover carry
	     straight over. Close-up: pops in at the live pose the instant the
	     zoom starts (the real card goes invisible in the same frame), then
	     the layer flies to the measured dead-center 95%-height framing
	     while the inner pose blends live → flat; the cover fades in at the
	     end, blanking the content to leave the bare rounded rectangle and
	     its flames. Glyphs: eases back to 80%, fades GlyphRain onto the
	     cover, then flies home to the composition (cover off, blend back
	     to live, mirror fading out over the real card at touchdown). Sits
	     at z-30, under the rain (z-40) so the fading drops stay over the
	     card like they were in 6.2. -->
	<div
		class="pointer-events-none fixed inset-0 z-30"
		style="perspective: {perspectivePx}px; translate: {rainStageFraming.x}px {rainStageFraming.y}px; scale: {rainStageFraming.k}; {rainStageMove}"
	>
		<div
			class={cn(
				"absolute inset-0",
				sub === "rain-glyph" && rainGlyphPhase === "landed"
					? "opacity-0 transition-opacity duration-700"
					: (sub === "rain-glyph" || rainZoomPhase !== "live") && composite
						? "opacity-100"
						: "opacity-0"
			)}
			style="transform-style: preserve-3d; transform: {zoomCam}"
		>
			<div bind:this={rainZoomCardEl} class="absolute" style="transform: {zoomObj}">
				<FlameWrap class="h-480 w-360" color={accent} radius={64} height={340} spread={16}>
					<div class="relative h-480 w-360">
						<MusicPlayer glyphRain={sub === "rain-glyph"} laser={false} {artEffects} />
						<!-- The cover: blanks the card's content to the bare
						     rounded rectangle. The glyph layer lives INSIDE it,
						     so the glyph sub's rain fades in on the bare face
						     and leaves with the cover when the content
						     returns (the in-player glyph layer, behind the
						     content, takes over from there). -->
						<div
							class={cn(
								"absolute inset-0 overflow-hidden rounded-[64px] bg-neutral-950 transition-opacity duration-1000",
								(sub === "rain-zoom" && rainZoomPhase === "bare") ||
									(sub === "rain-glyph" &&
										rainGlyphPhase !== "return" &&
										rainGlyphPhase !== "glass" &&
										rainGlyphPhase !== "landed")
									? "opacity-100"
									: "opacity-0"
							)}
						>
							<div
								class={cn(
									"absolute inset-0 transition-opacity duration-[2000ms]",
									sub === "rain-glyph" && rainGlyphPhase !== "start" && rainGlyphPhase !== "out"
										? "opacity-100"
										: "opacity-0"
								)}
							>
								<div class="absolute inset-0 opacity-60">
									<GlyphRain
										class="h-full w-full"
										cell={64}
										color={accent}
										headColor={accent}
										glow={0.8}
										dim={0}
										light={0}
										relief={0}
										stir={0}
									/>
								</div>
							</div>
						</div>
					</div>
				</FlameWrap>
			</div>
		</div>
	</div>
{/if}

{#if step === 3 && (sub === "glass-math" || sub === "glass-sync" || (sub === "glass-shape" && shapeAt("math"))) && composite}
	<!-- Live composite readout: view × object, the exact product the browser
	     computes from the nested CSS3D divs. It churns at rest (the group's
	     bob lives in the object matrix) and churns harder on orbit (the drag
	     lives in the view matrix). Fixed column widths so appearing minus
	     signs can't resize the grid. Each axis row is a direction vector —
	     the card's local axis as seen from the camera — and the columns are
	     that vector's components; the axis rows carry the ~0.0015 px→scene
	     scale factor, hence 5 decimals. The homogeneous w column is omitted. -->
	<div
		transition:fade={{ duration: 700 }}
		class="pointer-events-none fixed inset-y-0 right-0 z-40 flex w-[40vw] items-center justify-center font-mono"
	>
		<div class="flex flex-col items-center gap-12">
			{#if perspectivePx !== null}
				<div class="text-center">
					<p class="text-sm tracking-widest text-white/30 uppercase">perspective</p>
					<p class="mt-2 text-5xl text-blue-300 tabular-nums">{perspectivePx.toFixed(0)}px</p>
				</div>
			{/if}
			<div
				class="grid grid-cols-[auto_repeat(3,9rem)] items-center gap-x-5 gap-y-6 text-right text-2xl tabular-nums"
			>
				<span></span>
				{#each ["x", "y", "z"] as axis (axis)}
					<span class="text-sm tracking-widest text-white/30 uppercase">{axis}</span>
				{/each}
				{#each ["x axis", "y axis", "z axis", "position"] as rowLabel, r (rowLabel)}
					<span class="text-left text-sm tracking-widest text-white/30 uppercase">{rowLabel}</span>
					{#each composite.slice(r * 4, r * 4 + 3) as value, c (c)}
						<span class={r === 3 ? "text-blue-300" : "text-white/70"}>
							{r === 3 ? value.toFixed(2) : value.toFixed(5)}
						</span>
					{/each}
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- pointer-events-auto keeps GlassObject's pointer routing from re-dispatching
     nav clicks to the orbit canvas. -->
<aside
	class={cn(
		"pointer-events-auto fixed top-1/2 left-8 z-50 w-56 -translate-y-1/2 rounded-3xl border border-white/10 bg-neutral-950/90 p-5 font-sans text-white",
		"transition-opacity duration-300",
		!pinned && "opacity-0 hover:opacity-100"
	)}
>
	<button
		class={cn(
			"pointer-events-auto mb-4 w-full cursor-pointer rounded-xl py-2 text-xs font-semibold tracking-wider uppercase transition-colors",
			pinned
				? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
				: "bg-white text-neutral-950"
		)}
		onclick={() => (pinned = !pinned)}
	>
		{pinned ? "Visibility on" : "Visibility off"}
	</button>
	<div class="flex flex-col gap-2">
		{#each STEPS as s, i (s.label)}
			<button
				class={cn(
					"pointer-events-auto cursor-pointer rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors",
					i === step && sub === null
						? "bg-white text-neutral-950"
						: i === step
							? "bg-white/25 text-white"
							: i < step
								? "bg-white/15 text-white"
								: "bg-white/5 text-white/50 hover:bg-white/15 hover:text-white"
				)}
				onclick={() => select(i)}
			>
				<span class="mr-2 text-xs opacity-60">{i + 1}</span>{s.label}
			</button>
			{#if i === step && s.subs}
				{#each s.subs as item, j (item.key)}
					<button
						class={cn(
							"pointer-events-auto ml-6 cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
							sub === item.key
								? "bg-white text-neutral-950"
								: "bg-white/5 text-white/50 hover:bg-white/15 hover:text-white"
						)}
						onclick={() => selectSub(item.key)}
					>
						<span class="mr-2 opacity-60">{i + 1}.{j + 1}</span>{item.label}
					</button>
				{/each}
			{/if}
		{/each}
	</div>
</aside>

<style>
	.shape-draw {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: shape-draw 3000ms cubic-bezier(0.6, 0, 0.4, 1) forwards;
	}
	@keyframes shape-draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
