# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on port 8080
- `npm run build` — production build to `dist/`
- `npm run build:gh-pages` — build with `/csv-diff/` base path (matches the deployed site)
- `npm run lint` — ESLint
- `npm run preview` — serve the built `dist/`

Node 24 is required (`.nvmrc`; CI reads it). There is no test runner configured. TypeScript runs in non-strict mode (`strict`, `noImplicitAny` off in `tsconfig.app.json`); `vite build` does not type-check, so run `npx tsc -p tsconfig.app.json --noEmit` to check types. TypeScript 7 and 6 are installed side by side: `@typescript/native` (an npm alias of `typescript@7`) provides `tsc`, while the `typescript` package name is aliased to `@typescript/typescript6` because TS 7.0 has no programmatic API and `typescript-eslint` still needs the 6.0 API. Keep both aliases until `typescript-eslint` supports TS 7.

## Architecture

Fully client-side React 19 + TypeScript app (Vite 8, Tailwind CSS 4, shadcn/ui, react-router 8). No backend: files are parsed and diffed in the browser.

Data flow: `pages/Index.tsx` holds the two `File`s → `lib/csvParser.ts` (PapaParse, `header: true`) turns each into `{ headers, rows: Record<string,string>[] }` → `lib/diffEngine.ts` `compareCSVs()` produces a `DiffResult` → `components/ComparisonResults.tsx` renders summary cards, column diff badges, type filters and export menu → `components/DiffTable.tsx` renders rows with `@tanstack/react-virtual` (fixed 600px scroll container, ~45px row estimate).

### Diff engine semantics (`lib/diffEngine.ts`)

- Rows are matched by joining values of the **common columns** (headers present in both files) into a string; each File A row takes the first File B row with an identical hash (O(n·m) linear scan). Unmatched A rows are `removed`; leftover B rows are `added`.
- Because matching uses all common columns, a changed value in a common column shows up as a `removed` + `added` pair, not `modified`. `modified` only arises when matched rows differ in columns present in just one file.
- There is no key-column matching despite the README mentioning "optional key columns".
- `rowData` for modified rows is `{ ...rowA, ...rowB }`; `changedCells` lists per-column old/new values used by `DiffTable` for cell highlighting.

### Presentation and theming

- `lib/diffPresentation.ts` (`DIFF_TYPE_META`, `DIFF_TYPE_ORDER`) is the single source of labels and Tailwind classes per diff type — use it rather than hard-coding colors in components.
- Tailwind CSS 4 is configured entirely in `src/index.css` (no `tailwind.config.*`; loaded via `@tailwindcss/vite`). Diff colors are theme tokens (`--color-added`, `--color-added-light`, `--color-added-foreground`, and the same for `removed`/`modified`/`unchanged`) declared in `@theme inline` and backed by HSL CSS variables in `:root` / `.dark`. Animations for Radix menus and toasts come from `tw-animate-css`.
- `components/ui/` contains shadcn/ui primitives (`components.json` config); `@/` aliases `src/`.

### Export (`lib/exportUtils.ts`)

CSV, JSON and Excel (ExcelJS) exports share helpers for the report header, summary and comparison rows, and download via a temporary object URL.

## Deployment

`.github/workflows/deploy-pages.yml` builds on push to `main` with `VITE_BASE_PATH=/csv-diff/` and copies `index.html` to `404.html` as the SPA fallback. `vite.config.ts` reads `VITE_BASE_PATH` for `base`, and `App.tsx` derives the `BrowserRouter` `basename` from `import.meta.env.BASE_URL` — keep these in sync when changing routing or hosting paths.
