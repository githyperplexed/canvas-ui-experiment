<script lang="ts">
	import GlyphRain from "$lib/components/canvasui/GlyphRain.svelte";
	import AccentLine from "$lib/components/player/AccentLine.svelte";
	import AlbumArt from "$lib/components/player/AlbumArt.svelte";
	import SeekBar from "$lib/components/player/SeekBar.svelte";
	import Transport from "$lib/components/player/Transport.svelte";

	import { player } from "$lib/player.svelte";

	import { cn } from "$lib/utilities/cn";
	import { deepen, rgbCss, soften } from "$lib/utilities/color";

	// The live accent, exposed as CSS variables on the card root so every
	// sub-component (and Tailwind's bg-(--accent) utilities) inherits it.
	const accent = $derived(player.accent.current);
	const accentVars = $derived(
		[
			`--accent: ${rgbCss(accent)}`,
			`--accent-soft: ${rgbCss(soften(accent))}`,
			`--accent-deep: ${rgbCss(deepen(accent))}`,
			`--accent-a20: ${rgbCss(accent, 0.2)}`,
			`--accent-a40: ${rgbCss(accent, 0.4)}`
		].join("; ")
	);

	// The playback clock: one tick per second while playing.
	$effect(() => {
		if (!player.playing) return;
		const id = setInterval(() => player.tick(), 1000);
		return () => clearInterval(id);
	});
</script>

<div
	class="relative isolate flex h-480 w-360 flex-col overflow-hidden rounded-[64px] bg-neutral-950 p-28 font-sans text-white antialiased"
	style={accentVars}
>
	<!-- Matrix glyphs raining behind the card's UI content on a negative-z
	     layer, dimmed to an ambient texture, re-coloring per song. -->
	<div class="pointer-events-none absolute inset-0 -z-10 opacity-60">
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

	<div class="flex items-start justify-between">
		<div>
			<p class="text-[40px] tracking-widest text-white/35 uppercase">Now playing</p>
			<p class="mt-4 text-[60px] font-medium">Late Night Drive</p>
		</div>
		<span
			class={cn(
				"rounded-full px-10 py-4 text-[40px] font-medium tracking-wider whitespace-nowrap uppercase transition-colors",
				player.playing ? "bg-(--accent-a20) text-(--accent-soft)" : "bg-white/10 text-white/55"
			)}
		>
			{player.playing ? "Playing" : "Paused"}
		</span>
	</div>

	<AlbumArt />

	<div class="mt-24">
		<p class="text-8xl font-semibold tracking-tight">{player.song.title}</p>
		<p class="mt-4 text-5xl text-white/40">{player.song.artist}</p>
	</div>

	<SeekBar />

	<hr class="my-20 border-t-4 border-dashed border-white/15" />

	<Transport />

	<p class="mt-auto pt-20 text-center text-[40px] tracking-widest text-white/25 uppercase">
		Up next · {player.upNext.title}
	</p>

	<AccentLine />
</div>
