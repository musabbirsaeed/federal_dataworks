# Federal DataWorks Website

This repository contains the publish-ready static website for Federal DataWorks, a new data, AI, and digital transformation consultancy.

## Publish on GitHub Pages

The site is deployed from the files in [`public/`](public/) by the GitHub Actions workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

To publish it:

1. In the GitHub repository, go to **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push changes to the `main` branch, or run the **Publish GitHub Pages** workflow manually from the **Actions** tab. Pull requests run validation only and do not deploy.
4. After the workflow finishes, GitHub will show the public Pages URL in **Settings → Pages** and in the workflow deployment summary.

If the first deploy reports that Pages cannot be enabled, either complete steps 1–2 manually or add a repository secret named `PAGES_TOKEN` that can administer Pages for the repository, then re-run the workflow. The workflow deliberately avoids `actions/configure-pages` because that action fails with `Get Pages site failed` when Pages has not been enabled yet.

The workflow validates the static site on pull requests and pushes. For pushes to `main` or manual dispatches, a separate deploy job checks out the site, enables Pages through the GitHub REST API when needed, uploads the `public/` directory as the Pages artifact with the current Pages artifact action, and deploys it to GitHub Pages. No local web server is required.

## Site structure

- `public/index.html` — main website content.
- `public/styles.css` — responsive styles for desktop and mobile layouts.
- `public/main.js` — accessible mobile navigation behavior.
- `public/.nojekyll` — tells GitHub Pages to publish the files exactly as provided without running Jekyll.
- `docs/maryland-business-startup-documents.md` — Maryland startup checklist, worksheets, and template documents for the consulting company.

## Check the site

```bash
npm test
```

The check validates required consultancy content, in-page links, GitHub Pages publishing configuration, responsive styling, and the accessible mobile navigation behavior.
