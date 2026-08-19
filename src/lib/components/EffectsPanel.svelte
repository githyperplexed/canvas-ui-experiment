<script lang="ts">
	import { fade } from "svelte/transition";

	import { player } from "$lib/player.svelte";

	import { cn } from "$lib/utilities/cn";
	import { rgbCss } from "$lib/utilities/color";

	import { EFFECT_GROUPS, effectsOn } from "$lib/effects.svelte";

	let open = $state(false);
</script>

<!-- pointer-events-none on the container, auto on the controls, so
     GlassObject's pointer routing lets them click while the space around
     them still drags to orbit (same trick as the footer links). accent-color
     is inherited, so setting it here tints every checkbox to the live song
     accent. -->
<div
	class="pointer-events-none fixed top-6 right-6 z-20 flex flex-col items-end gap-3 font-sans"
	style="accent-color: {rgbCss(player.accent.current)}"
>
	<button
		type="button"
		class={cn(
			"pointer-events-auto grid size-11 place-items-center rounded-full border border-white/10 bg-neutral-900/80 text-white/60 backdrop-blur transition-colors hover:bg-neutral-800/80 hover:text-white",
			open && "bg-neutral-800/80 text-white"
		)}
		aria-label="Effect settings"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
			/>
			<circle cx="12" cy="12" r="3" />
		</svg>
	</button>

	{#if open}
		<div
			class="pointer-events-auto w-64 rounded-2xl border border-white/10 bg-neutral-900/90 p-4 shadow-2xl backdrop-blur"
			transition:fade={{ duration: 150 }}
		>
			{#each EFFECT_GROUPS as group (group.title)}
				<p class="px-2 pt-3 text-xs tracking-widest text-white/35 uppercase first:pt-0">
					{group.title}
				</p>
				<ul class="mt-1 flex flex-col">
					{#each group.effects as effect (effect.key)}
						<li>
							<label
								class="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5"
							>
								<input type="checkbox" class="mt-0.5 size-4" bind:checked={effectsOn[effect.key]} />
								<span class="flex flex-col">
									<span class="text-sm leading-5 text-white">{effect.label}</span>
									<span class="text-xs text-white/35">{effect.note}</span>
								</span>
							</label>
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	{/if}
</div>
