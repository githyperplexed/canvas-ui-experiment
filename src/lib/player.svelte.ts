import { Tween } from "svelte/motion";

import { lerpRgb, type Rgb } from "$lib/utilities/color";

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
