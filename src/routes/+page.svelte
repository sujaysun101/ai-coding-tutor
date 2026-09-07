<script lang="ts">
	import { onMount } from 'svelte';
	import {
		LANGUAGES,
		LEVELS,
		type PhosphorTheme,
		type TutorResponse
	} from '$lib/tutor';

	const BANNER = String.raw`
 ____  _   _  ___  ____  ____  _   _  ___  ____
|  _ \| | | |/ _ \/ ___||  _ \| | | |/ _ \|  _ \
| |_) | |_| | | | \___ \| |_) | |_| | | | | |_) |
|  __/|  _  | |_| |___) |  __/|  _  | |_| |  _ <
|_|   |_| |_|\___/|____/|_|   |_| |_|\___/|_| \_\
`;

	interface Lesson {
		id: string;
		askedAt: string;
		question: string;
		language: string;
		level: string;
		mode?: string;
		response: TutorResponse;
	}

	let question = $state('');
	let code = $state('');
	let language = $state('JavaScript');
	let level = $state('beginner');
	let loading = $state(false);
	let error = $state('');
	let theme = $state<PhosphorTheme>('phosphor');
	let lessons = $state<Lesson[]>([]);
	let activeId = $state<string | null>(null);
	let ready = $state(false);

	const active = $derived(lessons.find((item) => item.id === activeId) ?? lessons[0]);

	onMount(() => {
		const savedTheme = localStorage.getItem('phosphor-theme') as PhosphorTheme | null;
		if (savedTheme === 'phosphor' || savedTheme === 'amber' || savedTheme === 'cyan') {
			theme = savedTheme;
		}
		try {
			const saved = localStorage.getItem('phosphor-lessons');
			if (saved) {
				lessons = JSON.parse(saved) as Lesson[];
				activeId = lessons[0]?.id ?? null;
			}
		} catch {
			lessons = [];
		}
		ready = true;
	});

	$effect(() => {
		if (!ready) return;
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('phosphor-theme', theme);
		localStorage.setItem('phosphor-lessons', JSON.stringify(lessons.slice(0, 12)));
	});

	function setTheme(next: PhosphorTheme) {
		theme = next;
	}

	async function ask(event: SubmitEvent) {
		event.preventDefault();
		if (!question.trim() || loading) return;
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question, code, language, level })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Transmit failed');
			const lesson: Lesson = {
				id: crypto.randomUUID(),
				askedAt: new Date().toISOString(),
				question,
				language,
				level,
				mode: data.mode,
				response: data
			};
			lessons = [lesson, ...lessons].slice(0, 12);
			activeId = lesson.id;
		} catch (err) {
			error = err instanceof Error ? err.message : 'The bench went dark.';
		} finally {
			loading = false;
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			const form = (event.target as HTMLElement).closest('form');
			form?.requestSubmit();
		}
	}
</script>

<main class="lab">
	<header class="topbar">
		<div class="brand">
			<p>SYS.TUTOR · NIGHT SCHOOL · LAB 0x01</p>
			<h1>PHOSPHOR</h1>
		</div>
		<div class="theme-switch" role="group" aria-label="Phosphor palette">
			<button class:active={theme === 'phosphor'} onclick={() => setTheme('phosphor')}>P1 green</button>
			<button class:active={theme === 'amber'} onclick={() => setTheme('amber')}>P3 amber</button>
			<button class:active={theme === 'cyan'} onclick={() => setTheme('cyan')}>P7 cyan</button>
		</div>
	</header>

	<section class="workspace">
		<form class="panel" onsubmit={ask}>
			<h2>Ask the bench</h2>
			<p class="hint">A Socratic night-school instructor. Trace first. Answers second. Ctrl/⌘ + Enter to transmit.</p>
			<div class="row">
				<label>
					Language
					<select bind:value={language}>
						{#each LANGUAGES as item}
							<option value={item}>{item}</option>
						{/each}
					</select>
				</label>
				<label>
					Level
					<select bind:value={level}>
						{#each LEVELS as item}
							<option value={item}>{item}</option>
						{/each}
					</select>
				</label>
			</div>
			<label>
				Question
				<textarea bind:value={question} required rows="3" placeholder="Why does this loop skip the last item?" onkeydown={onKeydown}></textarea>
			</label>
			<label>
				Your code (optional)
				<textarea class="code" bind:value={code} rows="7" placeholder="paste the smallest failing snippet" onkeydown={onKeydown}></textarea>
			</label>
			<button class="primary" type="submit" disabled={loading || !question.trim()}>
				{loading ? 'tracing…' : 'transmit'}
			</button>
			{#if error}
				<div class="error">{error}</div>
			{/if}
			{#if lessons.length}
				<div>
					<p class="status">Session log</p>
					<div class="log">
						{#each lessons as lesson}
							<button type="button" onclick={() => (activeId = lesson.id)}>
								{lesson.language} · {lesson.question.slice(0, 48)}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</form>

		<article class="panel lesson">
			{#if loading}
				<pre class="banner pulse">{BANNER}
> waiting on the instructor…
</pre>
			{:else if active}
				<div>
					<p class="status">
						{active.mode === 'demo' ? 'LOCAL DEMO' : 'LIVE TUTOR'} · {active.language} · {active.level}
					</p>
					<h2>Lesson print</h2>
					<p>{active.response.explanation}</p>
					<div class="chips">
						<span class="chip">{active.response.difficulty}</span>
						{#each active.response.concepts as concept}
							<span class="chip">{concept}</span>
						{/each}
					</div>
				</div>
				{#if active.response.codeExample}
					<div>
						<p class="status">Worked example</p>
						<pre>{active.response.codeExample}</pre>
					</div>
				{/if}
				{#if active.response.commonMistakes.length}
					<div>
						<p class="status">Common mistakes</p>
						<ul class="list">
							{#each active.response.commonMistakes as mistake}
								<li>{mistake}</li>
							{/each}
						</ul>
					</div>
				{/if}
				{#if active.response.nextTopicsToLearn.length}
					<div>
						<p class="status">What to learn next</p>
						<ul class="list">
							{#each active.response.nextTopicsToLearn as topic}
								<li>{topic}</li>
							{/each}
						</ul>
					</div>
				{/if}
				<p class="encouragement">{active.response.encouragement}</p>
			{:else}
				<pre class="banner">{BANNER}
> phosphor night school is online
> palettes: P1 green · P3 amber · P7 cyan
> drop a question on the bench and sit with it
</pre>
			{/if}
		</article>
	</section>
</main>
