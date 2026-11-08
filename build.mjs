// Builds a minified copy of the site into dist/, preserving the source layout so all paths keep working.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify as minifyJs } from 'terser';
import { transform as transformCss, transformStyleAttribute } from 'lightningcss';
import { minify as minifyHtml } from 'html-minifier-terser';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');

const EXCLUDE = new Set([
    '.git', '.github', '.idea', '.vscode', 'node_modules', 'dist',
    '.gitignore', '.DS_Store', 'package.json', 'package-lock.json',
    'build.mjs', 'readme.md',
]);

// Top-level names must survive: HTML event handlers and other scripts reference them as globals.
const TERSER_OPTIONS = { compress: true, mangle: true, toplevel: false, format: { comments: false } };

function minifyCssText(code, filename) {
    return transformCss({ filename, code: Buffer.from(code), minify: true }).code.toString();
}

async function minifyHtmlText(code, filename) {
    return minifyHtml(code, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true,
        useShortDoctype: true,
        minifyJS: TERSER_OPTIONS,
        minifyCSS: (text, type) => {
            // Scoped-css blocks use a literal `\&` placeholder that is replaced at runtime; leave them untouched.
            if (text.includes('\\&')) return text;
            try {
                if (type === 'inline') {
                    return transformStyleAttribute({ code: Buffer.from(text), minify: true }).code.toString();
                }
                return minifyCssText(text, filename);
            } catch (e) {
                console.warn(`  ! ${filename}: inline CSS left as-is (${e.message})`);
                return text;
            }
        },
    });
}

async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (EXCLUDE.has(entry.name)) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(full);
        else if (entry.isFile()) yield full;
    }
}

async function build() {
    await rm(OUT, { recursive: true, force: true });
    let before = 0, after = 0;

    for await (const src of walk(ROOT)) {
        const rel = relative(ROOT, src);
        const dest = join(OUT, rel);
        await mkdir(dirname(dest), { recursive: true });

        const ext = extname(src).toLowerCase();
        if (!['.js', '.css', '.html'].includes(ext)) {
            await cp(src, dest);
            continue;
        }

        const code = await readFile(src, 'utf8');
        let out;
        if (ext === '.js') {
            const result = await minifyJs(code, { ...TERSER_OPTIONS, module: /^\s*(import|export)\b/m.test(code) });
            out = result.code;
        } else if (ext === '.css') {
            out = minifyCssText(code, rel);
        } else {
            out = await minifyHtmlText(code, rel);
        }
        await writeFile(dest, out);

        const a = Buffer.byteLength(code), b = Buffer.byteLength(out);
        before += a; after += b;
        console.log(`  ${rel}: ${a} -> ${b}`);
    }

    console.log(`Minified text assets: ${before} -> ${after} bytes. Output: ${relative(process.cwd(), OUT) || OUT}`);
}

build().catch(e => {
    console.error(e);
    process.exit(1);
});
