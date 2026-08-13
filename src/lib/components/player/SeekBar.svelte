<script lang="ts">
	import { player } from "$lib/player.svelte";

	const format = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	const seek = (event: MouseEvent) => {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		player.seek((event.clientX - rect.left) / rect.width);
	};
</script>

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
