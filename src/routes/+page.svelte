<script lang="ts">
	import Blaze from "$lib/components/canvasui/Blaze.svelte";
	import FlameWrap from "$lib/components/canvasui/FlameWrap.svelte";
	import GlassObject from "$lib/components/canvasui/GlassObject.svelte";
	import HexFloat from "$lib/components/canvasui/HexFloat.svelte";
	import Liquid from "$lib/components/canvasui/Liquid.svelte";
	import MusicPlayer from "$lib/components/MusicPlayer.svelte";

	import { player } from "$lib/player.svelte";

	import { rgbCss } from "$lib/utilities/color";

	// The glass slab's entire 3D model: one rounded rectangle, card-shaped.
	const cardShape = `data:image/svg+xml;utf8,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960"><rect width="720" height="960" rx="32" fill="black"/></svg>'
	)}`;

	const accent = $derived(player.accent.current);
	const smoke = $derived(accent.map((v) => v * 0.6) as [number, number, number]);

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
	<HexFloat
		class="h-full w-full"
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
</div>

<!-- Full-viewport sparks and smoke rising behind the glass scene, tinted by
     the live accent. -->
<div class="fixed inset-0 -z-10">
	<Blaze class="h-full w-full" layers={3} distortion={0} sparkColor={accent} smokeColor={smoke} />
</div>

<!-- Accent-colored fluid trails stirred by the cursor from anywhere on the
     page (see forwardToLiquid). -->
<div bind:this={liquidLayer} class="pointer-events-none fixed inset-0 -z-10">
	<Liquid class="h-full w-full" standalone color={accent} />
</div>

<!-- The centerpiece: the live music card riding the floating glass slab via
     the CSS3D projection — bobbing, rocking, drag-to-orbit — wrapped in
     flames that lick off its silhouette in the accent color. -->
<GlassObject
	class="h-screen w-full"
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
	<FlameWrap class="h-480 w-360" color={accent} radius={64} height={340} spread={16}>
		<MusicPlayer />
	</FlameWrap>
</GlassObject>
