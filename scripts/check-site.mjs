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
  'pull_request:',
  'FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true',
  'uses: actions/checkout@v6',
  'uses: actions/setup-node@v6',
  'node-version: 24',
  'package-manager-cache: false',
  "if: github.event_name != 'pull_request'",
  'needs: validate',
  'permissions:',
  'contents: read',
  'pages: write',
  'id-token: write',
  'Ensure GitHub Pages is enabled',
  'GH_TOKEN: ${{ secrets.PAGES_TOKEN || github.token }}',
  'gh api "repos/${GITHUB_REPOSITORY}/pages" --jq',
  '--method POST',
  '--method PUT',
  '-f build_type=workflow',
  'uses: actions/upload-pages-artifact@v5',
  'include-hidden-files: true',
  'path: public',
  'uses: actions/deploy-pages@v5',
];

for (const snippet of requiredWorkflowSnippets) {
  if (!workflow.includes(snippet)) {
    throw new Error(`Missing required GitHub Pages workflow snippet: ${snippet}`);
  }
}

const validateJob = workflow.indexOf('  validate:');
const deployJob = workflow.indexOf('  deploy:');
const enableStep = workflow.indexOf('Ensure GitHub Pages is enabled');
const uploadStep = workflow.indexOf('uses: actions/upload-pages-artifact@v5');
const deployStep = workflow.indexOf('uses: actions/deploy-pages@v5');

if (!(validateJob > -1 && deployJob > validateJob && enableStep > deployJob && uploadStep > enableStep && deployStep > uploadStep)) {
  throw new Error('GitHub Pages workflow must validate first, then enable Pages, upload, and deploy from the deploy job.');
}

if (workflow.includes('actions/configure-pages')) {
  throw new Error('The workflow must not use actions/configure-pages because it fails when Pages is not enabled yet.');
}

await access(new URL('../public/.nojekyll', import.meta.url));

console.log('Static site and GitHub Pages checks passed.');
