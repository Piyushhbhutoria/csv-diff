# CSV Diff

Compare **CSV** files in the browser: row-level diff, cell-level changes, optional key columns, and export to **CSV**, **JSON**, or **Excel (.xlsx)**.

**Live site:** [piyushhbhutoria.github.io/csv-diff](https://piyushhbhutoria.github.io/csv-diff/)

## Development

Requires [Node.js](https://nodejs.org/) (LTS recommended) and npm.

```sh
git clone git@github.com:Piyushhbhutoria/csv-diff.git
cd csv-diff
npm install
npm run dev
```

## Build

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

### GitHub Pages

The repository includes a workflow that deploys to GitHub Pages. Use **Settings → Pages → Source: GitHub Actions**, then push to `main`.

To build the same output locally (with the `/csv-diff/` base path):

```sh
npm run build:gh-pages
```

## Stack

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
