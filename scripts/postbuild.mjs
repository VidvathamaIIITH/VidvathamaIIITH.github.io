/**
 * Post-build steps that need to know the deployment URL:
 *
 *  1. 404.html — GitHub Pages serves it for unknown paths. Copying index.html
 *     there lets /admin resolve on a hard refresh, which a plain SPA on Pages
 *     otherwise cannot do.
 *  2. sitemap.xml and robots.txt — written with the real site URL rather than
 *     a hard-coded one, so a project site and a user site both come out right.
 *  3. Canonical and og:url rewriting, for the same reason.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const base = (process.env.VITE_BASE_PATH ?? '/').replace(/\/*$/, '/');
// Hostnames are case-insensitive to resolve but case-SENSITIVE as canonical
// URLs. CI derives SITE_URL from github.repository_owner, which preserves the
// account's capitalisation ("VidvathamaIIITH"), so normalise the host here —
// Actions expressions have no lowercase function to do it upstream.
const rawSiteUrl = (process.env.SITE_URL ?? 'https://vidvathamaiiith.github.io').replace(/\/$/, '');
const siteUrl = rawSiteUrl.replace(/^(https?:\/\/)([^/]+)/i, (_, scheme, host) => scheme + host.toLowerCase());
const origin = `${siteUrl}${base === '/' ? '' : base.replace(/\/$/, '')}`;

const indexPath = join(dist, 'index.html');
if (!existsSync(indexPath)) {
  console.error('postbuild: dist/index.html is missing — did the build run?');
  process.exit(1);
}

// 1. SPA fallback.
copyFileSync(indexPath, join(dist, '404.html'));

// 2. Rewrite absolute URLs baked into the HTML head.
let html = readFileSync(indexPath, 'utf8');
html = html
  // The <noscript> fallback links are authored root-relative; on a project
  // site they need the base prefix that Vite applies to bundled assets.
  .replace(/(<noscript>[\s\S]*?<\/noscript>)/, (block) =>
    block.replace(/href="\/(docs|media)\//g, `href="${base}$1/`),
  )
  .replace(/https:\/\/vidvathamaiiith\.github\.io\/media\//g, `${origin}/media/`)
  .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${origin}/$2`)
  .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${origin}/$2`)
  .replace(/("url": ")https:\/\/vidvathamaiiith\.github\.io\/(")/, `$1${origin}/$2`);
writeFileSync(indexPath, html);
writeFileSync(join(dist, '404.html'), html);

// 3. robots.txt
writeFileSync(
  join(dist, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    '',
    '# The admin portal is a client-side editor with no indexable content.',
    `Disallow: ${base}admin`,
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n'),
);

// 4. sitemap.xml — one entry per section anchor, so deep links are discoverable.
const sections = ['about', 'research', 'current', 'publications', 'projects', 'coursework', 'experience', 'contact'];
const today = new Date().toISOString().slice(0, 10);

const urls = [
  `  <url>\n    <loc>${origin}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...sections.map(
    (id) =>
      `  <url>\n    <loc>${origin}/#${id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
  ),
];

writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
);

console.log(`postbuild: 404.html, robots.txt and sitemap.xml written for ${origin}/`);
