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

## GitHub Actions

### Reusable minify action

`.github/actions/minify/action.yml` runs `npm ci && npm run build` on the copy of the site that contains it and exposes
the result as the `dist-path` output.

```yaml
# Node.js must be set up by the caller
- uses: actions/setup-node@v4
  with:
    node-version: '22'

# In this repo
- uses: ./.github/actions/minify
  id: mcc

# From a repo that has this one as a submodule (builds exactly the pinned commit; requires checkout with submodules: true)
- uses: ./path/to/multicoincharts-minimal/.github/actions/minify
  id: mcc

# From any other repo
- uses: flower-org/multicoincharts-minimal/.github/actions/minify@<tag-or-sha>
  id: mcc

- run: ls ${{ steps.mcc.outputs.dist-path }}
```

No inputs. The action contains no nested actions on purpose: a nested action with a post step (like `setup-node`) makes
the runner re-read this `action.yml` at job end, which fails if the caller has deleted the site sources by then.

### Release

Pushing a version tag (e.g. `1.0.0`) runs `.github/workflows/release.yml`, which builds with the action above and
attaches `multicoincharts-<tag>.zip` to a GitHub Release:

```bash
git tag 1.0.0 && git push origin 1.0.0
```
