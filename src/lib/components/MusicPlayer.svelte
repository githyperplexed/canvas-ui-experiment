<script lang="ts">
	import { fade } from "svelte/transition";
	import pauseIcon from "$lib/assets/icons/pause.svg?raw";
	import playIcon from "$lib/assets/icons/play.svg?raw";
	import skipBackIcon from "$lib/assets/icons/skip-back.svg?raw";
	import skipForwardIcon from "$lib/assets/icons/skip-forward.svg?raw";
	import Droplets from "$lib/components/canvasui/Droplets.svelte";
	import GlyphRain from "$lib/components/canvasui/GlyphRain.svelte";
	import Laser from "$lib/components/canvasui/Laser.svelte";
	import RetroDither from "$lib/components/canvasui/RetroDither.svelte";
	import VHS from "$lib/components/canvasui/VHS.svelte";
	import { deepen, player, rgbCss, soften } from "$lib/player.svelte";
	import { cn } from "$lib/utils";

	interface Props {
		/** Effect toggles for the build walkthrough (?build); the live
		 * composition uses the defaults (everything on). `accentLine` drops
		 * the whole bottom block — the little line AND the laser that rides
		 * it — so "Up next" closes the card on its padding line. */
		glyphRain?: boolean;
		laser?: boolean;
		accentLine?: boolean;
		artEffects?: Array<"vhs" | "droplets" | "retro-dither">;
	}

	let {
		glyphRain = true,
		laser = true,
		accentLine = true,
		artEffects = ["vhs", "droplets", "retro-dither"]
	}: Props = $props();

	const art = $derived(
		player.song.artEffect && artEffects.includes(player.song.artEffect)
			? player.song.artEffect
			: undefined
	);

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

	$effect(() => {
		if (!player.playing) return;
		const id = setInterval(() => player.tick(), 1000);
		return () => clearInterval(id);
	});

	function format(seconds: number) {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	}

	function seek(event: MouseEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		player.seek((event.clientX - rect.left) / rect.width);
	}
</script>

<div
	class="relative isolate flex h-480 w-360 flex-col overflow-hidden rounded-[64px] bg-neutral-950 p-28 font-sans text-white antialiased"
	style={accentVars}
>
	{#if glyphRain}
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
	{/if}

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

	<div class="relative mt-24 aspect-square w-full overflow-hidden rounded-[48px]">
		<!-- Keyed on the song: on a track change the outgoing art stack stays
		     in the DOM fading out (reactivity detaches, so it keeps the old
		     song's art) while the incoming stack fades in over it. -->
		{#key player.song}
			<div class="absolute inset-0" transition:fade={{ duration: 800 }}>
				<img
					src={player.song.art}
					alt="{player.song.title} album art"
					draggable="false"
					class="absolute inset-0 h-full w-full object-cover contrast-110 grayscale"
				/>
				<div class="pointer-events-none absolute inset-0 bg-(--accent) mix-blend-color"></div>
				{#if art === "droplets"}
					<div class="pointer-events-none absolute inset-0">
						<Droplets
							class="h-full w-full"
							interactive={false}
							image={player.song.art}
							imageTint={rgbCss(player.song.color)}
							intensity={0.55}
							scale={0.42}
							speed={0.6}
							fallSpeed={0.7}
							refraction={0.5}
						/>
					</div>
				{:else if art === "retro-dither"}
					<div class="pointer-events-none absolute inset-0">
						<RetroDither
							class="h-full w-full"
							image={player.song.art}
							pixelSize={6}
							levels={4}
							darkColor={deepen(player.song.color)}
							lightColor={soften(player.song.color)}
							colorize={0.85}
							baseStrength={1}
							strength={1}
							scanlines={0.15}
						/>
					</div>
				{:else if art === "vhs"}
					<div class="pointer-events-none absolute inset-0">
						<VHS
							class="h-full w-full"
							image={player.song.art}
							imageTint={rgbCss(player.song.color)}
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
				{/if}
			</div>
		{/key}
	</div>

	<div class="mt-24">
		<p class="text-8xl font-semibold tracking-tight">{player.song.title}</p>
		<p class="mt-4 text-5xl text-white/40">{player.song.artist}</p>
	</div>

	<div class="mt-20">
		<button
			class="pointer-events-auto block h-5 w-full cursor-pointer overflow-hidden rounded-full bg-white/10"
			aria-label="Seek"
			onclick={seek}
		>
			<span
				class="block h-full rounded-full bg-(--accent)"
				style="width: {(player.current / player.song.duration) * 100}%"
			></span>
		</button>
		<div class="mt-6 flex justify-between text-[40px] text-white/35">
			<span>{format(player.current)}</span>
			<span>{format(player.song.duration)}</span>
		</div>
	</div>

	<hr class="my-20 border-t-4 border-dashed border-white/15" />

	<div class="flex items-center justify-center gap-28">
		<button
			class="pointer-events-auto flex size-44 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
			aria-label="Previous track"
			onclick={() => player.prev()}
		>
			<span class="flex *:size-18">{@html skipBackIcon}</span>
		</button>
		<button
			class="pointer-events-auto flex size-48 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-950 transition-transform hover:scale-105"
			aria-label={player.playing ? "Pause" : "Play"}
			onclick={() => player.toggle()}
		>
			{#if player.playing}
				<span class="flex *:size-22">{@html pauseIcon}</span>
			{:else}
				<span class="ml-2 flex *:size-22">{@html playIcon}</span>
			{/if}
		</button>
		<button
			class="pointer-events-auto flex size-44 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
			aria-label="Next track"
			onclick={() => player.next()}
		>
			<span class="flex *:size-18">{@html skipForwardIcon}</span>
		</button>
	</div>

	<p class="mt-auto pt-20 text-center text-[40px] tracking-widest text-white/25 uppercase">
		Up next · {player.upNext.title}
	</p>

	{#if accentLine}
		<div class="relative mt-16">
			<div
				class="mx-auto h-1 w-64 bg-linear-to-r from-transparent via-white/15 to-transparent"
			></div>
			{#if laser && player.playing}
				<div
					class="pointer-events-none absolute inset-x-0 -top-80 -bottom-80"
					transition:fade={{ duration: 700 }}
				>
					<Laser
						class="h-full w-full"
						color={accent}
						offset={326}
						cutoff={false}
						width={0.25}
						thickness={8}
						radius={28}
						wave={10}
						reveal={280}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
