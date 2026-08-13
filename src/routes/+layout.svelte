<script lang="ts">
	import "./layout.css";

	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();

	const title = "Canvas UI - The Burning Music Player";
	const description =
		"A live music player riding a floating glass slab, wrapped in flames, over drifting hex tiles, rising sparks, and cursor-stirred fluid. Ten WebGL effects from the canvasui.dev registry in one composition.";
	const url = "https://canvas-ui.hyperplexed.io";
	const image = `${url}/og.png`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="theme-color" content="#0a0a0a" />
	<link rel="icon" href={favicon} />

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="2559" />
	<meta property="og:image:height" content="1439" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>

{@render children()}
