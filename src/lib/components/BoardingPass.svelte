<div class="pass">
	<div class="pass__head">
		<div>
			<p class="pass__airline">Northwind Air</p>
			<p class="pass__flight">Flight NW-482 · Aug 3, 2026</p>
		</div>
		<span class="pass__chip">Boarding</span>
	</div>

	<div class="pass__route-block">
		<p class="pass__label">Route</p>
		<p class="pass__route">DLH → AUS</p>
	</div>

	<hr class="pass__rule" />

	<dl class="pass__rows">
		<div class="pass__row">
			<dt>Passenger</dt>
			<dd>Jordan Avery</dd>
		</div>
		<div class="pass__row">
			<dt>Class</dt>
			<dd>Economy · Window</dd>
		</div>
	</dl>

	<hr class="pass__rule" />

	<div>
		<p class="pass__code-label">Confirmation code</p>
		<input class="pass__input" type="text" placeholder="NW-4821" />
	</div>

	<div class="pass__footer">
		<div class="pass__barcode"></div>
		<p class="pass__conf">Gate B7 · Boards 7:45 PM</p>
	</div>
</div>

<style>
	/* Every dimension multiplies by --pass-scale (default 1), set by any
	   ancestor — same system as the Receipt. Real layout scaling, so nested
	   effect canvases stay sharp. */
	.pass {
		--s: var(--pass-scale, 1);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		width: calc(var(--s) * 720px);
		height: calc(var(--s) * 960px);
		padding: calc(var(--s) * 56px);
		border-radius: calc(var(--s) * 48px);
		background: #0a0a0a;
		color: #fff;
		font-family: Lexend, ui-sans-serif, system-ui, sans-serif;
		-webkit-font-smoothing: antialiased;
	}
	.pass :global(*) {
		box-sizing: border-box;
		margin: 0;
	}

	/* Header */
	.pass__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}
	.pass__airline {
		font-size: calc(var(--s) * 28px);
		font-weight: 500;
	}
	.pass__flight {
		margin-top: calc(var(--s) * 4px);
		font-size: calc(var(--s) * 22px);
		color: rgba(255, 255, 255, 0.35);
	}
	.pass__chip {
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

	/* Route */
	.pass__route-block {
		margin-top: calc(var(--s) * 64px);
	}
	.pass__label {
		font-size: calc(var(--s) * 22px);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.35);
	}
	.pass__route {
		margin-top: calc(var(--s) * 16px);
		font-size: calc(var(--s) * 72px);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.025em;
	}

	/* Dashed rules */
	.pass__rule {
		margin: calc(var(--s) * 48px) 0;
		border: 0;
		border-top: calc(var(--s) * 2px) dashed rgba(255, 255, 255, 0.15);
	}

	/* Detail rows */
	.pass__rows {
		font-size: calc(var(--s) * 28px);
	}
	.pass__row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}
	.pass__row + .pass__row {
		margin-top: calc(var(--s) * 28px);
	}
	.pass__row dt {
		color: rgba(255, 255, 255, 0.4);
	}
	.pass__row dd {
		margin: 0;
		color: rgba(255, 255, 255, 0.85);
	}

	/* Confirmation code */
	.pass__code-label {
		font-size: calc(var(--s) * 20px);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.3);
	}
	.pass__input {
		width: 100%;
		height: calc(var(--s) * 88px);
		margin-top: calc(var(--s) * 12px);
		padding: 0 calc(var(--s) * 24px);
		border: calc(var(--s) * 2px) solid rgba(255, 255, 255, 0.14);
		border-radius: calc(var(--s) * 16px);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		font: inherit;
		font-size: calc(var(--s) * 28px);
		letter-spacing: 0.08em;
		outline: none;
	}
	.pass__input::placeholder {
		color: rgba(255, 255, 255, 0.28);
	}
	.pass__input:focus {
		border-color: rgba(96, 165, 250, 0.55);
	}

	/* Barcode footer — two overlaid bar periods give a pseudo-random
	   barcode texture whose fine detail rewards the magnify lens. */
	.pass__footer {
		margin-top: auto;
	}
	.pass__barcode {
		height: calc(var(--s) * 64px);
		border-radius: calc(var(--s) * 4px);
		background:
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.85) 0,
				rgba(255, 255, 255, 0.85) calc(var(--s) * 2px),
				transparent calc(var(--s) * 2px),
				transparent calc(var(--s) * 6px)
			),
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.85) 0,
				rgba(255, 255, 255, 0.85) calc(var(--s) * 4px),
				transparent calc(var(--s) * 4px),
				transparent calc(var(--s) * 13px)
			);
	}
	.pass__conf {
		margin-top: calc(var(--s) * 16px);
		text-align: center;
		font-size: calc(var(--s) * 20px);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.25);
	}
</style>
