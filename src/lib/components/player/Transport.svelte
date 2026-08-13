<script lang="ts">
	import { player } from "$lib/player.svelte";

	import pauseIcon from "$lib/assets/icons/pause.svg?raw";
	import playIcon from "$lib/assets/icons/play.svg?raw";
	import skipBackIcon from "$lib/assets/icons/skip-back.svg?raw";
	import skipForwardIcon from "$lib/assets/icons/skip-forward.svg?raw";
</script>

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
