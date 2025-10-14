# TS ProductList with Cart — TypeScript Setup

This repository contains a minimal TypeScript setup for an existing HTML/CSS static site. It uses pnpm as the package manager.

Quick start (Windows, bash.exe):

1. Install dependencies (pnpm must be installed globally):

```bash
pnpm install -D typescript serve
```

2. Build once:

```bash
pnpm build
```

3. Open the site locally:

```bash
pnpm serve
# then visit http://localhost:5000
```

Development:

```bash
pnpm install
pnpm dev
```

Files added:
- `tsconfig.json` — TypeScript compiler options, outputs to `public/dist`.
- `package.json` — scripts for building, watching and serving (uses `serve`).
- `src/index.ts` — example TypeScript entry and small product-list mount function.
- `public/index.html` — updated to load compiled `dist/index.js` as a module.
- `public/styles.css` — minimal styles.

Next steps / suggestions:
- Use a bundler (Vite, esbuild, Rollup) for advanced workflows and production builds.
- Add ESLint/Prettier for linting and formatting.
- If you already have JS files, convert them to `.ts` and fix type errors gradually.
