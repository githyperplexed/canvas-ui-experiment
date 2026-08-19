<script lang="ts">
	import { page } from "$app/state";

	import BoardingPass from "$lib/components/BoardingPass.svelte";
	import Blaze from "$lib/components/canvasui/Blaze.svelte";
	import FlameWrap from "$lib/components/canvasui/FlameWrap.svelte";
	import GlassObject from "$lib/components/canvasui/GlassObject.svelte";
	import HexFloat from "$lib/components/canvasui/HexFloat.svelte";
	import Liquid from "$lib/components/canvasui/Liquid.svelte";
	import Magnify from "$lib/components/canvasui/Magnify.svelte";
	import CaptchaCard from "$lib/components/CaptchaCard.svelte";
	import CheckoutForm from "$lib/components/CheckoutForm.svelte";
	import CookieBanner from "$lib/components/CookieBanner.svelte";
	import EffectsBuild from "$lib/components/EffectsBuild.svelte";
	import MusicPlayer from "$lib/components/MusicPlayer.svelte";
	import Receipt from "$lib/components/Receipt.svelte";
	import SequencePlayer from "$lib/components/SequencePlayer.svelte";

	import { player } from "$lib/player.svelte";

	import { cn } from "$lib/utilities/cn";
	import { rgbCss } from "$lib/utilities/color";

	const cardShape = `data:image/svg+xml;utf8,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960"><rect width="720" height="960" rx="32" fill="black"/></svg>'
	)}`;

	// Thumbnail mode (?thumbnail): a split shot across the white center divider
	// — plain left half, flame-wrapped right half, reading as one element
	// mid-transition. See EFFECTS.md. Variants:
	//   ?thumbnail / ?thumbnail=form  landscape payment card (default)
	//   ?thumbnail=input              three raw XXL inputs, no container
	//   ?thumbnail=search             one pill XXL search input, split
	//   ?thumbnail=captcha            the "I'm not a robot" card fully aflame, no split
	//   ?thumbnail=cursor             one giant arrow cursor, split
	//   ?thumbnail=toggle             one giant toggle switch fully aflame, knob too, no split
	//   ?thumbnail=cookies            the cookie consent banner fully aflame, no split
	//   ?thumbnail=full-form          the whole flaming card, no split
	//   ?thumbnail=receipt            the day-one receipt on HexFloat, no split
	//   ?thumbnail=pass               a boarding pass under Magnify, no split
	const thumbnailVariant = $derived(page.url.searchParams.get("thumbnail"));
	const thumbnail = $derived(thumbnailVariant !== null);
	const thumbnailInput = $derived(thumbnailVariant === "input");
	const thumbnailSearch = $derived(thumbnailVariant === "search");
	const thumbnailCaptcha = $derived(thumbnailVariant === "captcha");
	const thumbnailCursor = $derived(thumbnailVariant === "cursor");
	const thumbnailToggle = $derived(thumbnailVariant === "toggle");
	const thumbnailCookies = $derived(thumbnailVariant === "cookies");
	const thumbnailFullForm = $derived(thumbnailVariant === "full-form");
	const thumbnailReceipt = $derived(thumbnailVariant === "receipt");
	const thumbnailPass = $derived(thumbnailVariant === "pass");
	const thumbnailSplit = $derived(
		!thumbnailFullForm &&
			!thumbnailReceipt &&
			!thumbnailPass &&
			!thumbnailToggle &&
			!thumbnailCookies &&
			!thumbnailCaptcha
	);

	// Sequence mode (?sequence): the recording stage for the UI-build timelapse.
	// BuildCard reveals item by item; a side panel steps, plays, and paces the
	// scenes. See EFFECTS.md.
	const sequence = $derived(page.url.searchParams.has("sequence"));

	// Build mode (?build): the walkthrough of the real composition — each
	// major effect added one at a time via a clickable step nav. See EFFECTS.md.
	const build = $derived(page.url.searchParams.has("build"));

	const xxlInputClass =
		"rounded-[32px] border-3 border-white/15 bg-white/5 px-14 font-sans text-7xl text-white placeholder:text-white/30 outline-none focus:border-blue-400/55";
	const xxlPlaceholders = ["Jordan Avery", "you@example.com", "4242 4242 4242 4242"];

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

