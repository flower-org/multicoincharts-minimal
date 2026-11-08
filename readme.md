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

## Testing the build by hand

Serve the source and the minified build side by side:

```bash
python3 -m http.server 8001                  # original source
python3 -m http.server 8002 --directory dist  # minified build
```

Open http://localhost:8001 and http://localhost:8002 with the browser console open and check both behave the same,
with no console errors:

1. `/` – charts load; add/remove chart, Width/Height, Settings, Rearrange and Share work.
2. Settings persist after reload (each port has its own localStorage).
3. `/home/` – hero background and glowing headline are styled (scoped CSS) and the dropdown works.
4. `/adv-scanner.html`, `/about.html` and the `/about/` pages render and their links work.
5. Favicon is shown.

Note: `http.server` doesn't resolve extensionless links such as `/adv-scanner`, so those return 404 on both ports.
