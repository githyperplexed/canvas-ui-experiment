<div class="receipt">
	<div class="receipt__head">
		<div>
			<p class="receipt__merchant">Northwind Goods</p>
			<p class="receipt__order">Order #NW-4821</p>
		</div>
		<span class="receipt__chip">Paid</span>
	</div>

	<div class="receipt__amount-block">
		<p class="receipt__label">Amount paid</p>
		<p class="receipt__amount">$128.40</p>
	</div>

	<hr class="receipt__rule" />

	<dl class="receipt__rows">
		<div class="receipt__row">
			<dt>Date</dt>
			<dd>Aug 3, 2026</dd>
		</div>
		<div class="receipt__row">
			<dt>Payment</dt>
			<dd>Visa ···· 4242</dd>
		</div>
		<div class="receipt__row">
			<dt>Shipping</dt>
			<dd>Express · 2-day</dd>
		</div>
	</dl>

	<hr class="receipt__rule" />

	<div class="receipt__route">
		<div>
			<p class="receipt__route-label">From</p>
			<p class="receipt__route-value">Duluth, MN</p>
		</div>
		<div>
			<p class="receipt__route-label">To</p>
			<p class="receipt__route-value">Austin, TX</p>
		</div>
	</div>

	<p class="receipt__footer">Thank you for your order</p>
</div>

<style>
	/* Every dimension multiplies by --receipt-scale (default 1), set by any
	   ancestor. Real layout scaling, so nested effect canvases stay sharp. */
	.receipt {
		--s: var(--receipt-scale, 1);
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
	.receipt :global(*) {
		box-sizing: border-box;
		margin: 0;
	}

	/* Header */
	.receipt__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}
	.receipt__merchant {
		font-size: calc(var(--s) * 28px);
		font-weight: 500;
	}
	.receipt__order {
		margin-top: calc(var(--s) * 4px);
		font-size: calc(var(--s) * 22px);
		color: rgba(255, 255, 255, 0.35);
	}
	.receipt__chip {
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

	/* Amount */
	.receipt__amount-block {
		margin-top: calc(var(--s) * 64px);
	}
	.receipt__label {
		font-size: calc(var(--s) * 22px);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.35);
	}
	.receipt__amount {
		margin-top: calc(var(--s) * 16px);
		font-size: calc(var(--s) * 72px);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.025em;
	}

	/* Dashed rules */
	.receipt__rule {
		margin: calc(var(--s) * 48px) 0;
		border: 0;
		border-top: calc(var(--s) * 2px) dashed rgba(255, 255, 255, 0.15);
	}

	/* Detail rows */
	.receipt__rows {
		font-size: calc(var(--s) * 28px);
	}
	.receipt__row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}
	.receipt__row + .receipt__row {
		margin-top: calc(var(--s) * 28px);
	}
	.receipt__row dt {
		color: rgba(255, 255, 255, 0.4);
	}
	.receipt__row dd {
		margin: 0;
		color: rgba(255, 255, 255, 0.85);
	}

	/* From / To */
	.receipt__route {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: calc(var(--s) * 32px);
	}
	.receipt__route-label {
		font-size: calc(var(--s) * 20px);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.3);
	}
	.receipt__route-value {
		margin-top: calc(var(--s) * 12px);
		font-size: calc(var(--s) * 28px);
		color: rgba(255, 255, 255, 0.85);
	}

	/* Footer */
	.receipt__footer {
		margin-top: auto;
		padding-top: calc(var(--s) * 48px);
		text-align: center;
		font-size: calc(var(--s) * 20px);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.25);
	}
</style>
