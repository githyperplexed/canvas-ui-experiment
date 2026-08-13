<script lang="ts">
	import BuildCard from "$lib/components/BuildCard.svelte";
	import { cn } from "$lib/utilities/cn";

	// Scenes group BuildCard's 16 reveal indices for the nav; `end` is the
	// last reveal in the scene. Playback is a single even rhythm: every
	// reveal — scene boundary or not — advances on the same beat, paced by
	// the slider. The first three scenes grow the card shell itself: tiny
	// square, full width, full height.
	const SCENES = [
		{ label: "Square", end: 0 },
		{ label: "Wide", end: 1 },
		{ label: "Tall", end: 2 },
		{ label: "Header", end: 4 },
		{ label: "Chip", end: 5 },
		{ label: "Art", end: 6 },
		{ label: "Title", end: 8 },
		{ label: "Progress", end: 10 },
		{ label: "Rule", end: 11 },
		{ label: "Transport", end: 14 },
		{ label: "Up next", end: 15 },
		{ label: "Shimmer", end: 16 }
	];
	const LAST = SCENES[SCENES.length - 1].end;

	let reveal = $state(0);
	let playing = $state(false);
	let interval = $state(400);

	const sceneIndex = $derived(SCENES.findIndex((scene) => reveal <= scene.end));

	// Chained timeout: re-runs on every reveal change, one beat per reveal.
	$effect(() => {
		if (!playing) return;
		if (reveal >= LAST) {
			playing = false;
			return;
		}
		const id = setTimeout(() => (reveal += 1), interval);
		return () => clearTimeout(id);
	});

	function toggle() {
		if (!playing && reveal >= LAST) reveal = 0;
		playing = !playing;
	}

	function goTo(i: number) {
		playing = false;
		reveal = SCENES[i].end;
	}
</script>

<!-- The card is authored at its giant native size (1440×1920) because it
     normally lives inside the GlassObject projection; scale it to fit the
     recording viewport. The soft vignette lifts the backdrop just enough that
     the card's #0a0a0a face reads against it from the first step. -->
<div
	class="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#1c1c1c,#000_72%)]"
>
	<div class="scale-[0.5]">
		<BuildCard {reveal} />
	</div>
</div>

<aside
	class="fixed top-1/2 left-8 w-56 -translate-y-1/2 rounded-3xl border border-white/10 bg-neutral-950/90 p-5 font-sans text-white"
>
	<button
		class="w-full cursor-pointer rounded-xl bg-white py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-white/90"
		onclick={toggle}
	>
		{playing ? "Pause" : "Play"}
	</button>

	<div class="mt-4">
		<input
			type="range"
			min="0"
			max="3000"
			step="100"
			bind:value={interval}
			class="w-full accent-white"
		/>
		<p class="mt-1 text-center text-xs text-white/50">{interval} ms / beat</p>
	</div>

	<div class="mt-4 grid grid-cols-6 gap-2">
		{#each SCENES as scene, i (scene.label)}
			<button
				class={cn(
					"cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors",
					i === sceneIndex
						? "bg-white text-neutral-950"
						: "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
				)}
				title={scene.label}
				onclick={() => goTo(i)}
			>
				{i + 1}
			</button>
		{/each}
	</div>
</aside>
