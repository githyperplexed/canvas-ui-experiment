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
