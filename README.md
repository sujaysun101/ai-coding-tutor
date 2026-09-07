# PHOSPHOR — night school for code

An AI coding tutor that looks like a CRT in an empty computer lab, not a React + Tailwind dashboard.

The stack is **SvelteKit 5**, **hand-rolled CSS**, and the **Anthropic** API. The visual language borrows from real phosphor terminals: [Phosphor UI](https://github.com/sektant1/phosphor-ui) palettes (P1 green, P3 amber, P7 cyan), [AmberConsole](https://github.com/DutchDiederik/AmberConsole) industrial amber plasma, and [Afterglow CRT](https://github.com/HauntedCrusader/afterglow-crt) scanlines, vignette, and a slow raster beam.

## Run locally

```bash
npm install
cp .env.example .env
# optional: set ANTHROPIC_API_KEY for the live tutor
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without an API key the bench still teaches in **local demo mode**, so you can use the UI immediately.

## Use it

1. Pick a language and level.
2. Ask a question. Paste a failing snippet if you have one.
3. Transmit (or press Ctrl/⌘ + Enter).
4. Switch phosphor palettes from the top bar.

Lessons stay in this browser via `localStorage`.

## Scripts

```bash
npm run dev      # night school on :3000
npm run build    # Vercel / adapter-vercel
npm run check    # svelte-check
npm run test     # tutor JSON parser
```

## Deploy

This project uses `@sveltejs/adapter-vercel`. Set `ANTHROPIC_API_KEY` in the host environment for live lessons.