{#if build}
	<EffectsBuild />
{:else if sequence}
	<SequencePlayer />
{:else if thumbnail}
	<!-- One card split across the divider: two copies of the same form in
	     identical px-sized wrappers (one plain, one burning), both pinned to
	     the exact screen center with the same position formula, each clipped
	     to its own half of the viewport. A single px source of truth for the
	     card box — the form fills its wrapper — so the halves cannot drift
	     and nothing overflows FlameWrap's overflow-auto content wrapper. -->
	<div class="relative h-screen">
		{#if thumbnailPass}
			<!-- A boarding pass under the Magnify inspection lens — no split, no
			     divider, default lens settings. No tilt here, so the card sits at
			     true center without a nudge. -->
			<div class="absolute inset-0">
				<Magnify class="h-full w-full">
					<div class="flex h-full w-full items-center justify-center bg-neutral-950">
						<div class="rounded-[80px] border-2 border-white/10 bg-white/5 p-8">
							<BoardingPass />
						</div>
					</div>
				</Magnify>
			</div>
		{:else if thumbnailReceipt}
			<!-- The day-one receipt riding the hex tiles — no split, no divider.
			     The HexFloat layer is oversized past the viewport (same trick as
			     the live background) so the tilted plane never shows its edges;
			     symmetric oversizing keeps the receipt on the screen center. -->
			<div class="absolute -inset-1/4">
				<HexFloat class="h-full w-full">
					<div class="flex h-full w-full items-center justify-center bg-neutral-950">
						<!-- Card wrapper: the receipt's #0a0a0a face matches the backdrop,
						     so without this frame its edges vanish into the tile field.
						     Radius is concentric with the receipt's (48px + 32px pad).
						     Nudged down: the plane's tilt projects centered content
						     high on screen, so true center needs a downward shift. -->
						<div class="translate-y-[10vh] rounded-[80px] border-2 border-white/10 bg-white/5 p-8">
							<Receipt />
						</div>
					</div>
				</HexFloat>
			</div>
		{:else if thumbnailFullForm}
			<!-- The whole burning card, no split and no divider — sunk a little
			     below center to leave headroom for the flames. -->
			<div
				class="absolute top-[calc(50%+8vh)] left-1/2 h-[900px] w-[1800px] -translate-x-1/2 -translate-y-1/2"
			>
				<FlameWrap
					class="h-full w-full"
					color={[0.231, 0.51, 0.965]}
					radius={72}
					height={480}
					spread={32}
					scale={0.55}
					intensity={1}
					sparks={2.5}
					sparkDensity={2}
				>
					<CheckoutForm scale={1.5} inputFlames="overlay" />
				</FlameWrap>
			</div>
		{:else if thumbnailInput}
			<!-- Three raw XXL inputs, no card behind them. The stack is px-exact
			     (3×220 + 2×48 = 756) so both halves stay in perfect register. -->
			<div class="absolute inset-y-0 left-0 w-1/2 overflow-clip">
				<div
					class="absolute top-1/2 right-0 flex h-[756px] w-[1600px] translate-x-1/2 -translate-y-1/2 flex-col gap-[48px]"
				>
					{#each xxlPlaceholders as placeholder (placeholder)}
						<input class={cn(xxlInputClass, "h-[220px] w-full")} type="text" {placeholder} />
					{/each}
				</div>
			</div>
			<div class="absolute inset-y-0 right-0 w-1/2 overflow-clip">
				<div
					class="absolute top-1/2 left-0 flex h-[756px] w-[1600px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[48px]"
				>
					{#each xxlPlaceholders as placeholder (placeholder)}
						<FlameWrap
							class="h-[220px] w-full"
							color={[0.231, 0.51, 0.965]}
							radius={32}
							height={360}
							spread={24}
							scale={0.65}
							intensity={0.9}
							sparks={2}
							sparkDensity={1.5}
						>
							<input class={cn(xxlInputClass, "h-full w-full")} type="text" {placeholder} />
						</FlameWrap>
					{/each}
				</div>
			</div>
		{:else if thumbnailCaptcha}
			<!-- The robot-check card, whole thing ablaze — no split. Cool
			     blue-gray stage with the amber Blaze across all of it, card
			     sunk below center like the full-form for flame headroom. -->
			<div class="absolute inset-0 bg-[#131a26]">
				<Blaze
					class="h-full w-full"
					layers={3}
					distortion={0}
					sparkColor={[1, 0.62, 0.1]}
					smokeColor={[0.6, 0.37, 0.06]}
				/>
			</div>
			<div
				class="absolute top-[calc(50%+8vh)] left-1/2 h-[400px] w-[1600px] -translate-x-1/2 -translate-y-1/2"
			>
				<FlameWrap
					class="h-full w-full"
					color={[1, 0.62, 0.1]}
					radius={16}
					height={420}
					spread={28}
					scale={0.65}
					intensity={1}
					sparks={2.5}
					sparkDensity={2}
				>
					<CaptchaCard />
				</FlameWrap>
			</div>
		{:else if thumbnailCursor}
			<!-- One giant arrow cursor mid-incineration — same treatment as the
			     captcha: plain left half, burning right half, blue-gray stage,
			     no divider. The classic 7-point pointer polygon as inline SVG,
			     white fill with a dark outline so it reads on the dark stage.
			     Wrapper ratio (560×760) matches the 14×19 viewBox so the SVG
			     fills it exactly and both halves stay in register. -->
			{#snippet cursorGraphic()}
				<svg class="h-full w-full" viewBox="0 0 14 19" aria-hidden="true">
					<path
						d="M1 1 L1 15.5 L4.9 12.4 L7.6 18 L10.4 16.7 L7.7 11.2 L12.6 11.2 Z"
						fill="#ffffff"
						stroke="#0a0d14"
						stroke-width="0.6"
						stroke-linejoin="round"
					/>
				</svg>
			{/snippet}
			<div class="absolute inset-y-0 left-0 w-1/2 overflow-clip bg-[#131a26]">
				<div class="absolute top-1/2 right-0 h-[760px] w-[560px] translate-x-1/2 -translate-y-1/2">
					{@render cursorGraphic()}
				</div>
			</div>
			<div class="absolute inset-y-0 right-0 w-1/2 overflow-clip bg-[#131a26]">
				<!-- Blaze behind the burning half only, amber to match. -->
				<div class="absolute inset-0">
					<Blaze
						class="h-full w-full"
						layers={3}
						distortion={0}
						sparkColor={[1, 0.62, 0.1]}
						smokeColor={[0.6, 0.37, 0.06]}
					/>
				</div>
				<div class="absolute top-1/2 left-0 h-[760px] w-[560px] -translate-x-1/2 -translate-y-1/2">
					<FlameWrap
						class="h-full w-full"
						color={[1, 0.62, 0.1]}
						radius={64}
						height={460}
						spread={28}
						scale={0.6}
						intensity={1}
						sparks={2.5}
						sparkDensity={2}
					>
						{@render cursorGraphic()}
					</FlameWrap>
				</div>
			</div>
		{:else if thumbnailToggle}
			<!-- One giant toggle switch, whole thing ablaze — no split. The knob
			     burns separately via the checkout form's "overlay" trick: a
			     childless FlameWrap floated above it, fire self-generated from
			     the rect (full radius makes it a circle), so nothing depends on
			     capture-inside-capture. Solid off-white track like the captcha
			     card; bright blue knob. All fire — pill, knob, and Blaze — in
			     the main experiment's blue. Sunk below center like the
			     full-form for flame headroom. -->
			<div class="absolute inset-0 bg-[#131a26]">
				<Blaze
					class="h-full w-full"
					layers={3}
					distortion={0}
					sparkColor={[0.231, 0.51, 0.965]}
					smokeColor={[0.139, 0.306, 0.579]}
				/>
			</div>
			<div
				class="absolute top-[calc(50%+8vh)] left-1/2 h-[480px] w-[1120px] -translate-x-1/2 -translate-y-1/2"
			>
				<FlameWrap
					class="h-full w-full"
					color={[0.231, 0.51, 0.965]}
					radius={240}
					height={460}
					spread={28}
					scale={0.6}
					intensity={1}
					sparks={2.5}
					sparkDensity={2}
				>
					<div
						class="relative h-full w-full rounded-full border-4 border-[#d3d3d3] bg-[#f9f9f9] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
					>
						<div
							class="absolute top-1/2 right-[40px] size-[400px] -translate-y-1/2 rounded-full bg-[#60a5fa] shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
						></div>
					</div>
				</FlameWrap>
				<!-- Knob fire as a sibling above the outer FlameWrap, not inside
				     it: inside, its oversized canvas overflows the capture
				     wrapper (overflow: auto → scrollbars) and the flames get
				     clipped at the pill's top edge. Out here it composites over
				     the burning pill instead. right-[44px] = the knob's 40px
				     inset plus the track's 4px border. -->
				<div
					class="pointer-events-none absolute top-1/2 right-[44px] size-[400px] -translate-y-1/2"
				>
					<FlameWrap
						class="h-full w-full"
						color={[0.231, 0.51, 0.965]}
						radius={200}
						height={200}
						spread={14}
						scale={0.75}
						intensity={0.85}
						speed={0.3}
						sparks={2}
						sparkDensity={1.5}
						distortion={5}
						smoke={0.8}
						ember={1.5}
					/>
				</div>
			</div>
		{:else if thumbnailCookies}
			<!-- The cookie consent banner, whole thing ablaze — no split.
			     Orange Blaze across the whole stage, banner sunk below center
			     like the full-form for flame headroom. -->
			<div class="absolute inset-0">
				<Blaze
					class="h-full w-full"
					layers={3}
					distortion={0}
					sparkColor={[0.976, 0.451, 0.086]}
					smokeColor={[0.586, 0.271, 0.052]}
				/>
			</div>
			<div
				class="absolute top-[calc(50%+8vh)] left-1/2 h-[480px] w-[1600px] -translate-x-1/2 -translate-y-1/2"
			>
				<FlameWrap
					class="h-full w-full"
					color={[0.976, 0.451, 0.086]}
					radius={48}
					height={420}
					spread={24}
					scale={0.65}
					intensity={1}
					sparks={2.5}
					sparkDensity={2}
				>
					<CookieBanner />
				</FlameWrap>
			</div>
		{:else if thumbnailSearch}
			<!-- One pill XXL search input split across the divider — same
			     pinned-to-center px formula as the other splits, plain left
			     half, burning right half. FlameWrap's radius matches the pill
			     (half the input height) so the flames trace the rounded
			     silhouette. -->
			{#snippet searchInput()}
				<div class="relative h-full w-full">
					<svg
						class="absolute top-1/2 left-20 size-20 -translate-y-1/2 text-white/35"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="7" />
						<path d="m21 21-4.3-4.3" />
					</svg>
					<input
						class="h-full w-full rounded-full border-3 border-white/15 bg-white/5 pr-20 pl-48 font-sans text-7xl text-white outline-none placeholder:text-white/30 focus:border-blue-400/55"
						type="text"
						placeholder="Search anything..."
					/>
				</div>
			{/snippet}
			<div class="absolute inset-y-0 left-0 w-1/2 overflow-clip">
				<div class="absolute top-1/2 right-0 h-[220px] w-[1600px] translate-x-1/2 -translate-y-1/2">
					{@render searchInput()}
				</div>
			</div>
			<div class="absolute inset-y-0 right-0 w-1/2 overflow-clip">
				<div class="absolute top-1/2 left-0 h-[220px] w-[1600px] -translate-x-1/2 -translate-y-1/2">
					<FlameWrap
						class="h-full w-full"
						color={[0.231, 0.51, 0.965]}
						radius={110}
						height={360}
						spread={24}
						scale={0.65}
						intensity={0.9}
						sparks={2}
						sparkDensity={1.5}
					>
						{@render searchInput()}
					</FlameWrap>
				</div>
			</div>
		{:else}
			<div class="absolute inset-y-0 left-0 w-1/2 overflow-clip">
				<div class="absolute top-1/2 right-0 h-[900px] w-[1800px] translate-x-1/2 -translate-y-1/2">
					<CheckoutForm scale={1.5} />
				</div>
			</div>
			<div class="absolute inset-y-0 right-0 w-1/2 overflow-clip">
				<div class="absolute top-1/2 left-0 h-[900px] w-[1800px] -translate-x-1/2 -translate-y-1/2">
					<FlameWrap
						class="h-full w-full"
						color={[0.231, 0.51, 0.965]}
						radius={72}
						height={480}
						spread={32}
						scale={0.55}
						intensity={1}
						sparks={2.5}
						sparkDensity={2}
					>
						<CheckoutForm scale={1.5} inputFlames="overlay" />
					</FlameWrap>
				</div>
			</div>
		{/if}
		{#if thumbnailSplit && !thumbnailCursor}
			<div class="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 bg-white"></div>
		{/if}
	</div>
{:else}
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

	<div class="fixed inset-0 -z-10">
		<Blaze class="h-full w-full" layers={3} distortion={0} sparkColor={accent} smokeColor={smoke} />
	</div>

	<div bind:this={liquidLayer} class="pointer-events-none fixed inset-0 -z-10">
		<Liquid class="h-full w-full" standalone color={accent} />
	</div>

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
{/if}
