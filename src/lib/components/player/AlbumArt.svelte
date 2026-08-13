<script lang="ts">
	import { fade } from "svelte/transition";

	import Droplets from "$lib/components/canvasui/Droplets.svelte";
	import RetroDither from "$lib/components/canvasui/RetroDither.svelte";
	import VHS from "$lib/components/canvasui/VHS.svelte";

	import { player } from "$lib/player.svelte";

	import { deepen, rgbCss, soften } from "$lib/utilities/color";

	interface Props {
		/** Which art treatments may render — the build walkthrough narrows
		 * this as effects are introduced; the live card allows all. */
		artEffects?: Array<"vhs" | "droplets" | "retro-dither">;
	}

	let { artEffects = ["vhs", "droplets", "retro-dither"] }: Props = $props();

	const art = $derived(
		player.song.artEffect && artEffects.includes(player.song.artEffect)
			? player.song.artEffect
			: undefined
	);
</script>

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
