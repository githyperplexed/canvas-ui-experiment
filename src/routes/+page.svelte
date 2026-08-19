<script lang="ts">
	import { onMount } from "svelte";

	import Blaze from "$lib/components/canvasui/Blaze.svelte";
	import FlameWrap from "$lib/components/canvasui/FlameWrap.svelte";
	import GlassObject from "$lib/components/canvasui/GlassObject.svelte";
	import HexFloat from "$lib/components/canvasui/HexFloat.svelte";
	import Liquid from "$lib/components/canvasui/Liquid.svelte";
	import EffectsPanel from "$lib/components/EffectsPanel.svelte";
	import MusicPlayer from "$lib/components/MusicPlayer.svelte";

	import { player } from "$lib/player.svelte";

	import { cn } from "$lib/utilities/cn";
	import { rgbCss } from "$lib/utilities/color";

	import { CARD_RENDER_SCALE, effectsOn, RENDER_SCALE } from "$lib/effects.svelte";

	// The glass slab's entire 3D model: one rounded rectangle, card-shaped.
	const cardShape = `data:image/svg+xml;utf8,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960"><rect width="720" height="960" rx="32" fill="black"/></svg>'
	)}`;

	const accent = $derived(player.accent.current);
	const smoke = $derived(accent.map((v) => v * 0.6) as [number, number, number]);

	// The boot veil ships opaque in the server-rendered HTML, so the first
	// paint is solid black instead of the giant unprojected card. Once the
	// effect canvases have had a beat to mount and paint, it fades away.
	let revealed = $state(false);

	onMount(() => {
		const id = setTimeout(() => (revealed = true), 400);
		return () => clearTimeout(id);
	});

	let liquidLayer: HTMLDivElement | undefined = $state();

	// The liquid overlay is pointer-events-none so it can sit above everything
	// without stealing interaction; window pointer moves are mirrored onto it.
	// Hover only: any held button is an orbit drag, so the liquid is told to
	// forget the pointer instead — no trails while rotating, no jump on release.
	const forwardToLiquid = (event: PointerEvent) => {
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
	};
</script>

<svelte:window onpointermove={forwardToLiquid} />

<!-- Background: giant matte-black hex tiles drifting on a tilted plane. The
     layer is oversized past the viewport so the tilt never reveals the
     plane's edges. -->
<div class="fixed -inset-x-1/4 -top-1/4 bottom-0 -z-10">
	{#if effectsOn.hexFloat}
		<HexFloat
			class="h-full w-full"
			resolutionScale={RENDER_SCALE}
			size={320}
			float={0.25}
			speed={0.4}
			shine={0.25}
			bloom={0.1}
			iridescence={0}
			grain={0}
		>
			<div class="h-full w-full bg-neutral-950"></div>
		</HexFloat>
	{:else}
		<div class="h-full w-full bg-neutral-950"></div>
	{/if}
</div>

<!-- Full-viewport sparks and smoke rising behind the glass scene, tinted by
     the live accent. -->
{#if effectsOn.blaze}
	<div class="fixed inset-0 -z-10">
		<Blaze
			class="h-full w-full"
			resolutionScale={RENDER_SCALE}
			layers={3}
			distortion={0}
			sparkColor={accent}
			smokeColor={smoke}
		/>
	</div>
{/if}

<!-- Accent-colored fluid trails stirred by the cursor from anywhere on the
     page (see forwardToLiquid). -->
{#if effectsOn.liquid}
	<div bind:this={liquidLayer} class="pointer-events-none fixed inset-0 -z-10">
		<Liquid class="h-full w-full" resolutionScale={RENDER_SCALE} standalone color={accent} />
	</div>
{/if}

<!-- The centerpiece: the live music card riding the floating glass slab via
     the CSS3D projection — bobbing, rocking, drag-to-orbit — wrapped in
     flames that lick off its silhouette in the accent color. -->
{#snippet card()}
	{#if effectsOn.flameWrap}
		<FlameWrap
			class="h-480 w-360"
			resolutionScale={CARD_RENDER_SCALE}
			color={accent}
			radius={64}
			height={340}
			spread={16}
		>
			<MusicPlayer />
		</FlameWrap>
	{:else}
		<MusicPlayer />
	{/if}
{/snippet}

{#if effectsOn.glassObject}
	<GlassObject
		class="h-screen w-full"
		resolutionScale={RENDER_SCALE}
		src={cardShape}
		ior={1}
		roughness={0}
		dispersion={0}
		clearcoat={0}
		tint="#0a0a0a"
		tintDensity={4}
		environmentIntensity={0.35}
		yOffset={-0.35}
		depth={0.04}
		bevel={0.25}
		highlight={rgbCss(player.song.color)}
	>
		{@render card()}
	</GlassObject>
{:else}
	<!-- Slab off: the card flat and centered, scaled down to roughly the
	     size the CSS3D projection presents it at. -->
	<div class="grid h-screen w-full place-items-center">
		<div class="origin-center scale-[0.38]">
			{@render card()}
		</div>
	</div>
{/if}

<!-- Boot veil (see `revealed`). Sits above everything, including the settings
     panel, and never intercepts the pointer. -->
<div
	class={cn(
		"pointer-events-none fixed inset-0 z-50 bg-neutral-950 transition-opacity duration-700",
		revealed && "opacity-0"
	)}
	aria-hidden="true"
></div>

<EffectsPanel />

<!-- Plain footer links. pointer-events-auto so GlassObject's pointer routing
     lets them click while everything around them still drags to orbit. -->
<div
	class="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center gap-8 font-sans text-sm text-white/40"
>
	<a
		class="pointer-events-auto hover:underline"
		href="https://youtu.be/37wy90RnATM"
		target="_blank"
		rel="noopener noreferrer"
	>
		Video
	</a>
	<a
		class="pointer-events-auto hover:underline"
		href="https://github.com/githyperplexed/canvas-ui-experiment"
		target="_blank"
		rel="noopener noreferrer"
	>
		Repo
	</a>
	<a
		class="pointer-events-auto hover:underline"
		href="https://canvasui.dev"
		target="_blank"
		rel="noopener noreferrer"
	>
		Canvas UI
	</a>
</div>
