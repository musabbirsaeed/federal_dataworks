import { access, readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/main.js', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');

const requiredSnippets = [
  '<main id="main">',
  'Federal DATAWorks',
  'April 21–23, 2026',
  'dataworks@testscience.org',
  'id="overview"',
  'id="program"',
  'id="logistics"',
  'id="awards"',
  'id="organizers"',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    throw new Error(`Missing required HTML snippet: ${snippet}`);
  }
}

const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
const localHashes = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
for (const hash of localHashes) {
  if (!ids.has(hash)) {
    throw new Error(`Broken in-page link: #${hash}`);
  }
}

if (!css.includes('@media (max-width: 900px)')) {
  throw new Error('Responsive navigation breakpoint is missing.');
}

if (!js.includes('aria-expanded')) {
  throw new Error('Navigation accessibility behavior is missing.');
}

const requiredWorkflowSnippets = [
  'uses: actions/configure-pages@v5',
  'uses: actions/upload-pages-artifact@v3',
  'path: public',
  'uses: actions/deploy-pages@v4',
  'pages: write',
  'id-token: write',
];

for (const snippet of requiredWorkflowSnippets) {
  if (!workflow.includes(snippet)) {
    throw new Error(`Missing required GitHub Pages workflow snippet: ${snippet}`);
  }
}

await access(new URL('../public/.nojekyll', import.meta.url));

console.log('Static site and GitHub Pages checks passed.');
