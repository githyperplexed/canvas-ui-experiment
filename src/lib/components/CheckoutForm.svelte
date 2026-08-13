<script lang="ts">
	import FlameWrap from "$lib/components/canvasui/FlameWrap.svelte";

	interface Props {
		/**
		 * Flame treatment for the inputs and the pay button. "overlay" renders
		 * a childless FlameWrap above each control — the fire is self-generated
		 * from the rect, so nothing depends on capturing content, and the outer
		 * FlameWrap only ever rasterizes a plain canvas (same as GlyphRain).
		 * "nested" puts the control inside its own FlameWrap capture — a
		 * capture-inside-capture, untested against the browser API.
		 */
		inputFlames?: "none" | "overlay" | "nested";
		/** Internal layout scale multiplier — same trick as --receipt-scale. */
		scale?: number;
	}

	let { inputFlames = "none", scale = 1 }: Props = $props();

	// Same blue as the thumbnail's outer FlameWrap.
	const inputFlame = $derived({
		color: [0.231, 0.51, 0.965] as [number, number, number],
		radius: 16 * scale,
		height: 80 * scale,
		spread: 10 * scale,
		scale: 0.9,
		intensity: 0.7,
		speed: 0.3,
		turbulenceReach: 12 * scale,
		sparks: 1.2,
		sparkSize: 0.28,
		sparkDensity: 1.3,
		melt: 3 * scale,
		distortion: 5 * scale,
		smoke: 0.8,
		ember: 1.5
	});
</script>

{#snippet field(label: string, placeholder: string, type: string)}
	<div class="form__field">
		<p class="form__label">{label}</p>
		<div class="form__shell">
			{#if inputFlames === "nested"}
				<FlameWrap class="h-full w-full" {...inputFlame}>
					<input class="form__input" {type} {placeholder} />
				</FlameWrap>
			{:else}
				<input class="form__input" {type} {placeholder} />
				{#if inputFlames === "overlay"}
					<div class="form__flame">
						<FlameWrap class="h-full w-full" {...inputFlame} />
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/snippet}

<form class="form" style="--form-scale: {scale}" onsubmit={(e) => e.preventDefault()}>
	<div class="form__head">
		<div>
			<p class="form__title">Payment details</p>
			<p class="form__order">Northwind Goods · Order #NW-4821</p>
		</div>
		<span class="form__chip">Secure</span>
	</div>

	<hr class="form__rule" />

	<!-- The column gap straddles the card's horizontal center, so the split
	     divider only ever cuts the deliberately full-width rows — the card
	     number and the pay button — half plain, half burning. -->
	<div class="form__grid">
		<div class="form__wide">{@render field("Card number", "4242 4242 4242 4242", "text")}</div>
		{@render field("Expiry", "08 / 28", "text")}
		{@render field("CVC", "123", "text")}
	</div>

	<div class="form__submit-shell">
		{#if inputFlames === "nested"}
			<FlameWrap class="h-full w-full" {...inputFlame} radius={999}>
				<button class="form__submit" type="submit">Pay $128.40</button>
			</FlameWrap>
		{:else}
			<button class="form__submit" type="submit">Pay $128.40</button>
			{#if inputFlames === "overlay"}
				<div class="form__flame">
					<FlameWrap class="h-full w-full" {...inputFlame} radius={999} />
				</div>
			{/if}
		{/if}
	</div>
</form>

<style>
	/* Every internal dimension multiplies by --form-scale (default 1),
	   mirroring the Receipt's --receipt-scale system — real layout scaling,
	   so nested effect canvases stay sharp. The card itself fills its
	   wrapper: the caller sizes it (1200×600 landscape design, so 1800×900
	   at scale 1.5). Filling 100% instead of self-sizing keeps the form
	   from ever overflowing FlameWrap's overflow-auto content wrapper by a
	   rounding pixel — which is what spawned the phantom scrollbars. */
	.form {
		--s: var(--form-scale, 1);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		padding: calc(var(--s) * 56px);
		border-radius: calc(var(--s) * 48px);
		background: #0a0a0a;
		color: #fff;
		font-family: Lexend, ui-sans-serif, system-ui, sans-serif;
		-webkit-font-smoothing: antialiased;
	}
	.form :global(*) {
		box-sizing: border-box;
		margin: 0;
	}

	/* Header */
	.form__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}
	.form__title {
		font-size: calc(var(--s) * 40px);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
	.form__order {
		margin-top: calc(var(--s) * 6px);
		font-size: calc(var(--s) * 22px);
		color: rgba(255, 255, 255, 0.35);
		line-height: 1.3;
	}
	.form__chip {
		padding: calc(var(--s) * 8px) calc(var(--s) * 20px);
		border: calc(var(--s) * 2px) solid rgba(96, 165, 250, 0.3);
		border-radius: 9999px;
		background: rgba(59, 130, 246, 0.15);
		color: #93c5fd;
		font-size: calc(var(--s) * 20px);
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* Dashed rule */
	.form__rule {
		margin: calc(var(--s) * 16px) 0 0;
		border: 0;
		border-top: calc(var(--s) * 2px) dashed rgba(255, 255, 255, 0.15);
	}

	/* Fields */
	.form__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: calc(var(--s) * 64px);
		/* Guaranteed minimum gap above the submit button; its margin-top: auto
		   only absorbs whatever slack is left, which can be zero. */
		margin-bottom: calc(var(--s) * 24px);
	}
	.form__wide {
		grid-column: 1 / -1;
	}
	.form__field {
		margin-top: calc(var(--s) * 16px);
	}
	.form__label {
		font-size: calc(var(--s) * 20px);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.35);
		line-height: 1.3;
	}
	.form__shell {
		position: relative;
		margin-top: calc(var(--s) * 10px);
		height: calc(var(--s) * 80px);
	}
	.form__input {
		width: 100%;
		height: 100%;
		padding: 0 calc(var(--s) * 26px);
		border: calc(var(--s) * 2px) solid rgba(255, 255, 255, 0.14);
		border-radius: calc(var(--s) * 16px);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		font: inherit;
		font-size: calc(var(--s) * 26px);
		outline: none;
	}
	.form__input::placeholder {
		color: rgba(255, 255, 255, 0.28);
	}
	.form__input:focus {
		border-color: rgba(96, 165, 250, 0.55);
	}
	.form__flame {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	/* Submit */
	.form__submit-shell {
		position: relative;
		margin-top: auto;
		height: calc(var(--s) * 80px);
	}
	.form__submit {
		width: 100%;
		height: 100%;
		border: 0;
		border-radius: 9999px;
		background: #fff;
		color: #0a0a0a;
		font-family: inherit;
		font-size: calc(var(--s) * 24px);
		font-weight: 600;
		letter-spacing: 0.05em;
		cursor: pointer;
	}
	.form__submit:hover {
		background: rgba(255, 255, 255, 0.9);
	}
</style>
