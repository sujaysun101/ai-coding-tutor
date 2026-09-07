<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>PHOSPHOR · Night School for Code</title>
	<meta
		name="description"
		content="A CRT night-school coding tutor. Socratic lessons on a phosphor terminal — not another SaaS dashboard."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Share+Tech+Mono&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="crt-root">
	<div class="crt-bezel">
		<div class="crt-glass">
			<div class="scanlines" aria-hidden="true"></div>
			<div class="vignette" aria-hidden="true"></div>
			<div class="beam" aria-hidden="true"></div>
			{@render children()}
		</div>
	</div>
</div>
