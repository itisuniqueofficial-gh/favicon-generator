import { cp, mkdir, rm } from 'node:fs/promises';

const files = ['index.html', 'offline.html', 'assets', 'favicons', 'manifest.json', 'site.webmanifest', 'robots.txt', 'sitemap.xml', 'sw.js', '_headers', '_redirects'];

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of files) await cp(file, `dist/${file}`, { recursive: true });
console.log('Static site copied to dist');
