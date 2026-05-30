import { access, readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/main.js', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
const marylandDocuments = await readFile(new URL('../docs/maryland-business-startup-documents.md', import.meta.url), 'utf8');

const requiredSnippets = [
  '<main id="main">',
  'Federal DataWorks',
  'Data, AI, and digital transformation consulting',
  'hello@federaldataworks.com',
  'id="about"',
  'id="services"',
  'id="approach"',
  'id="industries"',
  'id="contact"',
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

const retiredWorkshopSnippets = [
  'Workshop',
  'April 21',
  'April 22',
  'April 23',
  'View program',
  'Plan your visit',
  'dataworks@testscience.org',
];

for (const snippet of retiredWorkshopSnippets) {
  if (html.includes(snippet)) {
    throw new Error(`Retired workshop-specific content is still present: ${snippet}`);
  }
}


const requiredMarylandDocumentSnippets = [
  'Maryland Business Startup Document Packet for Federal DataWorks',
  'Master business information sheet',
  'Maryland formation filing worksheet (SDAT)',
  'Business identification number tracker',
  'FEIN / EIN preparation worksheet',
  'Maryland tax and insurance account registration worksheet',
  'License and permit due diligence worksheet',
  'Insurance planning worksheet',
  'Employee benefits and health insurance planning worksheet',
  'Single-member LLC operating agreement template',
  'Initial company resolutions template',
  'Bank account opening packet',
  'Startup filing sequence for Federal DataWorks',
  'https://businessexpress.maryland.gov/start/register-a-business-in-maryland',
];

for (const snippet of requiredMarylandDocumentSnippets) {
  if (!marylandDocuments.includes(snippet)) {
    throw new Error(`Missing required Maryland startup document snippet: ${snippet}`);
  }
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
