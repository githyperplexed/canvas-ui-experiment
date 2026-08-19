export type EffectKey =
	| "hexFloat"
	| "blaze"
	| "liquid"
	| "glassObject"
	| "flameWrap"
	| "glyphRain"
	| "laser"
	| "vhs"
	| "retroDither"
	| "droplets";

export interface EffectEntry {
	key: EffectKey;
	label: string;
	note: string;
}

export interface EffectGroup {
	title: string;
	effects: EffectEntry[];
}

// Grouped by where each effect lives in the scene; order within a group
// mirrors the composition order in EFFECTS.md.
export const EFFECT_GROUPS: EffectGroup[] = [
	{
		title: "Background",
		effects: [
			{ key: "hexFloat", label: "HexFloat", note: "Hex-tile background" },
			{ key: "blaze", label: "Blaze", note: "Rising sparks & smoke" },
			{ key: "liquid", label: "Liquid", note: "Cursor fluid trails" }
		]
	},
	{
		title: "Card",
		effects: [
			{ key: "glassObject", label: "GlassObject", note: "Floating glass slab" },
			{ key: "flameWrap", label: "FlameWrap", note: "Flames on the card" },
			{ key: "glyphRain", label: "GlyphRain", note: "Glyphs behind the card UI" },
			{ key: "laser", label: "Laser", note: "“Up next” beam while playing" }
		]
	},
	{
		title: "Album art",
		effects: [
			{ key: "vhs", label: "VHS", note: "Midnight Static art" },
			{ key: "retroDither", label: "RetroDither", note: "Sundowner art" },
			{ key: "droplets", label: "Droplets", note: "Taillights art" }
		]
	}
];

// One global knob for how many pixels every effect canvas shades. 1 is native
// (layout size × devicePixelRatio); the default trades near-invisible
// resolution for a large GPU saving — fire, smoke, and glyphs are soft,
// low-frequency imagery that upscales cleanly.
export const RENDER_SCALE = 0.65;

// The GlassObject projection displays the card at roughly 40% of its layout
// size, so effects hosted inside the card can render at a matching fraction
// and still meet the resolution that actually reaches the screen.
//
// Two tiers, because some card effects CARRY content in their texture:
// FlameWrap holds the whole captured card and the art effects hold the album
// image, so their canvases are what the viewer actually reads — they must not
// drop below displayed resolution or the card goes blurry. Pure overlays
// (GlyphRain, Laser) only draw their own soft imagery and can take the global
// RENDER_SCALE on top.
export const CARD_RENDER_SCALE = 0.5;

/** Which effects render; the settings panel's checkboxes write here.
 * Liquid starts off — it's the heaviest optional layer. */
export const effectsOn = $state<Record<EffectKey, boolean>>({
	hexFloat: true,
	blaze: true,
	liquid: false,
	glassObject: true,
	flameWrap: true,
	glyphRain: true,
	laser: true,
	vhs: true,
	retroDither: true,
	droplets: true
});
