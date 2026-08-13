<script lang="ts">
	import { cn } from "$lib/utilities/cn";

	import playIcon from "$lib/assets/icons/play.svg?raw";
	import skipBackIcon from "$lib/assets/icons/skip-back.svg?raw";
	import skipForwardIcon from "$lib/assets/icons/skip-forward.svg?raw";

	// The static, effect-free music card with every item individually
	// revealable. The card shell itself grows first — tiny square, then full
	// width, then full height — and only then do the contents arrive. The
	// full layout always renders — unrevealed items are `invisible` so all
	// space stays reserved and nothing ever reflows; a revealed item pops
	// into its final resting spot.
	//
	// Reveal indices: 1 full width, 2 full height, 3 now-playing label,
	// 4 heading, 5 chip, 6 art, 7 song title, 8 artist, 9 progress bar,
	// 10 time row, 11 rule, 12 back button, 13 play button, 14 next button,
	// 15 up next, 16 shimmer.
	let { reveal = 16 }: { reveal?: number } = $props();

	const cls = (i: number) => (reveal >= i ? "reveal-in" : "invisible");
</script>

<div
	class={cn(
		"relative isolate flex flex-col overflow-hidden rounded-[64px] bg-neutral-950 p-28 font-sans text-white antialiased",
		"transition-[width,height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
		reveal >= 1 ? "w-360" : "w-60",
		reveal >= 2 ? "h-480" : "h-60"
	)}
	style="--accent: rgb(168 85 247)"
>
	<div class="flex items-start justify-between">
		<div>
			<p class="{cls(3)} text-[40px] tracking-widest text-white/35 uppercase">Now playing</p>
			<p class="{cls(4)} mt-4 text-[60px] font-medium">Late Night Drive</p>
		</div>
		<span
			class="{cls(
				5
			)} rounded-full bg-white/10 px-10 py-4 text-[40px] font-medium tracking-wider whitespace-nowrap text-white/55 uppercase"
		>
			Paused
		</span>
	</div>

	<div class="{cls(6)} relative mt-24 aspect-square w-full overflow-hidden rounded-[48px]">
		<img
			src="/art/midnight-static.jpg"
			alt="Midnight Static album art"
			draggable="false"
			class="absolute inset-0 h-full w-full object-cover contrast-110 grayscale"
		/>
		<div class="pointer-events-none absolute inset-0 bg-(--accent) mix-blend-color"></div>
	</div>

	<div class="mt-24">
		<p class="{cls(7)} text-8xl font-semibold tracking-tight">Midnight Static</p>
		<p class="{cls(8)} mt-4 text-5xl text-white/40">Neon Coast · Signal Bloom</p>
	</div>

	<div class="mt-20">
		<div class="{cls(9)} h-5 w-full overflow-hidden rounded-full bg-white/10">
			<span class="block h-full w-[33%] rounded-full bg-(--accent)"></span>
		</div>
		<div class="{cls(10)} mt-6 flex justify-between text-[40px] text-white/35">
			<span>1:14</span>
			<span>3:47</span>
		</div>
	</div>

	<hr class="{cls(11)} my-20 border-t-4 border-dashed border-white/15" />

	<div class="flex items-center justify-center gap-28">
		<button
			class="{cls(
				12
			)} flex size-44 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
			aria-label="Previous track"
		>
			<span class="flex *:size-18">{@html skipBackIcon}</span>
		</button>
		<button
			class="{cls(
				13
			)} flex size-48 cursor-pointer items-center justify-center rounded-full bg-white text-neutral-950 transition-transform hover:scale-105"
			aria-label="Play"
		>
			<span class="ml-2 flex *:size-22">{@html playIcon}</span>
		</button>
		<button
			class="{cls(
				14
			)} flex size-44 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
			aria-label="Next track"
		>
			<span class="flex *:size-18">{@html skipForwardIcon}</span>
		</button>
	</div>

	<p
		class="{cls(15)} mt-auto pt-20 text-center text-[40px] tracking-widest text-white/25 uppercase"
	>
		Up next · Sundowner
	</p>

	<div class="{cls(16)} mt-16">
		<div class="mx-auto h-1 w-64 bg-linear-to-r from-transparent via-white/15 to-transparent"></div>
	</div>
</div>

<style>
	.reveal-in {
		animation: reveal-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes reveal-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
	}
</style>
