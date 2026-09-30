/**
 * Assert that every asset path in the built index.html sits under the base the
 * site will actually be served from.
 *
 * WHY THIS EXISTS
 * ---------------
 * Verified live on 2026-09-30: https://markkramm.github.io/vibecoding/ was serving
 * a BLANK page. Its HTML requested `/assets/index-<hash>.js`, which returns 404,
 * while `/vibecoding/assets/index-<hash>.js` returns the 389 KB bundle. The
 * deployed build had not had `VITE_BASE` applied, so every asset URL was
 * absolute, every one 404'd, and `#root` never rendered. The project README
 * advertises that exact URL as the way to read the curriculum.
 *
 * WHY NOTHING ELSE CAUGHT IT
 * -------------------------
 * Every check in this repository — `npm test` and all 21 of its steps included —
 * runs against a preview served from `/`, where `/assets/...` is correct. A build
 * with the wrong base therefore passes all of them. The failure only exists when
 * the artifact is served from a SUBPATH, which is exactly the condition no local
 * check reproduces. The gap is not that a check was missing a rule; it is that
 * the local environment and the deployed environment disagree, and nothing
 * compared them.
 *
 * The fix is to compare them. This reads the base out of the environment and the
 * asset paths out of the artifact, and fails when they disagree. Run it in CI
 * with the deploy base set, and it turns "publishes a blank page" into "fails the
 * job".
 *
 * It is also wired into `npm test`, where the base is `/` and it passes — so a
 * change that started emitting doubled or relative paths would be caught locally
 * too, rather than only in a deploy.
 *
 * Usage:  node scripts/audit-base-paths.mjs [distDir]
 * Env:    VITE_BASE  (defaults to "/", matching vite.config.js)
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = resolve(process.argv[2] || join(SITE, 'dist'));

// Mirror vite.config.js exactly, so this and the build cannot disagree.
const rawBase = process.env.VITE_BASE || '/';
const base = rawBase.endsWith('/') ? rawBase : rawBase + '/';
const expectedPrefix = base + 'assets/';

const indexPath = join(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error(`\u2717 base-path audit could not run — ${indexPath} does not exist`);
  console.error('  The site must be built before this check. In CI it runs after `npm run build`.');
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');

// Every absolute-looking reference to an asset, from src and href attributes.
const found = [...html.matchAll(/["'](\/[^"']*assets\/[^"']*)["']/g)].map((m) => m[1]);
const unique = [...new Set(found)].sort();

console.log(`\n  base-path audit`);
console.log(`    deploy base : ${base}`);
console.log(`    artifact    : ${indexPath.replace(SITE, '.')}`);
console.log(`    asset paths : ${unique.length}`);

if (unique.length === 0) {
  console.error('\n\u2717 no asset paths found in the built index.html');
  console.error('  That means the build produced no references to check, which is itself a');
  console.error('  failure — an index.html with no script tag cannot render anything.');
  process.exit(1);
}

const offBase = unique.filter((p) => !p.startsWith(expectedPrefix));

if (offBase.length > 0) {
  console.error(`\n\u2717 ${offBase.length} asset path(s) fall OUTSIDE the deploy base '${base}'`);
  console.error('');
  offBase.forEach((p) => console.error(`    ${p}`));
  console.error('');
  console.error(`  Served from '${base}', each of these will 404, the bundle will never`);
  console.error('  execute, and the page will be BLANK — with no build error and no local');
  console.error('  test failure, because from `/` these paths are correct.');
  console.error('');
  console.error('  This is a real deployment incident, not a hypothetical: the live site was');
  console.error('  blank for exactly this reason on 2026-09-30.');
  console.error('');
  console.error('  Fix: build with VITE_BASE set to the path the site is served from.');
  process.exit(1);
}

console.log(`    all under    : ${expectedPrefix}`);
console.log('\n\u2713 base-path audit passed — every asset path is under the deploy base');
