import { Tween } from "svelte/motion";

export type Rgb = [number, number, number];

export interface Song {
	title: string;
	artist: string;
	duration: number;
	/** Accent color as [r, g, b] in 0-1 range, the format the canvas effects use. */
	color: Rgb;
	/** Album art URL; seeded per song so it stays stable between plays. */
	art: string;
	/** Canvas effect layered on the album art for this song. */
	artEffect?: "vhs" | "droplets" | "retro-dither";
}

export const SONGS: Song[] = [
	{
		title: "Midnight Static",
		artist: "Neon Coast · Signal Bloom",
		duration: 227,
		color: [0.659, 0.333, 0.969], // purple-500
		art: "/art/midnight-static.jpg",
		artEffect: "vhs"
	},
	{
		title: "Sundowner",
		artist: "Vantage Point",
		duration: 198,
		color: [0.961, 0.62, 0.043], // amber-500
		art: "/art/sundowner.jpg",
		artEffect: "retro-dither"
	},
	{
		title: "Taillights",
		artist: "Low Orbit Choir",
		duration: 243,
		color: [0.231, 0.51, 0.965], // blue-500
		art: "/art/taillights.jpg",
		artEffect: "droplets"
	}
];

const lerpRgb = (from: Rgb, to: Rgb) => (t: number) =>
	from.map((v, i) => v + (to[i] - v) * t) as Rgb;

class Player {
	index = $state(0);
	current = $state(0);
	playing = $state(false);

	/** Accent color phased smoothly between songs; effects and CSS both read this. */
	accent = new Tween<Rgb>(SONGS[0].color, { duration: 1200, interpolate: lerpRgb });

	song = $derived(SONGS[this.index]);
	upNext = $derived(SONGS[(this.index + 1) % SONGS.length]);

	toggle() {
		this.playing = !this.playing;
	}

	goTo(index: number) {
		this.index = ((index % SONGS.length) + SONGS.length) % SONGS.length;
		this.current = 0;
		void this.accent.set(this.song.color);
	}

	next() {
		this.goTo(this.index + 1);
	}

	prev() {
		if (this.current > 3) {
			this.current = 0;
		} else {
			this.goTo(this.index - 1);
		}
	}

	seek(ratio: number) {
		this.current = Math.round(Math.min(Math.max(ratio, 0), 1) * this.song.duration);
	}

	/** Advance one second of playback; rolls into the next song at the end. */
	tick() {
		if (!this.playing) return;
		this.current += 1;
		if (this.current >= this.song.duration) this.next();
	}
}

export const player = new Player();

export function rgbCss(color: Rgb, alpha = 1): string {
	const [r, g, b] = color.map((v) => Math.round(v * 255));
	return alpha >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** Lighter variant for text on dark backgrounds, like the 400 shade of a palette. */
export const soften = (color: Rgb): Rgb => color.map((v) => v + (1 - v) * 0.45) as Rgb;

/** Darker variant for large surfaces, like the 900 shade of a palette. */
export const deepen = (color: Rgb): Rgb => color.map((v) => v * 0.3) as Rgb;
