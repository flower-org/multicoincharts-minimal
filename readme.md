# MultiCoinCharts - Crypto/Stocks Graph

A static site: open `index.html` through any static web server, no build step required.

## Minified build

Requires Node.js 20+.

```bash
npm ci
npm run build
```

Produces a minified copy of the site in `dist/` (JS via terser, CSS via lightningcss, HTML via html-minifier-terser),
keeping the same file layout so all paths keep working. Serve `dist/` from the site root.
