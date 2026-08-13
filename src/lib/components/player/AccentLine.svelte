<script lang="ts">
	import { fade } from "svelte/transition";

	import Laser from "$lib/components/canvasui/Laser.svelte";

	import { player } from "$lib/player.svelte";

	const accent = $derived(player.accent.current);
</script>

<!-- The small accent line under "Up next": a tapered gray shard while
     paused that ignites into a full laser beam with rising smoke when
     playback starts. -->
<div class="relative mt-16">
	<div class="mx-auto h-1 w-64 bg-linear-to-r from-transparent via-white/15 to-transparent"></div>
	{#if player.playing}
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
